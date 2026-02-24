#!/usr/bin/env python3
"""
Add recognitionScore and recognitionTier to djSongsWeighted.json

Recognition Tiers (percentile-based):
  1. Iconic      - Top 10%  (~470 songs)  - "Everyone knows it"
  2. Essential   - Next 20% (~935 songs)  - "Milonga staples"
  3. Familiar    - Next 30% (~1,400 songs) - "You've heard it"
  4. Challenging - Next 25% (~1,170 songs) - "Tests your ears"
  5. Deep Cuts   - Bottom 15% (~700 songs) - "DJ-level knowledge"
"""

import json
import math
from pathlib import Path

# Tier definitions with percentile thresholds
TIER_CONFIG = {
    1: {"name": "Iconic", "percentile_start": 0, "percentile_end": 10, "vibe": "Everyone knows it"},
    2: {"name": "Essential", "percentile_start": 10, "percentile_end": 30, "vibe": "Milonga staples"},
    3: {"name": "Familiar", "percentile_start": 30, "percentile_end": 60, "vibe": "You've heard it"},
    4: {"name": "Challenging", "percentile_start": 60, "percentile_end": 85, "vibe": "Tests your ears"},
    5: {"name": "Deep Cuts", "percentile_start": 85, "percentile_end": 100, "vibe": "DJ-level knowledge"},
}


def calculate_recognition_score(rating, plays, orch_level, max_plays):
    """
    Calculate recognition score based on proposal formula.
    score = (0.35 * normRating) + (0.45 * normPlays) + (0.20 * orchBonus)
    """
    # Normalize rating (3-5 in this data -> 0-1)
    norm_stars = (rating - 1) / 4 if rating else 0.5

    # Normalize plays (log-scaled)
    if max_plays > 0 and plays > 0:
        norm_plays = math.log(plays + 1) / math.log(max_plays + 1)
    else:
        norm_plays = 0

    # Orchestra bonus by level
    orch_bonus_map = {1: 1.0, 2: 0.7, 3: 0.4, 4: 0.2}
    orch_bonus = orch_bonus_map.get(orch_level, 0)

    # Weighted score
    score = (0.35 * norm_stars) + (0.45 * norm_plays) + (0.20 * orch_bonus)
    return round(score, 4)


def assign_tier_by_percentile(songs):
    """
    Assign tiers based on percentile ranking of recognition scores.
    Songs are ranked by score (highest first), then assigned to tiers.
    """
    # Sort by score descending
    sorted_songs = sorted(songs, key=lambda s: s.get('recognitionScore', 0), reverse=True)
    total = len(sorted_songs)

    for i, song in enumerate(sorted_songs):
        percentile = (i / total) * 100  # 0 = top, 100 = bottom

        # Assign tier based on percentile
        for tier_num, config in TIER_CONFIG.items():
            if config["percentile_start"] <= percentile < config["percentile_end"]:
                song['recognitionTier'] = tier_num
                break
        else:
            # Edge case: exactly 100th percentile
            song['recognitionTier'] = 5


def main():
    base_dir = Path(__file__).parent
    nttt_dir = base_dir.parent / 'NTTT' / 'public' / 'songData'

    # Load weighted songs
    with open(nttt_dir / 'djSongsWeighted.json') as f:
        data = json.load(f)
    songs = data['songs']

    # Load ArtistMaster for orchestra levels
    with open(nttt_dir / 'ArtistMaster.json') as f:
        artists = json.load(f)

    orch_levels = {}
    for a in artists:
        if a.get('level'):
            try:
                orch_levels[a['artist']] = int(a['level'])
            except (ValueError, TypeError):
                pass

    print(f"Loaded {len(songs)} songs")
    print(f"Orchestra levels: {len(orch_levels)}")

    # Find max plays
    max_plays = max(s.get('TimesPlayed', 0) for s in songs)
    print(f"Max plays: {max_plays}")

    # Calculate scores
    for song in songs:
        rating = song.get('Rating', 3)
        plays = song.get('TimesPlayed', 0)
        artist_master = song.get('ArtistMaster', '')
        orch_level = orch_levels.get(artist_master)

        score = calculate_recognition_score(rating, plays, orch_level, max_plays)
        song['recognitionScore'] = score
        song['orchestraLevel'] = orch_level

    # Assign tiers based on percentile ranking
    assign_tier_by_percentile(songs)

    # Stats
    tier_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for song in songs:
        tier_counts[song['recognitionTier']] += 1

    print("\nRecognition tier distribution:")
    for tier_num, count in sorted(tier_counts.items()):
        config = TIER_CONFIG[tier_num]
        pct = (count / len(songs)) * 100
        print(f"  {tier_num}. {config['name']:12} : {count:5} songs ({pct:.1f}%) - {config['vibe']}")

    # Top 20 by score
    print("\nTop 20 (Iconic tier samples):")
    sorted_songs = sorted(songs, key=lambda s: s['recognitionScore'], reverse=True)
    for s in sorted_songs[:20]:
        print(f"  {s['recognitionScore']:.3f} | {s['Title']} - {s['ArtistMaster']} | plays:{s.get('TimesPlayed',0)} rating:{s.get('Rating')}")

    # Bottom 10 (Deep Cuts samples)
    print("\nBottom 10 (Deep Cuts samples):")
    for s in sorted_songs[-10:]:
        print(f"  {s['recognitionScore']:.3f} | {s['Title']} - {s['ArtistMaster']} | plays:{s.get('TimesPlayed',0)} rating:{s.get('Rating')}")

    # Save
    output_path = nttt_dir / 'djSongsWeighted.json'
    with open(output_path, 'w') as f:
        json.dump(data, f)
    print(f"\nSaved to {output_path}")


if __name__ == '__main__':
    main()
