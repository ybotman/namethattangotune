#!/usr/bin/env python3
"""
Merge new songs from new_songs_import.json into djSongs.json

Checks for duplicates by:
1. SongID match
2. Title + Orchestra match (case-insensitive)

Usage:
    python merge_new_songs.py --dry-run   # Show what would be merged
    python merge_new_songs.py             # Actually merge
"""

import json
import argparse
from datetime import datetime
from pathlib import Path

# Configuration
NEW_SONGS_FILE = Path(__file__).parent / 'new_songs_import.json'
DJ_SONGS_FILE = Path(__file__).parent / 'djSongs.json'
BACKUP_FILE = Path(__file__).parent / f'djSongs_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
OUTPUT_FILE = DJ_SONGS_FILE  # Overwrite in place


def load_json(filepath):
    """Load JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    """Save JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_key(title, orchestra):
    """Create normalized key for duplicate detection."""
    t = (title or "").strip().lower()
    o = (orchestra or "").strip().lower()
    return f"{o}::{t}"


def main():
    parser = argparse.ArgumentParser(description='Merge new songs into djSongs.json')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be merged')
    args = parser.parse_args()

    # Load files
    print(f"Loading {NEW_SONGS_FILE}...")
    new_data = load_json(NEW_SONGS_FILE)
    new_songs = new_data.get('songs', [])
    print(f"  {len(new_songs)} new songs")

    print(f"Loading {DJ_SONGS_FILE}...")
    dj_data = load_json(DJ_SONGS_FILE)
    existing_songs = dj_data.get('songs', [])
    print(f"  {len(existing_songs)} existing songs")

    # Build lookup sets for duplicate detection
    existing_ids = {s['SongID'] for s in existing_songs}
    existing_keys = {normalize_key(s.get('Title'), s.get('Orchestra')) for s in existing_songs}

    # Check each new song for duplicates
    to_add = []
    duplicates = []

    for song in new_songs:
        song_id = song['SongID']
        title = song.get('Title', '')
        orchestra = song.get('Orchestra', '') or song.get('ArtistMaster', '')
        key = normalize_key(title, orchestra)

        # Check for duplicate
        if song_id in existing_ids:
            duplicates.append({
                'song': song,
                'reason': 'SongID already exists',
                'existing_id': song_id
            })
        elif key in existing_keys:
            duplicates.append({
                'song': song,
                'reason': 'Title+Orchestra match exists',
                'key': key
            })
        else:
            # Clean up internal fields before adding
            clean_song = {k: v for k, v in song.items() if not k.startswith('_')}
            to_add.append(clean_song)
            # Add to lookup to prevent duplicates within new songs
            existing_ids.add(song_id)
            existing_keys.add(key)

    # Summary
    print(f"\n{'=' * 60}")
    print(f"=== Merge Summary ===")
    print(f"{'=' * 60}")
    print(f"New songs to add: {len(to_add)}")
    print(f"Duplicates skipped: {len(duplicates)}")

    if duplicates:
        print(f"\nDuplicates:")
        for d in duplicates[:10]:  # Show first 10
            s = d['song']
            print(f"  - {s.get('Title')} ({s.get('Orchestra')}): {d['reason']}")
        if len(duplicates) > 10:
            print(f"  ... and {len(duplicates) - 10} more")

    if args.dry_run:
        print(f"\n[DRY RUN] Would add {len(to_add)} songs")
        print(f"\nSongs to add:")
        for s in to_add:
            era = s.get('Era', 'unknown')
            cancion = 'CANCION' if s.get('Cancion') == 'true' else ''
            print(f"  - {s.get('Title')} ({s.get('ArtistMaster') or s.get('Orchestra')}) [{era}] {cancion}")
        return

    # Create backup
    print(f"\nCreating backup: {BACKUP_FILE}")
    save_json(BACKUP_FILE, dj_data)

    # Merge
    print(f"Merging {len(to_add)} songs...")
    existing_songs.extend(to_add)
    dj_data['songs'] = existing_songs

    # Save
    print(f"Saving to {OUTPUT_FILE}...")
    save_json(OUTPUT_FILE, dj_data)

    print(f"\n{'=' * 60}")
    print(f"=== Complete ===")
    print(f"{'=' * 60}")
    print(f"Previous count: {len(existing_songs) - len(to_add)}")
    print(f"Added: {len(to_add)}")
    print(f"New total: {len(existing_songs)}")
    print(f"Backup: {BACKUP_FILE}")


if __name__ == "__main__":
    main()
