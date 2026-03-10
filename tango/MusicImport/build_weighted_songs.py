#!/usr/bin/env python3
"""
Build djSongsWeighted.json from djSongs.json

- Filters to 3-5 star songs (Rating >= 3)
- Adds Weight field based on rating + play count
- Copies to NTTT public folder
"""

import json
from pathlib import Path

INPUT_FILE = Path(__file__).parent / 'djSongs.json'
NTTT_DIR = Path(__file__).parent.parent / 'NTTT' / 'public' / 'songData'
OUTPUT_FILE = NTTT_DIR / 'djSongsWeighted.json'


def calculate_weight(rating, plays):
    """
    Calculate song weight for quiz selection.
    Higher weight = more likely to appear.

    Weight formula:
    - Base from rating: 3=1, 4=3, 5=5
    - Bonus from plays: +1 per 2 plays, max +10
    """
    base = {3: 1, 4: 3, 5: 5}.get(rating, 1)
    play_bonus = min(plays // 2, 10)
    return base + play_bonus


def main():
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    songs = data.get('songs', [])
    print(f"  Total songs: {len(songs)}")

    # Filter by rating (3-5 stars)
    filtered = []
    for song in songs:
        rating = song.get('Rating', 0)
        if isinstance(rating, str):
            try:
                rating = int(rating)
            except:
                rating = 0

        if rating >= 3:
            # Add weight
            plays = song.get('TimesPlayed', 0)
            if isinstance(plays, str):
                try:
                    plays = int(plays)
                except:
                    plays = 0

            song['Weight'] = calculate_weight(rating, plays)
            song['Rating'] = rating  # Ensure it's an int
            song['TimesPlayed'] = plays  # Ensure it's an int
            filtered.append(song)

    print(f"  Filtered (3+ stars): {len(filtered)}")

    # Sort by weight descending for inspection
    filtered.sort(key=lambda s: s.get('Weight', 0), reverse=True)

    # Save
    output_data = {'songs': filtered}

    print(f"Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\nComplete!")
    print(f"  Output: {OUTPUT_FILE}")
    print(f"  Songs: {len(filtered)}")


if __name__ == "__main__":
    main()
