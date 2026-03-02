# NTTT Game Config UI Spec — All Games
> For Compas implementation. IO authored. 2026-03-01

---

## Core Concept: Two Different Config Patterns

Games split into two config patterns based on their primary filter dimension:

| Pattern | Games | Primary Filter |
|---------|-------|---------------|
| **A — 3×3 Grid** | orchestra-quiz, clip-orchestra | 🌶 Level × Song depth |
| **B — Single Row** | singer-quiz, clip-singer, song-quiz | 🎵 Familiarity (1D) |
| **C — ERA only** | listen, year-learn, orchestra-learn | Periods only |

---

## Pattern A — Orchestra Games: 3×3 Grid

### The Grid

Single-tap selects ONE cell. No multi-select — forces a clear choice.

```
                ⭐ Famous    ⭐⭐ Regular   ⭐⭐⭐ Obscure
                (top 30%)   (mid 40%)    (bot 30%)

🌶  Big 4      [   1   ]   [   2   ]    [   3   ]
🌶🌶 Classic   [   4   ]   [   5   ]    [   6   ]
🌶🌶🌶 Deep    [   7   ]   [   8   ]    [   9   ]
```

### Selection Description (appears below grid on tap)

Each cell shows a contextual description when selected:

| Cell | Description |
|------|-------------|
| 1 | 🌶 Big 4 orchestras · ⭐ Their most famous songs · 459 songs |
| 2 | 🌶 Big 4 orchestras · ⭐⭐ Regular milonga fare · 530 songs |
| 3 | 🌶 Big 4 orchestras · ⭐⭐⭐ Their obscure recordings · 439 songs |
| 4 | 🌶🌶 Classic orchestras · ⭐ Their most famous songs · 205 songs |
| 5 | 🌶🌶 Classic orchestras · ⭐⭐ Regular milonga fare · 352 songs |
| 6 | 🌶🌶 Classic orchestras · ⭐⭐⭐ Their obscure recordings · 1,035 songs |
| 7 | 🌶🌶🌶 Deep orchestras · ⭐ Their most famous songs · 446 songs |
| 8 | 🌶🌶🌶 Deep orchestras · ⭐⭐ Regular milonga fare · 651 songs |
| 9 | 🌶🌶🌶 Deep orchestras · ⭐⭐⭐ Their obscure recordings · 616 songs |

### Default Selection
Cell 1 (Big 4 · Famous) — safest starting point for new players.

### Disable Rule
Gray out any cell with < 40 songs. Tooltip: "Not enough songs for this combination."

---

### Full Orchestra Quiz Config Layout

```
─────────────────────────────────────────
  FILTER BY  [ LEVEL ↔ ERA ]            ← toggle
─────────────────────────────────────────

  [LEVEL MODE — shows 3×3 grid]

                ⭐        ⭐⭐       ⭐⭐⭐
  🌶           [ 1 ]     [ 2 ]     [ 3 ]
  🌶🌶         [ 4 ]     [ 5 ]     [ 6 ]
  🌶🌶🌶       [ 7 ]     [ 8 ]     [ 9 ]

  Selected: 🌶 Big 4 · ⭐ Famous songs · 459 songs

─────────────────────────────────────────

  [ERA MODE — replaces grid]

  [ OLD ] [ NEW ] [ GOLD ] [ DEC ] [ REN ]
   Guard   Guard  Golden  Decline  Renais.

─────────────────────────────────────────

  STYLE
  [ TANGO ]  [ VALS ]  [ MILONGA ]  [ VOCALS ]

─────────────────────────────────────────

  Pool: 459 songs          ▶ START
  (grayed if < 40)

─────────────────────────────────────────
```

---

## Pattern B — Singer / Song Games: Single Row + ERA Toggle

Singer and Song games have only ONE primary dimension (Familiarity 🎵).
No 2D grid needed — single row of 4 options.

### Singer Quiz Config Layout

```
─────────────────────────────────────────
  FILTER BY  [ FAMILIARITY ↔ ERA ]      ← toggle
─────────────────────────────────────────

  [FAMILIARITY MODE]

  🎵          🎵🎵        🎵🎵🎵      🎵🎵🎵🎵
  Famous      Known        DJ          Rare
  (664)      (1,328)     (2,125)      (616)

  Sub-tier:  [ ⭐ Famous ] [ ⭐⭐ Regular ] [ ⭐⭐⭐ Obscure ]

─────────────────────────────────────────

  [ERA MODE — replaces above]

  [ OLD ] [ NEW ] [ GOLD ] [ DEC ] [ REN ]

─────────────────────────────────────────

  STYLE
  [ TANGO ]  [ VALS ]  [ MILONGA ]

  SINGER LEVEL
  [ 🎤 Iconic ]  [ 🎤🎤 Known ]  [ 🎤🎤🎤 Deep ]

─────────────────────────────────────────

  Pool: 664 songs          ▶ START

─────────────────────────────────────────
```

**Note:** Singer Quiz has an additional Singer Level filter (🎤) — separate from song familiarity. This filters which singers appear as correct answers and distractors.

### Song Quiz Config Layout

```
─────────────────────────────────────────
  FILTER BY  [ FAMILIARITY ↔ ERA ]
─────────────────────────────────────────

  [FAMILIARITY MODE]

  🎵          🎵🎵        🎵🎵🎵      🎵🎵🎵🎵
  Famous      Known        DJ          Rare

  Sub-tier:  [ ⭐ Famous ] [ ⭐⭐ Regular ] [ ⭐⭐⭐ Obscure ]

─────────────────────────────────────────

  [ERA MODE]

  [ OLD ] [ NEW ] [ GOLD ] [ DEC ] [ REN ]

─────────────────────────────────────────

  STYLE
  [ TANGO ]  [ VALS ]  [ MILONGA ]  [ VOCALS ]

─────────────────────────────────────────

  Pool: 1,328 songs        ▶ START

─────────────────────────────────────────
```

---

## Pattern C — ERA / Listen Games (no primary filter)

For games where ERA is the only meaningful filter:
- listen
- year-learn
- orchestra-learn (single orchestra select, not tier)
- singer-learn

```
─────────────────────────────────────────
  ERA
  [ OLD ] [ NEW ] [ GOLD ] [ DEC ] [ REN ]
   Guard   Guard  Golden  Decline  Renais.

─────────────────────────────────────────

  STYLE
  [ TANGO ]  [ VALS ]  [ MILONGA ]

─────────────────────────────────────────

  Pool: 1,847 songs        ▶ START

─────────────────────────────────────────
```

---

## Sub-tier Naming (Final)

Replace current Classics / Standards / Deep Cuts with:

| Old Name | New Name | Icon | Meaning |
|----------|----------|------|---------|
| Classics | Famous | ⭐ | Top 30% most recognizable within bucket |
| Standards | Regular | ⭐⭐ | Middle 40% — milonga staples |
| Deep Cuts | Obscure | ⭐⭐⭐ | Bottom 30% — specialists only |

**Why:** Removes the "Deep / Deep Cuts" word collision when 🌶🌶🌶 Deep tier is selected. "Obscure" is universally understood.

---

## Config Object Shape (for dataFetching.js)

```js
// Orchestra Quiz — LEVEL mode
{
  primaryFilterMode: "level",           // "level" | "era"
  gridCell: 1,                          // 1-9, maps to tier+subtier
  orchestraTiers: ["Big4"],             // derived from gridCell row
  songDepth: "famous",                  // derived from gridCell col: "famous"|"regular"|"obscure"
  styles: { Tango: true, Vals: true, Milonga: true, Vocals: true },
  periods: [],                          // empty when mode === "level"
}

// Orchestra Quiz — ERA mode
{
  primaryFilterMode: "era",
  gridCell: null,
  orchestraTiers: [],                   // empty when mode === "era"
  songDepth: null,
  styles: { Tango: true, Vals: false, Milonga: true, Vocals: true },
  periods: ["Golden Age"],
}

// Singer Quiz
{
  primaryFilterMode: "familiarity",     // "familiarity" | "era"
  recognitionTiers: ["Iconic"],         // 🎵 selection
  songDepth: "famous",                  // sub-tier
  singerLevel: [1, 2],                  // 🎤 singer level filter
  styles: { Tango: true, Vals: true, Milonga: true },
  periods: [],
}
```

### Grid Cell → Config Mapping

```js
const GRID_MAP = {
  1: { orchestraTiers: ["Big4"],    songDepth: "famous"  },
  2: { orchestraTiers: ["Big4"],    songDepth: "regular" },
  3: { orchestraTiers: ["Big4"],    songDepth: "obscure" },
  4: { orchestraTiers: ["Classic"], songDepth: "famous"  },
  5: { orchestraTiers: ["Classic"], songDepth: "regular" },
  6: { orchestraTiers: ["Classic"], songDepth: "obscure" },
  7: { orchestraTiers: ["Deep"],    songDepth: "famous"  },
  8: { orchestraTiers: ["Deep"],    songDepth: "regular" },
  9: { orchestraTiers: ["Deep"],    songDepth: "obscure" },
}
```

---

## Components Needed

| Component | Status | Notes |
|-----------|--------|-------|
| `DifficultyGrid.js` | ⬜ New | 3×3 grid, single-tap, pool counts, description |
| `FilterModeToggle.js` | ⬜ New | [ LEVEL \| ERA ] or [ FAMILIARITY \| ERA ] toggle |
| `SongDepthSelector.js` | ⬜ New | ⭐ Famous / ⭐⭐ Regular / ⭐⭐⭐ Obscure (replaces sub-tier) |
| `SingerLevelSelector.js` | ⬜ New | 🎤 / 🎤🎤 / 🎤🎤🎤 for Singer Quiz only |
| `OrchestraLevelSelector.js` | ✅ Exists | Keep for non-grid contexts |
| `RecognitionSelector.js` | ✅ Exists | Keep, rename tiers to Famous/Known/DJ/Rare |
| `PeriodsSelector.js` | ✅ Exists | Keep, shown only in ERA mode |
| `StylesSelector.js` | ✅ Exists | Keep, always visible |
| `PoolBadge.js` | ⬜ New | Live song count, disables START if < 40 |

---

## Game Config Summary Table

| Game | Pattern | Primary | Sub-tier | Singer Level | Style | ERA toggle |
|------|---------|---------|----------|--------------|-------|------------|
| orchestra-quiz | A (grid) | 🌶 3×3 | ⭐⭐⭐ | - | ✅ | ✅ swap |
| clip-orchestra | A (grid) | 🌶 3×3 | ⭐⭐⭐ | - | ✅ | ✅ swap |
| orchestra-learn | C | - | - | - | ✅ | ✅ always |
| singer-quiz | B | 🎵 row | ⭐⭐⭐ | 🎤🎤🎤 | ✅ | ✅ swap |
| clip-singer | B | 🎵 row | ⭐⭐⭐ | 🎤🎤🎤 | ✅ | ✅ swap |
| singer-learn | C | - | - | - | ✅ | ✅ always |
| song-quiz | B | 🎵 row | ⭐⭐⭐ | - | ✅ | ✅ swap |
| year-learn | C | - | - | - | ✅ | ✅ always |
| listen | C | - | - | - | ✅ | ✅ always |
| same-song | none | - | - | - | - | - |

---

## Implementation Order for Compas

1. `FilterModeToggle.js` — the swap mechanism (needed by all games)
2. `DifficultyGrid.js` — 3×3 for orchestra games
3. Update `dataFetching.js` — add `primaryFilterMode` + `songDepth` support
4. Wire `orchestra-quiz` ConfigTab → new components
5. Wire `clip-orchestra` ConfigTab → same pattern
6. `SongDepthSelector.js` — ⭐/⭐⭐/⭐⭐⭐ for singer/song games
7. Wire `singer-quiz` + `clip-singer` + `song-quiz` ConfigTabs
8. `PoolBadge.js` — live count on all games
9. Rename sub-tier labels in all components (Classics→Famous, Standards→Regular, Deep Cuts→Obscure)

---

*IO — NTTT Game Config UI Spec v1 — 2026-03-01*
