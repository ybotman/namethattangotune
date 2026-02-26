#!/usr/bin/env python3
"""
Enrich djSongs.json with rating, timesplayed, and recognitionScore from djLibrary.
Uses djTangoSongs.json as the bridge (has djId linking to djLibrary).
"""

import json
import math
from pathlib import Path

BASE_DIR = Path(__file__).parent

def load_json(filename):
    with open(BASE_DIR / filename, 'r') as f:
        return json.load(f)

def save_json(data, filename):
    with open(BASE_DIR / filename, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_recognition_score(rating, plays, orch_level, max_plays):
    """
    Calculate recognition score based on proposal formula.

    score = (0.35 * normStars) + (0.45 * normPlays) + (0.20 * orchBonus)
    """
    # Normalize rating (1-5 -> 0-1, treat 0/unrated as 2.5)
    effective_rating = rating if rating > 0 else 2.5
    norm_stars = (effective_rating - 1) / 4

    # Normalize plays (log-scaled)
    if max_plays > 0:
        norm_plays = math.log(plays + 1) / math.log(max_plays + 1)
    else:
        norm_plays = 0

    # Orchestra bonus by level
    orch_bonus_map = {
        1: 1.0,
        2: 0.7,
        3: 0.4,
        4: 0.2,
    }
    orch_bonus = orch_bonus_map.get(orch_level, 0)

    # Weighted score
    score = (0.35 * norm_stars) + (0.45 * norm_plays) + (0.20 * orch_bonus)
    return round(score, 4)

def get_recognition_tier(score):
    """Map score to tier (1-5)."""
    if score > 0.80:
        return 1  # Essential
    elif score > 0.60:
        return 2  # Core
    elif score > 0.40:
        return 3  # Familiar
    elif score > 0.20:
        return 4  # Learning
    else:
        return 5  # Discovery

def main():
    print("Loading data files...")

    # Load all data
    dj_songs_data = load_json('djSongs.json')
    dj_songs = dj_songs_data['songs']
    dj_tango = load_json('djTangoSongs.json')
    dj_library = load_json('djLibrary.json')
    artist_master = load_json('ArtistMaster.json')

    print(f"  djSongs: {len(dj_songs)}")
    print(f"  djTangoSongs: {len(dj_tango)}")
    print(f"  djLibrary: {len(dj_library)}")
    print(f"  ArtistMaster: {len(artist_master)}")

    # Build lookup: djId -> {rating, timesplayed}
    library_lookup = {}
    for item in dj_library:
        library_lookup[item['id']] = {
            'rating': item.get('rating', 0),
            'timesplayed': item.get('timesplayed', 0)
        }

    # Build lookup: songID -> djId
    tango_lookup = {}
    for item in dj_tango:
        tango_lookup[item['songID']] = item.get('djId')

    # Build lookup: orchestra -> level
    orch_level_lookup = {}
    for item in artist_master:
        if item.get('level'):
            try:
                orch_level_lookup[item['artist']] = int(item['level'])
            except (ValueError, TypeError):
                pass

    print(f"\nOrchestra levels found: {len(orch_level_lookup)}")

    # Find max plays for normalization
    max_plays = 0
    for song in dj_songs:
        song_id = song.get('SongID')
        dj_id = tango_lookup.get(song_id)
        if dj_id and dj_id in library_lookup:
            plays = library_lookup[dj_id]['timesplayed']
            if plays > max_plays:
                max_plays = plays

    print(f"Max plays: {max_plays}")

    # Enrich songs
    enriched_count = 0
    rated_count = 0
    played_count = 0

    for song in dj_songs:
        song_id = song.get('SongID')
        dj_id = tango_lookup.get(song_id)

        # Get rating and plays from library
        rating = 0
        plays = 0
        if dj_id and dj_id in library_lookup:
            rating = library_lookup[dj_id]['rating']
            plays = library_lookup[dj_id]['timesplayed']
            enriched_count += 1
            if rating > 0:
                rated_count += 1
            if plays > 0:
                played_count += 1

        # Get orchestra level
        orchestra = song.get('Orchestra', '')
        artist_master_name = song.get('ArtistMaster', '')
        orch_level = orch_level_lookup.get(artist_master_name) or orch_level_lookup.get(orchestra)

        # Calculate recognition score
        score = calculate_recognition_score(rating, plays, orch_level, max_plays)
        tier = get_recognition_tier(score)

        # Add fields to song
        song['rating'] = rating
        song['timesplayed'] = plays
        song['orchestraLevel'] = orch_level
        song['recognitionScore'] = score
        song['recognitionTier'] = tier

    # Print stats
    print(f"\nEnrichment stats:")
    print(f"  Linked to library: {enriched_count}/{len(dj_songs)}")
    print(f"  With rating > 0: {rated_count}")
    print(f"  With plays > 0: {played_count}")

    # Tier distribution
    tier_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for song in dj_songs:
        tier = song.get('recognitionTier', 5)
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

    print(f"\nRecognition tier distribution:")
    tier_names = {1: 'Essential', 2: 'Core', 3: 'Familiar', 4: 'Learning', 5: 'Discovery'}
    for tier, count in sorted(tier_counts.items()):
        print(f"  Tier {tier} ({tier_names[tier]}): {count}")

    # Top 20 by recognition score
    print(f"\nTop 20 by recognition score:")
    sorted_songs = sorted(dj_songs, key=lambda s: s.get('recognitionScore', 0), reverse=True)
    for song in sorted_songs[:20]:
        print(f"  {song['recognitionScore']:.3f} | {song['Title']} - {song['Orchestra']} | plays:{song['timesplayed']} rating:{song['rating']}")

    # Save enriched data
    save_json(dj_songs_data, 'djSongs_enriched.json')
    print(f"\nSaved to djSongs_enriched.json")

    # Also save to NTTT public folder for the app
    nttt_path = BASE_DIR.parent / 'NTTT' / 'public' / 'songData' / 'djSongs_enriched.json'
    save_json(dj_songs_data, nttt_path)
    print(f"Saved to {nttt_path}")

if __name__ == '__main__':
    main()
