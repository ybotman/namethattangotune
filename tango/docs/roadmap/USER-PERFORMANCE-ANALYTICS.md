# User Performance Analytics

*Per-Orchestra & Per-Singer tracking with study recommendations*

---

## Overview

Track individual user performance by orchestra and singer to:
1. Show users which orchestras/singers they know well
2. Identify knowledge gaps and confusion patterns
3. Provide personalized study recommendations
4. Display progress on the STATS page

---

## Goals

| Goal | Description |
|------|-------------|
| **Visibility** | Show per-orchestra accuracy on STATS page |
| **Insights** | Identify commonly confused pairs |
| **Guidance** | Recommend what to study next |
| **Motivation** | Celebrate mastery, encourage improvement |

---

## Data Requirements

### Enhanced Session Results

Each round answer should include:

```javascript
{
  // Current fields
  songId: "uuid",
  correct: true|false,
  timeUsed: 6234,
  score: 85,

  // NEW: Add these fields
  correctOrchestra: "Juan D'Arienzo",
  userGuess: "Carlos Di Sarli",     // What user selected
  correctSinger: "Alberto Echagüe", // If applicable
  userGuessSinger: "Roberto Rufino" // If singer quiz
}
```

### Per-Orchestra Aggregates (User Level)

Store in Firestore under user document:

```javascript
// users/{uid}/gameStats/orchestra-quiz/orchestras
{
  "Juan D'Arienzo": {
    played: 45,
    correct: 38,
    accuracy: 84,
    lastPlayed: timestamp,

    // Confusion tracking
    confusedWith: {
      "Carlos Di Sarli": 4,  // Guessed Di Sarli when D'Arienzo played
      "Anibal Troilo": 2,
      "Osvaldo Pugliese": 1
    }
  },
  "Carlos Di Sarli": {
    played: 32,
    correct: 28,
    accuracy: 87,
    lastPlayed: timestamp,
    confusedWith: { ... }
  },
  // ... more orchestras
}
```

### Per-Singer Aggregates (User Level)

```javascript
// users/{uid}/gameStats/singer-quiz/singers
{
  "Alberto Echagüe": {
    played: 28,
    correct: 22,
    accuracy: 78,
    lastPlayed: timestamp,
    confusedWith: {
      "Roberto Rufino": 3,
      "Jorge Durán": 2
    }
  },
  // ... more singers
}
```

---

## STATS Page Display

### Orchestra Knowledge Grid

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR ORCHESTRA KNOWLEDGE                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  STRONG (80%+)                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ D'Arienzo    ████████████████████ 92%  (45 played) │    │
│  │ Di Sarli     ███████████████████░ 87%  (32 played) │    │
│  │ Pugliese     ██████████████████░░ 85%  (28 played) │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  NEEDS WORK (50-79%)                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Troilo       █████████████░░░░░░░ 68%  (22 played) │    │
│  │ Canaro       ████████████░░░░░░░░ 62%  (18 played) │    │
│  │ Fresedo      ███████████░░░░░░░░░ 58%  (15 played) │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  NOT ENOUGH DATA (<10 plays)                                │
│  Laurenz (8), Demare (5), Biagi (3), Calo (2)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Confusion Insights

```
┌─────────────────────────────────────────────────────────────┐
│  COMMON MIX-UPS                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  When you hear TROILO, you sometimes guess:                 │
│  └── Pugliese (6 times) ← Focus here                        │
│                                                              │
│  When you hear CANARO, you sometimes guess:                 │
│  └── Fresedo (4 times)                                      │
│                                                              │
│  💡 TIP: Compare Troilo vs Pugliese in Listen mode          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Study Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│  📚 RECOMMENDED STUDY                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Based on your results:                                      │
│                                                              │
│  1. PRACTICE TROILO                                          │
│     Your accuracy: 68% (22 games)                           │
│     Often confused with: Pugliese                           │
│     [ Start Orchestra Learn → Troilo ]                      │
│                                                              │
│  2. EXPLORE FRESEDO                                          │
│     Only 15 plays, accuracy could improve                   │
│     [ Start Listen Mode → Fresedo ]                         │
│                                                              │
│  3. COMPARE: CANARO vs FRESEDO                              │
│     You mix these up often                                  │
│     [ Same Song Compare → Both ]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Report Types for Backend (Fulton)

### 1. User Orchestra Performance Report

**Input:** userId
**Output:**
```javascript
{
  userId: "abc123",
  generatedAt: timestamp,

  orchestraStats: [
    {
      orchestra: "Juan D'Arienzo",
      played: 45,
      correct: 38,
      accuracy: 84,
      rank: 1,  // Best orchestra for this user
      trend: "stable", // improving, declining, stable
      confusedWith: ["Carlos Di Sarli", "Anibal Troilo"]
    },
    // ... sorted by played count
  ],

  // Summary
  totalOrchestrasPlayed: 12,
  strongOrchestras: 5,    // 80%+
  needsWorkOrchestras: 4, // 50-79%
  weakOrchestras: 3,      // <50%

  // Top confusions
  topConfusions: [
    { when: "Troilo", guessed: "Pugliese", times: 6 },
    { when: "Canaro", guessed: "Fresedo", times: 4 }
  ]
}
```

### 2. User Singer Performance Report

**Input:** userId
**Output:** Same structure as orchestra, but for singers

### 3. Study Recommendations Report

**Input:** userId
**Output:**
```javascript
{
  userId: "abc123",
  recommendations: [
    {
      type: "practice",
      target: "Troilo",
      reason: "Low accuracy (68%) with 22 plays",
      suggestedAction: "orchestra-learn",
      priority: 1
    },
    {
      type: "explore",
      target: "Fresedo",
      reason: "Limited exposure (15 plays)",
      suggestedAction: "listen-mode",
      priority: 2
    },
    {
      type: "compare",
      targets: ["Canaro", "Fresedo"],
      reason: "Frequently confused",
      suggestedAction: "same-song-compare",
      priority: 3
    }
  ]
}
```

### 4. Grid Cell Performance Report

**Input:** userId, gameType
**Output:**
```javascript
{
  userId: "abc123",
  gameType: "orchestra-quiz",

  gridStats: {
    "Icons-Famous": { played: 45, correct: 40, accuracy: 89 },
    "Icons-Known": { played: 32, correct: 24, accuracy: 75 },
    "Core-Famous": { played: 28, correct: 22, accuracy: 78 },
    // ... all 9 cells
  },

  // Recommendations based on grid
  weakCells: ["Icons-Obscure", "Core-Obscure"],
  strongCells: ["Icons-Famous", "Core-Famous"]
}
```

---

## Implementation Phases

### Phase 1: Data Collection (Frontend - Compás)
- [ ] Enhance session results with orchestra/singer fields
- [ ] Store correctOrchestra and userGuess in each round
- [ ] Update userStatsService to save per-orchestra stats

### Phase 2: Aggregation (Backend - Fulton)
- [ ] Azure Function to aggregate per-orchestra/singer stats
- [ ] Calculate confusion matrix from session data
- [ ] Generate study recommendations algorithm

### Phase 3: Display (Frontend - Compás)
- [ ] Add Orchestra Knowledge section to STATS page
- [ ] Add Singer Knowledge section
- [ ] Add Confusion Insights card
- [ ] Add Study Recommendations card

### Phase 4: Advanced (Future)
- [ ] Trend tracking (improving/declining)
- [ ] Achievement integration (Orchestra Expert badges)
- [ ] Push notifications for study reminders
- [ ] MongoDB migration for advanced queries

---

## Data Storage Decision

| Storage | Use Case |
|---------|----------|
| **Firestore** | User aggregates (orchestra stats, singer stats) |
| **MongoDB** | Raw session details, confusion matrix queries, complex analytics |

For Phase 1-3, Firestore is sufficient. MongoDB becomes valuable in Phase 4 for:
- Cross-user analytics
- Complex confusion pattern queries
- Historical trend analysis
- Admin dashboards

---

## Dependencies

- **userStatsService.js** — Needs enhancement to track orchestra/singer
- **useSessionTracking.js** — Pass orchestra/singer with each round result
- **gamehub/page.js** — STATS page needs new components
- **Azure Functions** — Report generation endpoints

---

*Compás - Phase 2 Analytics Design*
*Created: 2026-03-03*
