# NTTT Session Summary - 2026-03-02

## What Was Built Today

### SWAP not STACK - All 5 Games Updated

| Game | Primary Filter | Icon | Status |
|------|---------------|------|--------|
| orchestra-quiz | OrchestraLevelSelector | 🌶 Level | Done |
| clip-orchestra | OrchestraLevelSelector | 🌶 Level | Done |
| singer-quiz | RecognitionSelector | 🎵 Familiarity | Done |
| clip-singer | RecognitionSelector | 🎵 Familiarity | Done |
| song-quiz | RecognitionSelector | 🎵 Familiarity | Done |

**Key Changes:**
- `FilterModeToggle.js` - Users choose Level OR Era (not both)
- `PoolCount.js` - Live song count with validation messages
- Button text changed: "Levels" → "Filters"

### Orchestra Quiz - 9 Levels (3×3)

**Orchestra Level (who's playing):**
| Tier | Icon | Orchestras |
|------|------|------------|
| Big4 | 🌶 | D'Arienzo, Di Sarli, Troilo, Pugliese |
| Classic | 🌶🌶 | Canaro, Biagi, Tanturi, Caló... |
| Deep | 🌶🌶🌶 | 40+ orchestras |

**Song Obscurity (which songs):**
| Sub-Tier | Coverage | New Name (IO spec) |
|----------|----------|-------------------|
| Classics | Top 30% | Famous ⭐ |
| Standards | Middle 40% | Regular ⭐⭐ |
| DeepCuts | Bottom 30% | Obscure ⭐⭐⭐ |

**Defaults (Level mode):**
- Orchestra Level: Big4
- Song Obscurity: Classics
- Style: Tango
- Vocals: Off

**Validation (Level mode requires all):**
- 1+ Orchestra Level
- 1+ Song Obscurity
- 1+ Style

---

## Files Changed

```
src/app/games/orchestra-quiz/page.js        # SWAP + validation
src/app/games/orchestra-quiz/ConfigTab.js   # FilterModeToggle + PoolCount
src/app/games/clip-orchestra/page.js        # SWAP + validation
src/app/games/clip-orchestra/ConfigTab.js   # FilterModeToggle + PoolCount
src/app/games/singer-quiz/page.js           # SWAP + validation
src/app/games/singer-quiz/ConfigTab.js      # FilterModeToggle + PoolCount
src/app/games/clip-singer/page.js           # SWAP + validation
src/app/games/clip-singer/ConfigTab.js      # FilterModeToggle + PoolCount
src/app/games/song-quiz/page.js             # SWAP + validation
src/app/games/song-quiz/ConfigTab.js        # FilterModeToggle + PoolCount
src/app/components/ui/PoolCount.js          # Added message prop
src/app/hooks/useArtistQuiz.js              # Default subTier to Classics
```

---

## IO Specs Imported

**Location:** `docs/2026-03-02-ui-spec/`

| File | Purpose |
|------|---------|
| NTTT-GameConfig-UI-Spec.md | Full config patterns (A/B/C) |
| NTTT-DifficultyGrid-mockup.jsx | 3×3 grid React mockup |
| NTTT-OrchestraStatus-Spec.md | Status/progress screen spec |
| NTTT-OrchestraStatus-mockup.jsx | Status screen React mockup |

---

## Architecture Decisions

### Config vs Status Screens

| Screen | Component | Selection Model | Purpose |
|--------|-----------|-----------------|---------|
| **CONFIG** | 2 rows | Flexible multi-select | Play any combination |
| **STATUS** | 3×3 grid | Read-only scorecard | Track progress in pure buckets |

**Resolution:** Keep Compas's 2-row config (flexible). Use 3×3 grid on Status screen only (progress map).

### Database for Stats

| Already Have | Decision |
|--------------|----------|
| Firebase Auth | ✅ Active (Google, Apple, Email) |
| Firestore | ✅ Initialized but unused |

**Decision:** Use Firestore (already wired). Start capturing sessions/attempts. Migrate to MongoDB later if analytics becomes a pain point.

**Data to capture per session:**
```javascript
{
  userId: string,
  game: "orchestra-quiz",
  config: { orchestraTiers, subTier, styles, primaryFilterMode },
  attempts: [{
    songId, correctAnswer, choicesShown, userSelected,
    correct, responseTimeMs, score
  }],
  timestamp: Date
}
```

**Use cases enabled:**
- User progress tracking
- Find misplaced/mislabeled songs (correct% < 30%)
- Identify confusing distractors
- Leaderboards per cell

---

## Next Steps

### Immediate
1. Test SWAP implementation on localhost
2. Commit and merge feature/filter-swap → PROD

### Stats Infrastructure
1. Create Firestore collection schema
2. Write session results after game ends
3. Build aggregation for user stats
4. Build Status screen to display stats

### Future (IO Specs)
1. Rename sub-tiers: Classics→Famous, Standards→Regular, DeepCuts→Obscure
2. Status screen with 3 tabs (My Stats, Orchestras, Contest)
3. Per-orchestra progress bars
4. Leaderboards

---

*Compas - Session 2026-03-02*
