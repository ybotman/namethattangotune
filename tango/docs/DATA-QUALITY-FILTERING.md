# Data Quality & Game Filtering

## Overview

The song database (`djSongsWeighted.json`) contains ~4,675 songs with varying metadata completeness. Games must filter for the data they need.

## Data Quality Stats

| Field | Has Data | Missing | Notes |
|-------|----------|---------|-------|
| ArtistMaster (orchestra) | 3,370 (72%) | 1,305 (28%) | Boris import missing |
| Singer | ~2,500 | ~2,175 | Instrumental = no singer |
| Style | 4,675 (100%) | 0 | Always present |
| Year | ~4,400 | ~275 | Most have year |
| Recognition Tier | 4,675 (100%) | 0 | Computed from plays/stars |

## Missing Orchestra Analysis

The 1,305 songs missing `ArtistMaster` came from Boris import:

| Era | Count | Notes |
|-----|-------|-------|
| Pre-1945 (golden age) | 541 | Should have orchestra - data issue |
| 1945-1999 | 282 | Mixed era |
| 2000+ (modern) | 261 | Studio albums, often no singer either |
| No year | 221 | Unknown |

Many pre-1945 songs have singer data (Roberto Ray, Mariano Balcarce, etc.) but orchestra wasn't captured.

## Game Filtering Requirements

Each game type needs different metadata:

| Game | requireOrchestra | requireSinger | Notes |
|------|------------------|---------------|-------|
| **artist-quiz** | YES | No | Identify the orchestra |
| **artist-learn** | YES | No | Learn orchestras |
| **clip-orchestra** | YES | No | Short clip, identify orchestra |
| **singer-quiz** | No | YES | Identify the singer |
| **singer-learn** | No | YES | Learn singers |
| **clip-singer** | No | YES | Short clip, identify singer |
| **listen** | No | No | Browse all songs |
| **year-learn** | No | No | Needs Year field |

## Implementation

### fetchFilteredSongs Options

```javascript
fetchFilteredSongs(
  artistMasters,    // Filter by specific orchestras
  artistLevels,     // Legacy orchestra levels
  composers,
  styles,
  candombe,
  alternative,
  cancion,
  qty,
  {
    requireOrchestra: true,  // For orchestra games - excludes 1,305 songs
    requireSinger: true,     // For singer games
    includeSinger: true,     // Include vocal songs (vs instrumental only)
    singers: [],             // Filter by specific singers
    recognitionTiers: [],    // Filter by recognition tier 1-5
    yearRange: [1930, 1950], // Filter by year
    duetFilter: 'solo',      // 'all' | 'solo' | 'duetsOnly'
  }
);
```

### Recognition Tiers

Recognition tiers apply to ALL songs regardless of metadata completeness:

| Tier | Name | % | Songs | Vibe |
|------|------|---|-------|------|
| 1 | Iconic | 10% | 468 | Everyone knows it |
| 2 | Essential | 20% | 935 | Milonga staples |
| 3 | Familiar | 30% | 1,402 | You've heard it |
| 4 | Challenging | 25% | 1,169 | Tests your ears |
| 5 | Deep Cuts | 15% | 701 | DJ-level knowledge |

Tiers are based on:
- Rating (stars): 35%
- Times Played: 45%
- Orchestra Level bonus: 20%

## Future Improvements

1. **Fix golden-age data** - Recover orchestra from singer (e.g., Roberto Ray → Lucio Demare)
2. **Add metadata flags** - `hasOrchestra`, `hasSinger` computed fields
3. **Validator tool** - `/games/recognition-validator` for reviewing tier assignments

---
*Last updated: 2026-02-24*
*Author: Compás*
