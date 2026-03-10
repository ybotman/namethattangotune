# Iconic Mode Design

## Overview
When user selects "Iconic" (tier 1), we switch from algorithmic `recognitionTier` filtering to **hardcoded curated lists**.

## Behavior Change

| Mode | Current | New |
|------|---------|-----|
| Iconic (tier 1) | Filter by `recognitionTier === 1` | Use hardcoded lists + force Golden Age |
| Tiers 2-5 | Filter by `recognitionTier` | No change |

## Three Hardcoded Lists

### 1. Iconic Orchestras (for Orchestra Quiz/Clip)
When playing orchestra games in Iconic mode:
- Only these orchestras appear as correct answers
- Only songs from these orchestras are used
- Forces Golden Age (1935-1955)

**Proposed list (TBD):**
- Juan D'Arienzo
- Carlos Di Sarli
- Anibal Troilo
- Osvaldo Pugliese
- (Francisco Canaro?)
- (Rodolfo Biagi?)

### 2. Iconic Singers (for Singer Quiz/Clip)
When playing singer games in Iconic mode:
- Only these singers appear as correct answers
- Only songs featuring these singers are used
- Forces Golden Age

**Proposed list (TBD - ~10 singers):**
- Alberto Castillo
- Francisco Fiorentino
- Alberto Podestá
- Ángel Vargas
- Roberto Rufino
- Jorge Casal
- Alberto Echagüe
- Héctor Mauré
- (others TBD)

### 3. Iconic Songs (for Song Title Quiz)
When playing song title games in Iconic mode:
- Only these ~100 songs are used
- Matched by title (fuzzy) or SongID

**See initial list of 100 songs in user conversation**

## Data Structure

New file: `public/songData/IconicLists.json`

```json
{
  "version": 1,
  "iconicOrchestras": [
    "Juan D'Arienzo",
    "Carlos Di Sarli",
    "Anibal Troilo",
    "Osvaldo Pugliese"
  ],
  "iconicSingers": [
    "Francisco Fiorentino",
    "Alberto Podestá",
    "Ángel Vargas"
  ],
  "iconicSongs": [
    { "title": "La Cumparsita", "orchestra": "Juan D'Arienzo", "year": 1943 },
    { "title": "Bahía Blanca", "orchestra": "Carlos Di Sarli", "year": 1957 }
  ]
}
```

## Code Changes

### 1. dataFetching.js
- Load `IconicLists.json`
- When `recognitionTiers.includes(1)` AND `recognitionTiers.length === 1` (Iconic only):
  - Force period to Golden Age
  - For orchestra games: filter to `iconicOrchestras`
  - For singer games: filter to `iconicSingers`
  - For song games: filter to `iconicSongs`

### 2. GameContext.js
- No changes needed (already stores `recognitionTiers`)

### 3. RecognitionSelector.js
- Maybe add visual indicator that Iconic = "curated list"

## Matching Logic

Songs matched by:
1. **Exact SongID** (if we add IDs to IconicLists.json)
2. **Title + Orchestra + Year** (fuzzy match)
3. **Title + Orchestra** (if year missing)

## Edge Cases

- What if Iconic + another tier selected? Use algorithmic for tiers 2-5, curated for tier 1?
- What if Iconic + specific orchestra selected? Intersect the lists?

## Next Steps

1. [ ] Finalize iconic orchestras list
2. [ ] Finalize iconic singers list
3. [ ] Match 100 songs to SongIDs in djSongsWeighted.json
4. [ ] Create IconicLists.json
5. [ ] Update dataFetching.js
6. [ ] Test each game mode
