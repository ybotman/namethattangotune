#!/usr/bin/env python3
"""
Merge new songs directly into djSongsWeighted.json

Since djSongs.json doesn't have ratings for existing songs,
we merge directly into the weighted file.
"""

import json
from datetime import datetime
from pathlib import Path

NEW_SONGS_FILE = Path(__file__).parent / 'new_songs_import.json'
NTTT_DIR = Path(__file__).parent.parent / 'NTTT' / 'public' / 'songData'
WEIGHTED_FILE = NTTT_DIR / 'djSongsWeighted.json'
BACKUP_FILE = NTTT_DIR / f'djSongsWeighted_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'


def normalize_key(title, orchestra):
    """Create normalized key for duplicate detection."""
    t = (title or "").strip().lower()
    o = (orchestra or "").strip().lower()
    return f"{o}::{t}"


def calculate_weight(rating, plays):
    """Calculate song weight for quiz selection."""
    base = {3: 1, 4: 3, 5: 5}.get(rating, 1)
    play_bonus = min(plays // 2, 10)
    return base + play_bonus


def main():
    # Load files
    print(f"Loading {NEW_SONGS_FILE}...")
    with open(NEW_SONGS_FILE, 'r', encoding='utf-8') as f:
        new_data = json.load(f)
    new_songs = new_data.get('songs', [])
    print(f"  {len(new_songs)} new songs")

    print(f"Loading {WEIGHTED_FILE}...")
    with open(WEIGHTED_FILE, 'r', encoding='utf-8') as f:
        weighted_data = json.load(f)
    existing_songs = weighted_data.get('songs', [])
    print(f"  {len(existing_songs)} existing songs")

    # Build lookup sets
    existing_ids = {s['SongID'] for s in existing_songs}
    existing_keys = {normalize_key(s.get('Title'), s.get('Orchestra') or s.get('ArtistMaster')) for s in existing_songs}

    # Process new songs
    to_add = []
    duplicates = []

    for song in new_songs:
        song_id = song['SongID']
        title = song.get('Title', '')
        orchestra = song.get('Orchestra', '') or song.get('ArtistMaster', '')
        key = normalize_key(title, orchestra)

        if song_id in existing_ids or key in existing_keys:
            duplicates.append(song)
            continue

        # Clean and prepare song for weighted file
        clean_song = {k: v for k, v in song.items() if not k.startswith('_')}

        # Ensure required fields
        rating = clean_song.get('Rating', 4)
        plays = clean_song.get('TimesPlayed', 0)
        clean_song['Rating'] = rating
        clean_song['TimesPlayed'] = plays
        clean_song['Weight'] = calculate_weight(rating, plays)
        clean_song['PriorityTier'] = 'B' if rating == 4 else ('A' if rating == 5 else 'C')
        clean_song['HasSinger'] = bool(clean_song.get('Singer'))

        # Set defaults for missing fields
        clean_song.setdefault('doNotPlay', False)
        clean_song.setdefault('dnpReason', None)
        clean_song.setdefault('dnpNotes', None)
        clean_song.setdefault('recognitionScore', 0.3)  # Will be recalculated
        clean_song.setdefault('recognitionTier', 4)  # Will be recalculated
        clean_song.setdefault('orchestraLevel', 3)  # Default level

        to_add.append(clean_song)
        existing_ids.add(song_id)
        existing_keys.add(key)

    print(f"\n=== Summary ===")
    print(f"New songs to add: {len(to_add)}")
    print(f"Duplicates skipped: {len(duplicates)}")

    if not to_add:
        print("No new songs to add.")
        return

    # Backup
    print(f"\nCreating backup: {BACKUP_FILE}")
    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        json.dump(weighted_data, f, ensure_ascii=False, indent=2)

    # Merge
    print(f"Merging {len(to_add)} songs...")
    existing_songs.extend(to_add)
    weighted_data['songs'] = existing_songs

    # Save
    print(f"Saving to {WEIGHTED_FILE}...")
    with open(WEIGHTED_FILE, 'w', encoding='utf-8') as f:
        json.dump(weighted_data, f, ensure_ascii=False, indent=2)

    print(f"\n=== Complete ===")
    print(f"Previous count: {len(existing_songs) - len(to_add)}")
    print(f"Added: {len(to_add)}")
    print(f"New total: {len(existing_songs)}")


if __name__ == "__main__":
    main()
