#!/usr/bin/env python3
"""
Batch Vocal Detection for NEW Songs (from new_songs_import.json)

Processes new songs and appends results to vocalAnalysis.json.
Works with local files OR Azure blob (after upload).

Usage:
    python batch_process_new.py --local     # Process from local files
    python batch_process_new.py --azure     # Process from Azure (after upload)
    python batch_process_new.py --dry-run   # Show what would be processed
"""

import os
import sys
import json
import tempfile
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    import whisper
except ImportError:
    print("Error: whisper not installed. Run: pip install openai-whisper")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)


# Configuration
AZURE_BASE = "https://nttt.blob.core.windows.net/v20"
MUSIC_RIPS_DIR = os.path.expanduser("~/tunes/tango/MusicRips")
NEW_SONGS_FILE = Path(__file__).parent.parent / 'new_songs_import.json'
OUTPUT_FILE = Path(__file__).parent / 'vocalAnalysis.json'
PROGRESS_FILE = Path(__file__).parent / 'batch_progress_new.json'

# Threshold for singer detection (percentage of vocal time)
SINGER_THRESHOLD = 15.0

# Directory mapping for local files
DIR_MAP = {
    "main": MUSIC_RIPS_DIR,
    "gaps": os.path.join(MUSIC_RIPS_DIR, "gaps"),
    "primitivo": os.path.join(MUSIC_RIPS_DIR, "oldguard/primitivo"),
    "guardia_vieja": os.path.join(MUSIC_RIPS_DIR, "oldguard/guardia_vieja"),
    "guardia_nueva": os.path.join(MUSIC_RIPS_DIR, "oldguard/guardia_nueva"),
    "gardel": os.path.join(MUSIC_RIPS_DIR, "oldguard/gardel"),
    "early_golden": os.path.join(MUSIC_RIPS_DIR, "oldguard/early_golden"),
}


def download_audio(url: str, output_path: str, timeout: int = 60) -> bool:
    """Download audio file from URL."""
    try:
        response = requests.get(url, stream=True, timeout=timeout)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    Download failed: {e}")
        return False


def get_local_path(song: dict) -> Optional[str]:
    """Get local file path from song metadata."""
    source_dir = song.get("_sourceDir", "main")
    filename = song.get("_originalFile")

    if not filename:
        return None

    base_dir = DIR_MAP.get(source_dir, MUSIC_RIPS_DIR)
    filepath = os.path.join(base_dir, filename)

    if os.path.exists(filepath):
        return filepath
    return None


def analyze_audio(audio_path: str, model) -> dict:
    """Analyze audio file for vocals using Whisper."""
    result = model.transcribe(
        audio_path,
        language='es',
        word_timestamps=True,
        verbose=False
    )

    segments = []
    total_vocal_time = 0

    for seg in result.get('segments', []):
        start = seg['start']
        end = seg['end']
        text = seg.get('text', '').strip()

        if text and len(text) > 2:
            duration = end - start
            total_vocal_time += duration
            segments.append({
                'start': round(start, 1),
                'end': round(end, 1),
                'duration': round(duration, 1),
                'text': text[:50]
            })

    total_duration = max(s['end'] for s in segments) if segments else 0
    if not segments and result.get('segments'):
        total_duration = max(s['end'] for s in result['segments'])

    vocal_pct = (total_vocal_time / total_duration * 100) if total_duration > 0 else 0

    # Merge adjacent segments (within 5 seconds)
    merged = merge_segments(segments)

    # Get lyrics preview
    full_text = ' '.join([s['text'] for s in segments])
    lyrics_preview = full_text[:100] if full_text else ""

    return {
        'hasSinger': bool(vocal_pct > SINGER_THRESHOLD),
        'vocalSegments': merged,
        'totalVocalTime': round(total_vocal_time, 1),
        'totalDuration': round(total_duration, 1),
        'vocalPercentage': round(vocal_pct, 1),
        'segmentCount': len(merged),
        'lyricsPreview': lyrics_preview,
        'analysisVersion': 'whisper-1.0',
        'analyzedAt': datetime.now().isoformat()
    }


def merge_segments(segments: list, gap_threshold: float = 5.0) -> list:
    """Merge adjacent vocal segments if gap is less than threshold."""
    if not segments:
        return []

    merged = [segments[0].copy()]

    for seg in segments[1:]:
        gap = seg['start'] - merged[-1]['end']
        if gap <= gap_threshold:
            merged[-1]['end'] = seg['end']
            merged[-1]['duration'] = round(merged[-1]['end'] - merged[-1]['start'], 1)
            merged[-1]['text'] += ' ' + seg['text']
        else:
            merged.append(seg.copy())

    return merged


def load_existing_analysis() -> dict:
    """Load existing vocal analysis data."""
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_analysis(data: dict):
    """Save vocal analysis data."""
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    parser = argparse.ArgumentParser(description='Vocal detection for new songs')
    parser.add_argument('--local', action='store_true', help='Process from local files')
    parser.add_argument('--azure', action='store_true', help='Process from Azure blob')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be processed')
    args = parser.parse_args()

    if not args.local and not args.azure and not args.dry_run:
        print("Error: Specify --local, --azure, or --dry-run")
        parser.print_help()
        sys.exit(1)

    # Load new songs
    if not NEW_SONGS_FILE.exists():
        print(f"Error: {NEW_SONGS_FILE} not found. Run import_new_songs.py first.")
        sys.exit(1)

    with open(NEW_SONGS_FILE, 'r', encoding='utf-8') as f:
        import_data = json.load(f)

    songs = import_data.get('songs', [])
    print(f"Found {len(songs)} songs to process")

    if args.dry_run:
        print("\nDry run - would process:")
        for song in songs:
            source = "LOCAL" if args.local or get_local_path(song) else "AZURE"
            print(f"  [{source}] {song.get('Title')} - {song.get('ArtistMaster')}")
        return

    # Load existing analysis
    existing = load_existing_analysis()
    print(f"Existing analysis: {len(existing)} songs")

    # Filter to only unanalyzed songs
    to_process = [s for s in songs if s['SongID'] not in existing]
    print(f"New songs to analyze: {len(to_process)}")

    if not to_process:
        print("All songs already analyzed!")
        return

    # Load Whisper model
    print("\nLoading Whisper model (base)...")
    model = whisper.load_model("base")
    print("Model loaded.")

    # Process songs
    processed = 0
    failed = []

    for i, song in enumerate(to_process):
        song_id = song['SongID']
        title = song.get('Title', 'Unknown')
        artist = song.get('ArtistMaster', '') or song.get('Singer', 'Unknown')

        print(f"\n[{i+1}/{len(to_process)}] {artist} - {title}")

        # Get audio file
        audio_path = None
        temp_file = None

        if args.local:
            audio_path = get_local_path(song)
            if not audio_path:
                print(f"  Local file not found, skipping")
                failed.append({'id': song_id, 'title': title, 'reason': 'local file not found'})
                continue
            print(f"  Source: {audio_path}")
        else:
            # Download from Azure
            url = f"{AZURE_BASE}/{song_id}.mp3"
            temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
            temp_file.close()
            audio_path = temp_file.name

            print(f"  Downloading from Azure...")
            if not download_audio(url, audio_path):
                failed.append({'id': song_id, 'title': title, 'reason': 'download failed'})
                os.unlink(audio_path)
                continue

        # Analyze
        try:
            print(f"  Analyzing with Whisper...")
            result = analyze_audio(audio_path, model)
            result['songID'] = song_id

            # Add to existing data
            existing[song_id] = result
            processed += 1

            status = "SINGER" if result['hasSinger'] else "INSTRUMENTAL"
            print(f"  Result: {status} ({result['vocalPercentage']:.1f}% vocal)")

            # Save periodically
            if processed % 5 == 0:
                save_analysis(existing)
                print(f"  [Checkpoint saved: {processed} songs]")

        except Exception as e:
            print(f"  Analysis failed: {e}")
            failed.append({'id': song_id, 'title': title, 'reason': str(e)})
        finally:
            if temp_file:
                os.unlink(audio_path)

    # Final save
    save_analysis(existing)

    print(f"\n{'=' * 60}")
    print(f"=== Complete ===")
    print(f"{'=' * 60}")
    print(f"Processed: {processed}")
    print(f"Failed: {len(failed)}")
    print(f"Total in analysis: {len(existing)}")

    if failed:
        print(f"\nFailed songs:")
        for f in failed:
            print(f"  - {f['title']}: {f['reason']}")


if __name__ == "__main__":
    main()
