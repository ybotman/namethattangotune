# NTTT Data Sources & Recognition System

**Status:** WORK IN PROGRESS - Validating
**Date:** 2026-02-24

---

## JSON File Inventory

### MusicImport/ (Source Data)

| File | Size | Records | Purpose |
|------|------|---------|---------|
| `djLibrary.json` | 37MB | 25,978 | Full DJ library from Mixxx - has `rating`, `timesplayed` |
| `djTangoSongs.json` | 13MB | 9,443 | Filtered tango songs with `djId` linking to djLibrary |
| `djSongs.json` | 2.3MB | 4,676 | Curated songs for NTTT (subset of djTangoSongs) |
| `ArtistMaster.json` | 2.5KB | 26 | Orchestra master list with `level` (1-4) |

### NTTT/public/songData/ (App Data)

| File | Size | Records | Purpose |
|------|------|---------|---------|
| `djSongsWeighted.json` | 2.2MB | 4,675 | **PRIMARY** - Songs with Rating, TimesPlayed, Weight |
| `djSongs.json` | 2.5MB | 4,676 | Basic song data (no rating/plays) |
| `djSongsL1.json` | 2.1MB | - | Level 1 orchestra songs only |
| `djSongsL2.json` | 2.3MB | - | Level 1+2 orchestra songs |
| `ArtistMaster.json` | 2.4KB | 26 | Orchestra levels (1-4) |
| `SingerMaster.json` | 29KB | - | Singer database |

---

## Key Fields in djSongsWeighted.json

```json
{
  "SongID": "uuid",
  "Title": "Song Title",
  "Orchestra": "Full Orchestra Name - Singer",
  "ArtistMaster": "Canonical Orchestra Name",
  "AudioUrl": "https://nttt.blob.core.windows.net/v20/uuid.mp3",
  "Year": "1940",
  "Style": "Tango|Vals|Milonga",
  "Singer": "Singer Name",

  // Existing weighted fields
  "Rating": 3,           // DJ rating (3, 4, or 5)
  "TimesPlayed": 15,     // Times played by DJ
  "PriorityTier": "A",   // A (high priority) or B
  "Weight": 15,          // Composite weight score

  // NEW recognition fields (added 2026-02-24)
  "recognitionScore": 0.875,  // 0.0 - 1.0
  "recognitionTier": 1,       // 1-5
  "orchestraLevel": 1         // 1-4 from ArtistMaster
}
```

---

## Recognition Score Formula

```javascript
score = (0.35 * normRating) + (0.45 * normPlays) + (0.20 * orchBonus)
```

### Weights
| Factor | Weight | Rationale |
|--------|--------|-----------|
| Rating | 35% | DJ quality judgment |
| Plays | 45% | Most important - actual milonga frequency |
| Orchestra Level | 20% | Recognition boost for popular orchestras |

### Normalization
```javascript
// Rating (3-5 -> 0-1)
normRating = (rating - 1) / 4

// Plays (log-scaled, max=33)
normPlays = Math.log(plays + 1) / Math.log(maxPlays + 1)

// Orchestra bonus
orchBonus = {1: 1.0, 2: 0.7, 3: 0.4, 4: 0.2}[level] || 0
```

---

## Recognition Tiers

| Tier | Name | Score Range | Count | Description |
|------|------|-------------|-------|-------------|
| 1 | Essential | > 0.80 | 91 | Must-know classics |
| 2 | Core | 0.60 - 0.80 | 621 | Regular milonga staples |
| 3 | Familiar | 0.40 - 0.60 | 1,418 | Heard occasionally |
| 4 | Learning | 0.20 - 0.40 | 2,004 | Less common |
| 5 | Discovery | < 0.20 | 541 | Rare/deep cuts |

---

## Data Flow

```
djLibrary.json (Mixxx export)
    ↓ rating, timesplayed
djTangoSongs.json (filtered + linked via djId)
    ↓ matched to blob storage
djSongs.json (curated subset)
    ↓ + rating/plays from library
djSongsWeighted.json (PRIMARY for app)
    ↓ + recognition scores
Recognition Validator (validation tool)
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `MusicImport/add_recognition_scores.py` | Adds recognition scores to djSongsWeighted.json |
| `MusicImport/enrich_with_recognition.py` | Alternative enrichment (uses djSongs.json) |

---

## Validation Checklist

- [ ] Top 20 recognition songs are actually recognizable classics
- [ ] Tier 1 (Essential) songs feel like "must-know" tango
- [ ] Tier 5 (Discovery) songs are genuinely obscure
- [ ] Rating filter works correctly
- [ ] Plays filter works correctly
- [ ] Recognition tier filter works correctly

---

## Open Questions

1. **Why only 4,675 songs in djSongsWeighted vs 9,443 in djTangoSongs?**
   - Need to understand the curation criteria

2. **Should we use djTangoSongs as the primary source?**
   - Would give more songs with plays data (1,321 vs 1,486)
   - But djSongsWeighted already has the link to blob storage

3. **Orchestra Level coverage?**
   - Only 26 orchestras have levels assigned
   - Many songs get orchestraLevel: null

---

*Last updated: 2026-02-24 by Compás*
