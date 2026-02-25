# Recognition Tiers: A Rethink of Song Difficulty

**Status:** IN PROGRESS
**Branch:** `feature/recognition-levels`
**Author:** Compás
**Date:** 2026-02-24

---

## Problem Statement

The current "Level" system is **orchestra-centric**:
- Level 1-4 assigned to orchestras (ArtistMaster.json)
- All songs from D'Arienzo are "Level 1"
- But D'Arienzo has classics everyone knows AND deep cuts nobody plays

**The flaw:** Dancers recognize **songs**, not just orchestras.

A beginner should learn "La Cumparsita" before obscure D'Arienzo tracks, even though both are "Level 1" orchestras.

---

## Proposed Solution: Recognition Score

Replace orchestra-based "Level" with a **song-based "Recognition Score"** that answers:

> "How likely is a dancer to have heard this song at a milonga?"

### The Formula

```javascript
recognitionScore = (W_STARS * normStars) + (W_PLAYS * normPlays) + (W_ORCH * orchBonus)
```

Where:
- `W_STARS = 0.35` — DJ quality rating
- `W_PLAYS = 0.45` — How often it's actually played (most important)
- `W_ORCH = 0.20` — Orchestra recognition bonus

### Normalization

```javascript
// Stars: 1-5 → 0-1 (treat unrated as 2.5)
normStars = (Math.max(stars, 2.5) - 1) / 4;

// Plays: Log-scaled to handle skew (max = 33)
normPlays = Math.log(plays + 1) / Math.log(maxPlays + 1);

// Orchestra bonus by current Level
orchBonus = {
  1: 1.0,   // D'Arienzo, Di Sarli, Troilo, Canaro, etc.
  2: 0.7,   // Pugliese, Tanturi, Donato, Calo
  3: 0.4,   // Demare
  4: 0.2,   // Gobbi, De Caro, Malerba
  null: 0   // Other orchestras
}[orchestraLevel] || 0;
```

### Recognition Tiers (FINAL - Percentile-Based)

Songs are ranked by recognition score, then assigned to tiers by percentile:

| Tier | Name | % of Songs | Count | Vibe |
|------|------|------------|-------|------|
| 1 | **Iconic** | Top 10% | 468 | Everyone knows it |
| 2 | **Essential** | Next 20% | 935 | Milonga staples |
| 3 | **Familiar** | Next 30% | 1,402 | You've heard it |
| 4 | **Challenging** | Next 25% | 1,169 | Tests your ears |
| 5 | **Deep Cuts** | Bottom 15% | 701 | DJ-level knowledge |

---

## Current Data Analysis

### Song Distribution

```
Total songs: 5,488

By Orchestra Level:
  Level 1: 2,774 songs (D'Arienzo, Di Sarli, Troilo, Canaro, Firpo, Lomuto, OTV)
  Level 2:   866 songs (Pugliese, Tanturi, Donato, Calo, Federico, Laurenz, Biagi)
  Level 3:    67 songs (Demare)
  Level 4:   116 songs (Gobbi, De Caro, Malerba, El Cachivache, L. Federico)
  No Level: 1,665 songs (other orchestras)
```

### Play Count Distribution

```
Songs with 0 plays:  3,984 (73%)
Songs with 1-10:     1,373 (25%)
Songs with 11-33:      131 (2%)

Top played songs ARE the recognition baseline:
  33x | Di Sarli - Soy Un Arlequin
  30x | Di Sarli (Sextet) - Soy Un Arlequin
  29x | Pugliese - Emancipacion
  25x | Lomuto - Que tiempo aquel
  22x | Donato - Sinsabor
```

### Rating Distribution

```
Rating 5:   527 songs (10%)
Rating 4: 2,012 songs (37%)
Rating 3: 2,136 songs (39%)
Rating 2:   692 songs (13%)
Rating 1:   121 songs (2%)
```

---

## Implementation Plan

### Phase 1: Add Recognition Score to Data Pipeline

1. **Create `calculateRecognitionScore.js`** utility
2. **Modify data pipeline** to compute score for each song
3. **Add fields to djSongs.json:**
   - `recognitionScore` (0.0-1.0)
   - `recognitionTier` (1-5)
4. **Regenerate song data** with new fields

### Phase 2: Update UI Components

1. **Rename `LevelsSelector` → `RecognitionSelector`**
2. **Update labels:**
   - "Level 1-4" → "Essential / Core / Familiar / Learning / Discovery"
3. **Update ConfigTabs** in all games:
   - artist-learn
   - artist-quiz
   - singer-learn
   - singer-quiz
   - clip-orchestra
   - clip-singer

### Phase 3: Update Data Fetching

1. **Modify `fetchFilteredSongs()`:**
   - Replace `artistLevels` parameter with `recognitionTiers`
   - Filter by `recognitionTier` instead of computed orchestra level
2. **Update all game pages** that pass levels

### Phase 4: Enhance Listen Game

1. **Add Recognition filter** to ConfigTab
2. **Add sort options:**
   - Most Played First (default for beginners)
   - Highest Rated
   - Random
   - Discovery Mode (least played)
3. **Make Listen the "learning engine"**

---

## Files to Modify

### Data Pipeline (MusicImport/)
- [ ] Create `calculateRecognition.py` or `.js`
- [ ] Update djSongs.json generation

### Components (src/app/components/ui/)
- [ ] Rename `LevelsSelector.js` → `RecognitionSelector.js`
- [ ] Update component labels and styling

### Games (src/app/games/)
- [ ] artist-learn/ConfigTab.js
- [ ] artist-learn/page.js
- [ ] artist-quiz/ConfigTab.js
- [ ] artist-quiz/page.js
- [ ] singer-learn/ConfigTab.js
- [ ] singer-learn/page.js
- [ ] singer-quiz/ConfigTab.js
- [ ] singer-quiz/page.js
- [ ] clip-orchestra/ConfigTab.js
- [ ] clip-orchestra/page.js
- [ ] clip-singer/ConfigTab.js
- [ ] clip-singer/page.js
- [ ] listen/ConfigTab.js
- [ ] listen/page.js

### Utils (src/app/utils/)
- [ ] dataFetching.js - update filtering logic

### Data Files (public/songData/)
- [ ] ArtistMaster.json - keep for orchestra info, remove level concept
- [ ] djSongs.json - add recognitionScore, recognitionTier

---

## Migration Strategy

1. **Add new fields** without removing old ones
2. **Update UI** to use new fields
3. **Deprecate old Level references** (leave in data but unused)
4. **Remove deprecated fields** in future cleanup

---

## Open Questions

1. **Should Recognition be user-specific?**
   - Future: Track what songs each user has heard
   - Their personal "recognition" grows over time

2. **Regional variations?**
   - Some songs are classics in Buenos Aires but unknown in Europe
   - For now: Use DJ play count as proxy

3. **Tier boundaries?**
   - Need to run the formula and examine actual distribution
   - May need to adjust weights or boundaries

---

## Success Metrics

- Beginners in "Essential" mode hear recognizable songs
- "Discovery" mode introduces genuinely new material
- Listen game becomes primary learning tool
- Quiz difficulty feels appropriate per tier

---

## Next Steps

1. [ ] Review this proposal
2. [ ] Run scoring algorithm on real data, validate tiers
3. [ ] Create implementation branch
4. [ ] Phase 1: Data pipeline
5. [ ] Phase 2-4: UI updates

---

*Proposal by Compás - 2026-02-24*
