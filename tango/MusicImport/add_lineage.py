#!/usr/bin/env python3
"""
Add lineage tracking to djSongs.json

Schema:
- Source: Primary source/method (Mixxx, AI-GAP-Analysis-YYYY-MM-DD, Manual-Import)
- Source2: Secondary detail (BorisH, YouTube, TobyCollection, GoldenEar, etc.)

Usage:
    python add_lineage.py [--dry-run]
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime

# Files
DJ_SONGS_FILE = "djSongs.json"
TRACK_LOCATIONS_FILE = "djTrack_locations.json"
DJ_LIBRARY_FILE = "djLibrary.json"
NEW_SONGS_FILE = "new_songs_import.json"
OUTPUT_FILE = "djSongs_with_lineage.json"

# Source2 mapping based on folder patterns in track locations
SOURCE2_PATTERNS = [
    (r'azriel.?boris|boris.?h', 'BorisH'),
    (r'golden.?ear', 'GoldenEar'),
    (r'totango', 'ToTango-DJ'),
    (r'youtube', 'YouTube'),
    (r'rip', 'Rip'),
    (r'bibletango', 'BibleTango'),
    (r'tango.?dj', 'TangoDJ'),
    (r'tangotunes', 'TangoTunes'),
    (r'tango.?internacional', 'TangoInternacional'),
    (r'tickled.?tangos', 'TickledTangos'),
]


def detect_source2(path):
    """Detect Source2 from file path."""
    path_lower = path.lower()

    for pattern, source2 in SOURCE2_PATTERNS:
        if re.search(pattern, path_lower):
            return source2

    # Default based on folder structure
    if 'tangos con' in path_lower or 'tangos instrumentales' in path_lower:
        return 'TangoCollection'
    if 'mixxx' in path_lower and 'cortina' in path_lower:
        return 'Cortinas'
    if 'music' in path_lower:
        return 'TobyLibrary'

    return 'Unknown'


def load_json(filepath):
    """Load JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data, filepath):
    """Save JSON file with nice formatting."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved: {filepath}")


def normalize_text(text):
    """Normalize text for matching - remove accents, punctuation, extra spaces."""
    if not text:
        return ''
    text = text.lower().strip()
    # Remove common prefixes/suffixes
    text = re.sub(r"^(el|la|los|las|un|una)\s+", "", text)
    # Remove punctuation
    text = re.sub(r"['\"\-\.,!?()]", "", text)
    # Normalize spaces
    text = re.sub(r"\s+", " ", text)
    return text


def build_location_map(track_locations, dj_library):
    """Build map of location_id -> path and song metadata -> location."""
    # Map id -> location path
    id_to_path = {}
    for loc in track_locations:
        loc_id = loc.get('id')
        path = loc.get('location', '') or loc.get('directory', '')
        if loc_id and path:
            id_to_path[loc_id] = path

    # Map multiple keys -> location path for flexible matching
    song_to_path = {}
    for lib_song in dj_library:
        loc_id = lib_song.get('location')
        if loc_id and loc_id in id_to_path:
            path = id_to_path[loc_id]
            title = (lib_song.get('title') or '').strip().lower()
            artist = (lib_song.get('artist') or '').strip().lower()
            album_artist = (lib_song.get('album_artist') or '').strip().lower()

            if title:
                # Multiple key variations for matching
                keys = [
                    f"{artist}::{title}",
                    f"{album_artist}::{title}",
                    f"{normalize_text(artist)}::{normalize_text(title)}",
                    f"{normalize_text(album_artist)}::{normalize_text(title)}",
                    normalize_text(title),  # Title only as fallback
                ]
                for key in keys:
                    if key and key not in song_to_path:
                        song_to_path[key] = path

    return song_to_path


def find_path_for_song(song, song_to_path):
    """Try multiple matching strategies to find path for a song."""
    title = (song.get('Title') or '').strip().lower()
    orchestra = (song.get('Orchestra') or '').strip().lower()

    # Try exact match first
    keys_to_try = [
        f"{orchestra}::{title}",
        f"{normalize_text(orchestra)}::{normalize_text(title)}",
        normalize_text(title),
    ]

    for key in keys_to_try:
        if key in song_to_path:
            return song_to_path[key]

    return ''


def add_lineage_to_songs(dry_run=False):
    """Main function to add lineage to all songs."""

    print("Loading files...")
    dj_songs_data = load_json(DJ_SONGS_FILE)
    track_locations = load_json(TRACK_LOCATIONS_FILE)
    dj_library = load_json(DJ_LIBRARY_FILE)

    songs = dj_songs_data.get('songs', dj_songs_data)
    is_wrapped = 'songs' in dj_songs_data

    print(f"Songs in djSongs.json: {len(songs)}")
    print(f"Track locations: {len(track_locations)}")
    print(f"Library entries: {len(dj_library)}")

    # Build location map
    print("Building location map...")
    song_to_path = build_location_map(track_locations, dj_library)
    print(f"Mapped songs: {len(song_to_path)}")

    # Stats
    stats = {
        'total': len(songs),
        'matched': 0,
        'unmatched': 0,
        'source2_counts': {}
    }

    # Process each song
    print("Adding lineage...")
    for song in songs:
        title = (song.get('Title') or '').strip().lower()
        orchestra = (song.get('Orchestra') or '').strip().lower()

        # Try to find in location map using multiple strategies
        path = find_path_for_song(song, song_to_path)

        # All existing songs came from Mixxx
        song['Source'] = 'Mixxx'

        # Detect Source2 from path
        if path:
            source2 = detect_source2(path)
            stats['matched'] += 1
        else:
            source2 = 'Unknown'
            stats['unmatched'] += 1

        song['Source2'] = source2
        stats['source2_counts'][source2] = stats['source2_counts'].get(source2, 0) + 1

    # Print stats
    print("\n=== LINEAGE STATS ===")
    print(f"Total songs: {stats['total']}")
    print(f"Matched to path: {stats['matched']}")
    print(f"Unmatched: {stats['unmatched']}")
    print("\nSource2 breakdown:")
    for source2, count in sorted(stats['source2_counts'].items(), key=lambda x: -x[1]):
        pct = count / stats['total'] * 100
        print(f"  {source2:20s}: {count:5d} ({pct:4.1f}%)")

    if dry_run:
        print("\n[DRY RUN] No files modified")
        return

    # Save updated djSongs
    output_data = {'songs': songs} if is_wrapped else songs
    save_json(output_data, OUTPUT_FILE)

    # Also update new_songs_import.json with correct lineage
    if Path(NEW_SONGS_FILE).exists():
        print(f"\nUpdating {NEW_SONGS_FILE}...")
        new_songs_data = load_json(NEW_SONGS_FILE)
        new_songs = new_songs_data.get('songs', new_songs_data)

        for song in new_songs:
            song['Source'] = 'AI-GAP-Analysis-2026-02-27'
            song['Source2'] = 'YouTube'
            # Remove old _source fields if present
            song.pop('_source', None)
            song.pop('_sourceDir', None)

        save_json(new_songs_data, NEW_SONGS_FILE)
        print(f"Updated {len(new_songs)} songs with AI-GAP-Analysis lineage")

    print("\nDone!")
    print(f"\nNext steps:")
    print(f"  1. Review {OUTPUT_FILE}")
    print(f"  2. If good, rename to {DJ_SONGS_FILE}")


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    add_lineage_to_songs(dry_run=dry_run)
