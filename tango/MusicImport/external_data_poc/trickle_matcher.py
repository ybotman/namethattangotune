#!/usr/bin/env python3
"""
trickle_matcher.py - Background rate-limited matcher against external tango databases

This script slowly processes songs from djSongsWeighted.json against:
- tango.info (open database)
- el-recodo.com (rate-limited, optional login)
- TangoLink famous list (curated reference)

DESIGNED FOR RESTARTABILITY:
- Progress saved after each song to progress.json
- Results accumulated in match_results.json
- Can stop/restart anytime - picks up where it left off
- Rate limits: 5-10 seconds between requests

USAGE:
    # Start/resume processing
    python trickle_matcher.py

    # Process specific number of songs
    python trickle_matcher.py --count 50

    # Reset and start over
    python trickle_matcher.py --reset

    # Run in background
    nohup python trickle_matcher.py > trickle.log 2>&1 &
"""

import json
import time
import argparse
import sys
from pathlib import Path
from datetime import datetime

# Import our matchers
from match_tango_info import TangoInfoMatcher
from match_el_recodo import ElRecodoMatcher

# Paths
SCRIPT_DIR = Path(__file__).parent
PROGRESS_FILE = SCRIPT_DIR / "progress.json"
RESULTS_FILE = SCRIPT_DIR / "match_results.json"
DJ_SONGS_FILE = SCRIPT_DIR.parent.parent / "NTTT" / "public" / "songData" / "djSongsWeighted.json"

# Also check MusicImport location
if not DJ_SONGS_FILE.exists():
    DJ_SONGS_FILE = SCRIPT_DIR.parent / "djSongsWeighted.json"

# Rate limiting (seconds between requests)
DELAY_TANGO_INFO = 2.0
DELAY_EL_RECODO = 5.0  # More conservative
DELAY_BETWEEN_SONGS = 3.0


class TrickleMatcher:
    """Rate-limited background matcher with progress tracking."""

    def __init__(self):
        self.tango_info = TangoInfoMatcher()
        self.el_recodo = ElRecodoMatcher()
        self.progress = self._load_progress()
        self.results = self._load_results()

    def _load_progress(self):
        """Load progress from file or create new."""
        if PROGRESS_FILE.exists():
            with open(PROGRESS_FILE) as f:
                return json.load(f)
        return {
            'last_index': -1,
            'total_songs': 0,
            'processed': 0,
            'matched_tango_info': 0,
            'matched_el_recodo': 0,
            'errors': 0,
            'started_at': None,
            'last_updated': None,
        }

    def _save_progress(self):
        """Save progress to file."""
        self.progress['last_updated'] = datetime.now().isoformat()
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(self.progress, f, indent=2)

    def _load_results(self):
        """Load existing results or create new."""
        if RESULTS_FILE.exists():
            with open(RESULTS_FILE) as f:
                return json.load(f)
        return {'songs': {}, 'metadata': {}}

    def _save_results(self):
        """Save results to file."""
        self.results['metadata']['last_updated'] = datetime.now().isoformat()
        self.results['metadata']['total_matched'] = len([
            s for s in self.results['songs'].values()
            if s.get('tango_info', {}).get('matched') or s.get('el_recodo', {}).get('matched')
        ])
        with open(RESULTS_FILE, 'w') as f:
            json.dump(self.results, f, indent=2)

    def _load_songs(self):
        """Load songs from djSongsWeighted.json."""
        if not DJ_SONGS_FILE.exists():
            print(f"ERROR: Cannot find djSongsWeighted.json at {DJ_SONGS_FILE}")
            sys.exit(1)

        with open(DJ_SONGS_FILE) as f:
            data = json.load(f)
        return data.get('songs', [])

    def process_song(self, song, skip_el_recodo=False):
        """
        Process a single song against external databases.

        Args:
            song: Song dict from djSongsWeighted
            skip_el_recodo: Skip el-recodo (if rate limited)

        Returns:
            dict with match results
        """
        song_id = song.get('SongID')
        title = song.get('Title', '')
        orchestra = song.get('ArtistMaster', '')
        year = song.get('Year')

        if year:
            try:
                year = int(year)
            except:
                year = None

        result = {
            'song_id': song_id,
            'title': title,
            'orchestra': orchestra,
            'year': year,
            'tango_info': None,
            'el_recodo': None,
            'processed_at': datetime.now().isoformat(),
        }

        # Match against tango.info
        print(f"\n[tango.info] {title} / {orchestra}")
        try:
            ti_result = self.tango_info.search(title, orchestra, year)
            result['tango_info'] = {
                'matched': ti_result.get('matched', False),
                'url': ti_result.get('url'),
                'tinp': ti_result.get('tinp'),
                'score': ti_result.get('best_match', {}).get('score') if ti_result.get('best_match') else None,
            }
            if ti_result.get('matched'):
                self.progress['matched_tango_info'] += 1
                print(f"  ✓ Match: {ti_result.get('url')}")
            else:
                print(f"  ✗ No match")
        except Exception as e:
            print(f"  ERROR: {e}")
            result['tango_info'] = {'matched': False, 'error': str(e)}

        time.sleep(DELAY_TANGO_INFO)

        # Match against el-recodo (unless skipped)
        if not skip_el_recodo:
            print(f"[el-recodo] {title} / {orchestra}")
            try:
                er_result = self.el_recodo.search(title, orchestra, year)
                result['el_recodo'] = {
                    'matched': er_result.get('matched', False),
                    'url': er_result.get('url'),
                    'recording_id': er_result.get('recording_id'),
                    'danceability': er_result.get('danceability'),
                    'score': er_result.get('best_match', {}).get('score') if er_result.get('best_match') else None,
                }
                if er_result.get('matched'):
                    self.progress['matched_el_recodo'] += 1
                    print(f"  ✓ Match: {er_result.get('url')}")
                else:
                    print(f"  ✗ No match")
            except Exception as e:
                print(f"  ERROR: {e}")
                result['el_recodo'] = {'matched': False, 'error': str(e)}

            time.sleep(DELAY_EL_RECODO)

        return result

    def run(self, max_count=None, skip_el_recodo=False):
        """
        Run the trickle matcher.

        Args:
            max_count: Max songs to process (None = all)
            skip_el_recodo: Skip el-recodo queries
        """
        songs = self._load_songs()
        total = len(songs)

        self.progress['total_songs'] = total
        if not self.progress['started_at']:
            self.progress['started_at'] = datetime.now().isoformat()

        start_index = self.progress['last_index'] + 1
        processed_this_run = 0

        print(f"\n{'='*60}")
        print(f"TRICKLE MATCHER - Rate-Limited External Database Matching")
        print(f"{'='*60}")
        print(f"Total songs: {total}")
        print(f"Already processed: {start_index}")
        print(f"Remaining: {total - start_index}")
        if max_count:
            print(f"Will process: {min(max_count, total - start_index)}")
        print(f"Skip el-recodo: {skip_el_recodo}")
        print(f"{'='*60}\n")

        try:
            for i in range(start_index, total):
                if max_count and processed_this_run >= max_count:
                    print(f"\nReached max count ({max_count}). Stopping.")
                    break

                song = songs[i]
                song_id = song.get('SongID')

                # Skip if already processed
                if song_id in self.results['songs']:
                    print(f"[{i+1}/{total}] SKIP (already done): {song.get('Title')}")
                    self.progress['last_index'] = i
                    self._save_progress()
                    continue

                print(f"\n[{i+1}/{total}] Processing: {song.get('Title')} / {song.get('ArtistMaster')}")

                result = self.process_song(song, skip_el_recodo=skip_el_recodo)
                self.results['songs'][song_id] = result

                self.progress['last_index'] = i
                self.progress['processed'] += 1
                processed_this_run += 1

                # Save after each song (restartability)
                self._save_progress()
                self._save_results()

                # Delay before next song
                time.sleep(DELAY_BETWEEN_SONGS)

        except KeyboardInterrupt:
            print(f"\n\nInterrupted! Progress saved. Run again to continue.")

        finally:
            self._save_progress()
            self._save_results()
            self._print_summary()

    def _print_summary(self):
        """Print summary of progress."""
        print(f"\n{'='*60}")
        print("SUMMARY")
        print(f"{'='*60}")
        print(f"Total songs:         {self.progress['total_songs']}")
        print(f"Processed:           {self.progress['processed']}")
        print(f"Matched (tango.info): {self.progress['matched_tango_info']}")
        print(f"Matched (el-recodo):  {self.progress['matched_el_recodo']}")
        print(f"Progress file:       {PROGRESS_FILE}")
        print(f"Results file:        {RESULTS_FILE}")
        print(f"{'='*60}")

    def reset(self):
        """Reset progress and results."""
        if PROGRESS_FILE.exists():
            PROGRESS_FILE.unlink()
        if RESULTS_FILE.exists():
            RESULTS_FILE.unlink()
        print("Progress and results reset.")


def main():
    parser = argparse.ArgumentParser(description='Rate-limited external database matcher')
    parser.add_argument('--count', type=int, help='Max songs to process')
    parser.add_argument('--reset', action='store_true', help='Reset progress and start over')
    parser.add_argument('--skip-el-recodo', action='store_true', help='Skip el-recodo (just tango.info)')
    parser.add_argument('--status', action='store_true', help='Show progress status and exit')

    args = parser.parse_args()

    matcher = TrickleMatcher()

    if args.reset:
        matcher.reset()
        return

    if args.status:
        matcher._print_summary()
        return

    matcher.run(max_count=args.count, skip_el_recodo=args.skip_el_recodo)


if __name__ == "__main__":
    main()
