# Boris Import Load Plan

**Created:** 2026-03-10
**Updated:** 2026-03-10
**Source:** Boris Mixxx Library
**Status:** Ready for Phase 1

---

## Summary

| Category | Songs | Status |
|----------|-------|--------|
| **Ready to Import** | 10,556 | Matched to ArtistMaster ✓ |
| Need ArtistMaster Update | 2,549 | Missing orchestras |
| Low Priority | 587 | Compilations/Neo-tango |
| **Total Net New** | **13,692** | |

---

## Data Files

| File | Description |
|------|-------------|
| `boris_ready_to_import_20260310.json` | **10,556 songs ready** - use this |
| `boris_verified_new_20260310.json` | All 13,692 with `importStatus` field |
| `boris_by_orchestra_year_20260310.json` | Organized for AI analysis |
| `LOAD_PLAN.md` | This file |

---

## Ready to Import (10,556 songs)

Already matched to ArtistMaster - can import immediately:

| Orchestra | Songs | Level |
|-----------|-------|-------|
| Juan Maglio | 1,118 | L5 |
| Canaro | 868 | L2 |
| Fresedo | 834 | L2 |
| Orquesta Típica Victor | 774 | L2 |
| Troilo | 755 | L1 |
| D'Arienzo | 674 | L1 |
| Di Sarli | 669 | L1 |
| Lomuto | 421 | L2 |
| Biagi | 390 | L2 |
| De Angelis | 376 | L2 |
| Rodriguez | 350 | L2 |
| Donato | 347 | L2 |
| Alberto Castillo | 325 | L3 |
| Demare | 296 | L2 |
| Calo | 288 | L2 |
| Tanturi | 264 | L2 |
| Firpo | 238 | L3 |
| D'Agostino | 232 | L2 |
| Julio De Caro | 210 | L5 |
| Alfredo Gobbi | 177 | L3 |
| Pugliese | 170 | L1 |
| Laurenz | 153 | L2 |
| Héctor Varela | 90 | L2 |
| Piazzolla | 108 | L2 |
| + 35 more orchestras | ~1,000 | Various |

---

## Need ArtistMaster Update (2,549 songs)

Add these orchestras to ArtistMaster.json first:

| Orchestra | Songs | Suggested Level |
|-----------|-------|-----------------|
| Pedro Maffia | 196 | L3 (Old Guard) |
| Juan Bautista Guido | 180 | L4 (Old Guard) |
| Trio Hugo Diaz | 168 | L4 (Folk fusion) |
| Orquesta Tipica Brunswick | 84 | L4 |
| Orquesta El Arranque | 78 | L3 (Modern) |
| Cayetano Puglisi | 76 | L4 (Early) |
| Adolfo Beron | 70 | L4 |
| Nelly Omar | 58 | L3 (Famous singer) |
| + others | ~1,600 | Review needed |

---

## Low Priority (587 songs)

| Type | Songs | Notes |
|------|-------|-------|
| Various Artists | 84 | Compilations |
| Otros Aires | 91 | Neo-tango |
| Unknown/no artist | 50 | Bad metadata |
| Other neo-tango | ~350 | Modern/fusion |

---

## Import Process

### Phase 1: Import Ready Songs (10,556)

```bash
# 1. Verify files exist on external drive
python3 verify_boris_files.py

# 2. Upload to Azure v20
python3 upload_boris_batch.py --status ready

# 3. Add to djSongsWeighted.json
python3 merge_boris_songs.py --status ready

# 4. Set lineage
Source: "Boris-Import-20260310"
Source2: "BorisH"
```

### Phase 2: Add Missing Orchestras

Update `ArtistMaster.json`:
```json
{ "artist": "Pedro Maffia", "level": 3, "active": true },
{ "artist": "Juan Bautista Guido", "level": 4, "active": true },
{ "artist": "Trio Hugo Diaz", "level": 4, "active": true },
{ "artist": "Adolfo Beron", "level": 4, "active": true },
{ "artist": "Nelly Omar", "level": 3, "active": true },
{ "artist": "Cayetano Puglisi", "level": 4, "active": true },
{ "artist": "Orquesta El Arranque", "level": 3, "active": true },
{ "artist": "Orquesta Tipica Brunswick", "level": 4, "active": true }
```

### Phase 3: Import Remaining (2,549)

After ArtistMaster update, re-run import for `need_artistmaster` songs.

---

## Song Record Fields

Each song in `boris_ready_to_import_20260310.json` has:

```json
{
  "songID": "uuid",
  "title": "Song Title",
  "artist": "Orchestra Name",
  "singer": "Singer Name (if extracted)",
  "year": "1942",
  "genre": "Tango",
  "rating": 0-5,
  "timesPlayed": 0+,
  "localPath": "/Volumes/EXTVideo1/djImports/boris/Music/...",
  "audioUrlIfUploaded": "https://nttt.blob.core.windows.net/v20/{songID}.mp3",
  "importStatus": "ready",
  "matchedArtist": "Anibal Troilo",
  "orchestraLevel": 1
}
```

---

## Pre-Import Checklist

- [ ] External drive mounted (`/Volumes/EXTVideo1`)
- [ ] Azure backup created (`nttt-2-9-0-YYYYMMDD`)
- [ ] Git tagged current version
- [ ] Verify sample files play correctly

---

## Post-Import Validation

- [ ] Random sample of 50 songs play in app
- [ ] No 404 errors
- [ ] Lineage fields populated
- [ ] Song counts match expected

---

## AI Obscurity Analysis (Optional)

Use `boris_by_orchestra_year_20260310.json` for:
- Identify iconic vs obscure songs
- Prioritize well-known recordings
- Flag duplicates (same song, different recording)

---

*Updated: 2026-03-10*

---

## Gridding/Ranking System Integration

### Required Fields for Ranking

| Field | Source | How to Populate |
|-------|--------|-----------------|
| `Rating` | Boris data | Use `rating` field (0-5) |
| `TimesPlayed` | Boris data | Use `timesPlayed` field |
| `orchestraLevel` | ArtistMaster.json | Lookup by `matchedArtist` |
| `singerLevel` | SingerMaster.json | Lookup by `singer` field |
| `singerEra` | SingerMaster.json | Lookup by `singer` field |
| `HasSinger` | Derived | `true` if singer field not empty |
| `recognitionScore` | **Calculated** | See formula below |
| `recognitionTier` | **Calculated** | Percentile-based |
| `songFamiliarity` | **Calculated** | From tier |
| `Weight` | **Calculated** | From rating + plays |
| `PriorityTier` | **Calculated** | From rating |

### Recognition Score Formula

```
recognitionScore = (0.35 × normRating) + (0.45 × normPlays) + (0.20 × orchBonus)

Where:
- normRating = Rating / 5.0
- normPlays = log(TimesPlayed + 1) / log(maxPlays + 1)
- orchBonus = 1.0 (L1), 0.7 (L2), 0.4 (L3), 0.2 (L4), 0.1 (L5)
```

### Tier Assignment (Percentile)

| Tier | Name | Percentile |
|------|------|------------|
| 1 | Iconic | Top 10% |
| 2 | Essential | Next 20% |
| 3 | Familiar | Next 30% |
| 4 | Challenging | Next 25% |
| 5 | Deep Cuts | Bottom 15% |

### Weight Calculation

```
Weight = baseFromRating + playBonus

baseFromRating:
- Rating 5 = base 5
- Rating 4 = base 3
- Rating 3 = base 1

playBonus = min(10, TimesPlayed / 2)
```

### Import Script Must:

1. **Map Boris fields to production fields**
```python
prod_song = {
    'SongID': boris['songID'],
    'Title': boris['title'],
    'Orchestra': boris['artist'],
    'ArtistMaster': boris['matchedArtist'],
    'Singer': boris['singer'] or None,
    'Year': boris['year'],
    'Style': boris['style'] or 'Tango',
    'Rating': boris['rating'] or 4,  # Default 4 if no rating
    'TimesPlayed': boris['timesPlayed'] or 0,
    'HasSinger': bool(boris['singer']),
    'Alternative': boris['alternative'] == 'Y',
    'Candombe': boris['candombe'] == 'Y',
    'Cancion': boris['cancion'] == 'Y',
    'AudioUrl': boris['audioUrlIfUploaded'],
    'orchestraLevel': boris['orchestraLevel'],
    'Source': 'Boris-Import-20260310',
    'Source2': 'BorisH',
}
```

2. **Calculate recognition scores** (after all songs loaded)
```python
# Run add_recognition_scores.py after merge
python3 add_recognition_scores.py
```

3. **Update singer data** (if singer field populated)
```python
# Lookup in SingerMaster.json
# Set singerLevel, singerEra
```

4. **Recalculate percentile tiers**
```python
# Sort all songs by recognitionScore
# Assign tiers based on percentile
```

### Key Scripts

| Script | Purpose |
|--------|---------|
| `add_recognition_scores.py` | Calculate recognitionScore, Weight |
| `build_weighted_songs.py` | Build full djSongsWeighted.json |
| `build_singer_master.js` | Update singer counts/tiers |

### New Songs Default Tiers

Since Boris songs have:
- Rating: Often 0 (94% unrated)
- TimesPlayed: Often 0 (99%)

Most will start at Tier 3-5 depending on orchestra level:

| Orchestra Level | Starting Tier |
|-----------------|---------------|
| L1 (Big 4) | Tier 3 (Familiar) |
| L2 (Major) | Tier 3-4 |
| L3 (Standard) | Tier 4 |
| L4-L5 (Obscure) | Tier 5 (Deep Cuts) |

---
