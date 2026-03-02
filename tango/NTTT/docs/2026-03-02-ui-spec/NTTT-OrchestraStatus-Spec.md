# NTTT Orchestra Status Screen Spec
> IO authored. For Compas implementation. 2026-03-01

---

## Overview

The Status screen appears after a game session ends, or as a standalone progress dashboard accessible from the top menu. It mirrors the 3×3 grid structure of the config screen — making the difficulty architecture visible as a personal scorecard.

---

## Three Tabs

| Tab | Icon | Purpose |
|-----|------|---------|
| My Stats | 📊 | Personal progress across all 9 buckets |
| Orchestras | 🎼 | Per-orchestra breakdown within a tier |
| Contest | 🏆 | Community leaderboard for selected bucket |

---

## Tab 1: My Stats

### Header Summary Bar
Always visible at top regardless of active tab:

| Metric | Source | Display |
|--------|--------|---------|
| Total Played | Sum of all cell play counts | green number |
| Personal Best | Max score across all cells | orange number |

### The 3×3 Grid (interactive)

Same layout as config screen. Each cell shows personal stats instead of pool counts.

**Played cell:**
```
[ 4  ]        ← cell number
[ 8▶ ]        ← songs played (green)
[ ⚡540 ]     ← avg score (gray)
```

**Unplayed cell:**
```
[ 3  ]        ← cell number (dimmed)
[ play ]      ← CTA text
```

- Tapping any cell updates the Cell Detail section below
- Tapping an unplayed cell shows "Play Now" CTA
- Selected cell highlighted in orange

### Cell Detail Panel (below grid)

Appears when a cell is tapped. Shows:

**If played:**
- Tier + depth label (🌶 Big 4 · ⭐ Famous)
- 3 stat cards: 🎵 Played / ⚡ Avg Score / 🏆 Best
- Score bar: visual position vs community top score
- Your rank in this bucket (e.g. #47 of 312)
- "▶ Play this bucket" button → launches game pre-configured to this cell

**If unplayed:**
- "No plays yet in this bucket"
- "▶ Play Now" button → launches game pre-configured to this cell

### 3 Metrics Per Cell

| Metric | Icon | Description | Data Source |
|--------|------|-------------|-------------|
| Played | 🎵 | Songs heard in this bucket | user game history |
| Avg Score | ⚡ | Average points per song | rolling average |
| Best | 🏆 | Highest single-song score | max score recorded |

---

## Tab 2: Orchestras

Drill into per-orchestra performance within a selected tier.

### Tier Selector
3 buttons: 🌶 Big 4 / 🌶🌶 Classic / 🌶🌶🌶 Deep

### Orchestra Progress Bars

For each orchestra in the selected tier:

```
D'Arienzo     ████████░░  82%   23 songs
Di Sarli      ██████░░░░  61%   14 songs
Troilo        ████░░░░░░  41%   7 songs
Pugliese      ██░░░░░░░░  18%   3 songs
```

- Bar fill = % correct identification rate
- Right label = number of songs heard
- Each bar colored distinctly per orchestra
- Unplayed orchestras show at 0% greyed out

### Data Fields Needed (per orchestra per user)
```js
{
  orchestra: "D'Arienzo",
  songsPlayed: 23,
  correctCount: 19,
  pctCorrect: 82,
  avgScore: 740,
  bestScore: 1200,
}
```

---

## Tab 3: Contest

Community leaderboard scoped to the currently selected grid cell.

### Your Rank Card
```
Current bucket: 🌶 Big 4 · ⭐ Famous

#47    312      1,200
rank   players  your best
```

### Leaderboard List

Top 3 + your position. If you're outside top 3, show dots between rank 3 and your rank.

```
🥇  🇦🇷 milonguero_BA    2,100
🥈  🇫🇮 tango_helsinki   1,980
🥉  🇦🇷 dj_porteno       1,850
· · ·
#47 🇺🇸 YOU (you)        1,200  ← highlighted orange
```

### Leaderboard Scope Options (future)
- All time (default)
- This week
- Your region (Boston / Northeast)

### Unplayed Cell in Contest Tab
"Play this bucket to join the contest" + play button.

---

## Navigation — Play from Status

Every cell and the detail panel have a direct "▶ Play" action.
This bypasses the config screen and launches the game pre-configured:

```js
// On "Play this bucket" tap:
navigate('/orchestra-quiz', {
  state: {
    gridCell: selectedCell,           // 1-9
    orchestraTiers: ["Big4"],         // derived from cell
    songDepth: "famous",              // derived from cell
    skipConfig: true,                 // skip ConfigTab, go straight to PlayTab
  }
})
```

`skipConfig: true` means the game loads immediately — no extra taps.

---

## Data Requirements

### User Stats Collection (new)
Each game session must write:

```js
// Per song played:
{
  userId: string,
  gameMode: "orchestra-quiz",
  gridCell: number,          // 1-9
  orchestraTier: string,     // "Big4" | "Classic" | "Deep"
  songDepth: string,         // "famous" | "regular" | "obscure"
  orchestra: string,         // correct answer
  correct: boolean,
  score: number,
  responseTimeMs: number,
  playedAt: Date,
}
```

### Aggregated Stats (computed)
```js
// Per user per cell:
{
  userId: string,
  gridCell: number,
  songsPlayed: number,
  avgScore: number,
  bestScore: number,
  lastPlayed: Date,
}

// Per user per orchestra:
{
  userId: string,
  orchestra: string,
  songsPlayed: number,
  correctCount: number,
  pctCorrect: number,
  avgScore: number,
}

// Contest (per cell):
{
  gridCell: number,
  userId: string,
  bestScore: number,
  rank: number,           // computed on read or nightly job
}
```

---

## Components Needed

| Component | Status | Notes |
|-----------|--------|-------|
| `StatusScreen.js` | ⬜ New | Container, tab bar, header summary |
| `StatsGrid.js` | ⬜ New | 3×3 interactive grid showing personal stats |
| `CellDetail.js` | ⬜ New | Stat cards + score bar + play button |
| `OrchestraTab.js` | ⬜ New | Tier selector + progress bars |
| `ContestTab.js` | ⬜ New | Rank card + leaderboard |
| `useUserStats.js` | ⬜ New | Hook — fetch/aggregate user stats from backend |
| `useContestRank.js` | ⬜ New | Hook — fetch leaderboard for a given cell |

---

## Backend Endpoints Needed (Fulton)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/stats/user/:userId/orchestra` | GET | All cell + orchestra stats for user |
| `/stats/contest/:gridCell` | GET | Leaderboard for one cell (top 10 + user rank) |
| `/stats/session` | POST | Write session results after game ends |

---

## Entry Points to Status Screen

| From | How |
|------|-----|
| Post-game | Auto-navigate after last question |
| Top menu | Persistent "📊" icon in game header |
| Home screen | "My Progress" card |

---

## Implementation Order

1. Backend: `/stats/session` POST endpoint (Fulton)
2. Backend: `/stats/user/:userId/orchestra` GET (Fulton)
3. `useUserStats.js` hook
4. `StatsGrid.js` + `CellDetail.js` — Tab 1
5. `OrchestraTab.js` — Tab 2
6. Backend: `/stats/contest/:gridCell` GET (Fulton)
7. `useContestRank.js` hook
8. `ContestTab.js` — Tab 3
9. Wire post-game navigation → StatusScreen
10. Add entry point in game header

---

*IO — NTTT Orchestra Status Screen Spec v1 — 2026-03-01*
