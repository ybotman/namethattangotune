# NTTT Data Pipeline

**Date:** 2026-02-24
**Author:** Compás (with Toby)

---

## Session Work Log

### 2026-02-24: ArtistMaster Expansion

**Problem Found:**
- ArtistMaster.json only had 26 orchestras
- 1,260 songs (including 121 5-star songs) had no `artistMaster` match
- Major orchestras like Rodolfo Biagi, Osvaldo Fresedo, Pedro Laurenz were missing

**Actions Taken:**
1. Analyzed BORIS source data (`djSongsFiltered_boris.json`)
2. Identified missing orchestras by star rating
3. Added 26 new orchestras to ArtistMaster.json
4. Created backups before changes

**Orchestras Added:**

| Orchestra | Level | Songs | Notes |
|-----------|-------|-------|-------|
| Rodolfo Biagi | 1 | 214 | Major golden-age |
| Osvaldo Fresedo | 1 | 66 | Major golden-age |
| Pedro Laurenz | 2 | 60 | + Quinteto variant |
| Héctor Varela | 2 | 47 | + accent variant |
| Orquesta Típica Victor | 2 | 153 | + accent variants |
| Quinteto Pirincho | 3 | 74 | |
| Rafael Canaro | 3 | 63 | |
| Osmar Maderna | 3 | 53 | |
| Horacio Salgán | 3 | 12 | + orquesta variant |
| Florindo Sassone | 3 | 18 | + orquesta variant |
| Alberto Castillo | 3 | 15 | Singer with orchestras |
| Angel Vargas | 3 | ~50 | Multiple orchestras |
| Hyperion Ensemble | 4 | 54 | Modern |
| Sexteto Milonguero | 4 | 34 | Modern |
| Pablo Valle Sexteto | 4 | 26 | Modern |
| Bandonegro | 4 | 25 | Modern |
| + 10 more | 4-5 | ~100 | Various |

**Result:**
- Before: 26 orchestras, ~72% songs matchable
- After: 52 orchestras, ~87% songs matchable

**Backups Created:**
- `MusicImport/djSongs_backup_20260224.json`
- `MusicImport/djSongs_enriched_backup_20260224.json`
- `NTTT/public/songData/djSongsWeighted_backup_20260224.json`

---

## Data Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  BORIS (DJ Software)                                            │
│  └── djLibrary_boris.json (22MB) - Full library with ratings   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    extractMixxxSqlite.py
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Source Data Files                                              │
│  ├── djLibrary.json         - id, rating, timesplayed           │
│  ├── djTangoSongs.json      - songID, djId (link)               │
│  ├── djSongsFiltered_boris.json - 5,488 songs with priority     │
│  └── ArtistMaster.json      - Orchestra master with levels      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    djSongsRawMatch.py
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  djSongs.json (4,676 songs)                                     │
│  Fields: SongID, Title, Orchestra, ArtistMaster, Singer, etc.   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    enrich_with_recognition.py
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  djSongs_enriched.json                                          │
│  Added: rating, timesplayed, recognitionScore, recognitionTier  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              Filter: priorityScore >= 60 (removes Tier C)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  djSongsWeighted.json (4,675 songs)                             │
│  Fields: All above + Rating, TimesPlayed, PriorityTier, Weight  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    add_recognition_scores.py
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  djSongsWeighted.json (FINAL)                                   │
│  Added: recognitionScore, recognitionTier, orchestraLevel       │
│  Location: NTTT/public/songData/djSongsWeighted.json            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Scripts

### 1. enrich_with_recognition.py

**Purpose:** Enriches djSongs.json with rating/plays from djLibrary

**Input:**
- `djSongs.json` - Base song data
- `djTangoSongs.json` - Link table (songID → djId)
- `djLibrary.json` - Rating and play counts
- `ArtistMaster.json` - Orchestra levels

**Output:**
- `djSongs_enriched.json`

**What it does:**
1. Links songs to djLibrary via djTangoSongs
2. Pulls rating and timesplayed
3. Calculates recognitionScore
4. Assigns recognitionTier (1-5)

---

### 2. add_recognition_scores.py

**Purpose:** Adds/updates recognition scores on djSongsWeighted.json

**Input:**
- `djSongsWeighted.json` - Filtered songs
- `ArtistMaster.json` - Orchestra levels

**Output:**
- `djSongsWeighted.json` (updated in place)

**What it does:**
1. Calculates recognition score for each song
2. Assigns tiers by **percentile ranking** (not fixed thresholds)
3. Top 10% = Iconic, etc.

---

## Recognition Score Formula

```python
score = (0.35 * normStars) + (0.45 * normPlays) + (0.20 * orchBonus)
```

Where:
- `normStars` = (rating - 1) / 4  → 0 to 1
- `normPlays` = log(plays + 1) / log(maxPlays + 1)  → 0 to 1
- `orchBonus` = {Level 1: 1.0, Level 2: 0.7, Level 3: 0.4, Level 4: 0.2}

**Weights:**
- 35% star rating
- 45% play count (most important)
- 20% orchestra tier

---

## Recognition Tiers

### In add_recognition_scores.py (Percentile-based)

| Tier | Name | Percentile | Est. Songs |
|------|------|------------|------------|
| 1 | Iconic | Top 10% | ~468 |
| 2 | Essential | Next 20% | ~935 |
| 3 | Familiar | Next 30% | ~1,402 |
| 4 | Challenging | Next 25% | ~1,169 |
| 5 | Deep Cuts | Bottom 15% | ~701 |

### In enrich_with_recognition.py (Fixed thresholds)

| Tier | Name | Score Range |
|------|------|-------------|
| 1 | Essential | > 0.80 |
| 2 | Core | 0.60 - 0.80 |
| 3 | Familiar | 0.40 - 0.60 |
| 4 | Learning | 0.20 - 0.40 |
| 5 | Discovery | < 0.20 |

**Note:** The two scripts use different tier assignment methods!

---

## Priority Tiers (from BORIS)

| Tier | Criteria | In Weighted? |
|------|----------|--------------|
| A | 5-star OR (4-star + high plays) | Yes |
| B | 3-4 star, priorityScore >= 60 | Yes |
| C | 1-2 star, priorityScore < 60 | **No** (filtered out) |

---

## Files Location

```
MusicImport/
├── ArtistMaster.json          ← Master orchestra list
├── djSongs.json               ← Base song data
├── djSongs_enriched.json      ← Enriched with scores
├── djLibrary.json             ← Rating/plays source
├── djTangoSongs.json          ← Link table
├── djSongsFiltered_boris.json ← BORIS source (5,488 songs)
├── add_recognition_scores.py  ← Score calculator
└── enrich_with_recognition.py ← Enrichment script

NTTT/public/songData/
├── ArtistMaster.json          ← Copy for app
├── djSongsWeighted.json       ← Final app data (4,675 songs)
└── SingerMaster.json          ← Singer data
```

---

## To Re-run Enrichment

After updating ArtistMaster.json:

```bash
cd MusicImport

# Option 1: Just update recognition scores (faster)
python3 add_recognition_scores.py

# Option 2: Full re-enrichment from source
python3 enrich_with_recognition.py
```

---

## Singer Data Note

Singer information is NOT in BORIS source data. It's embedded in `artistOriginal` field:

```
"Osvaldo Fresedo - Roberto Ray"
       ↑                ↑
   Orchestra         Singer
```

4,687 songs have this format and could be parsed to extract singer names.

---

*Document created: 2026-02-24*
