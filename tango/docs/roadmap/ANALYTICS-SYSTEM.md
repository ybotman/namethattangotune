# Analytics & Pattern Detection System

*Track user performance to improve song difficulty classification*

---

## Goals

1. **Understand difficulty** — Which songs are too easy/hard for their tier?
2. **Detect patterns** — What criteria combinations cause confusion?
3. **Improve classification** — Data-driven tier adjustments
4. **Personalize learning** — Know what each user struggles with

---

## What We Track

### Per Answer Event

Every time a user answers (right or wrong), log:

```javascript
{
  // Event metadata
  eventId: "uuid",
  timestamp: "2026-02-26T14:30:00Z",

  // User (anonymous allowed)
  userId: "firebase-uid" | "anon-session-id",
  isAuthenticated: true,
  userLevel: 5,

  // Game context
  gameType: "orchestra",        // orchestra, singer, song, year
  gameMode: "timed",            // timed, clip, learn
  levelId: "golden-iconic-15",  // null for custom games

  // Question context
  questionNumber: 3,
  totalQuestions: 10,

  // The song
  songId: "uuid",
  songTitle: "La Cumparsita",
  orchestra: "Juan D'Arienzo",
  singer: "",
  year: 1951,
  style: "Tango",
  period: "Golden Age",
  recognitionTier: 1,

  // Selection criteria used
  criteria: {
    periods: ["Golden Age"],
    styles: ["Tango", "Vals", "Milonga"],
    recognitionTiers: [1],
    includeSinger: true
  },

  // The answer
  correctAnswer: "Juan D'Arienzo",
  userAnswer: "Carlos Di Sarli",
  isCorrect: false,

  // All choices shown
  choices: ["Juan D'Arienzo", "Carlos Di Sarli", "Anibal Troilo", "Osvaldo Pugliese"],

  // Timing
  responseTimeMs: 8234,
  timeLimit: 15,

  // Position in session
  streakBefore: 2,
  sessionGameNumber: 3
}
```

### Aggregated Song Stats

Roll up per-song statistics:

```javascript
// Firestore: songStats/{songId}
{
  songId: "uuid",
  songTitle: "La Cumparsita",
  orchestra: "Juan D'Arienzo",
  currentTier: 1,

  // Global stats
  totalAttempts: 1247,
  correctCount: 1089,
  accuracy: 0.873,  // 87.3%

  // By game type
  byGameType: {
    orchestra: { attempts: 800, correct: 720, accuracy: 0.90 },
    singer: { attempts: 0, correct: 0, accuracy: null },
    song: { attempts: 300, correct: 240, accuracy: 0.80 },
    year: { attempts: 147, correct: 129, accuracy: 0.878 }
  },

  // By user level
  byUserLevel: {
    1: { attempts: 200, correct: 140, accuracy: 0.70 },
    2: { attempts: 300, correct: 240, accuracy: 0.80 },
    3: { attempts: 400, correct: 360, accuracy: 0.90 },
    4: { attempts: 200, correct: 190, accuracy: 0.95 },
    5: { attempts: 147, correct: 159, accuracy: 0.98 }
  },

  // Confusion matrix - what do people guess instead?
  confusedWith: {
    "Carlos Di Sarli": 89,      // Most common wrong answer
    "Anibal Troilo": 45,
    "Osvaldo Pugliese": 24
  },

  // Timing stats
  avgResponseTimeMs: 6500,
  medianResponseTimeMs: 5800,

  // Trend
  last7DaysAccuracy: 0.89,
  last30DaysAccuracy: 0.87,
  trend: "stable",  // improving, declining, stable

  // Flags
  flaggedForReview: false,
  tierMismatchScore: 0.12,  // How much accuracy differs from tier expectation

  lastUpdated: timestamp
}
```

### Aggregated Criteria Stats

Understand which criteria combinations are hardest:

```javascript
// Firestore: criteriaStats/{criteriaHash}
{
  criteriaHash: "golden-tango-tier1-vocals",

  criteria: {
    periods: ["Golden Age"],
    styles: ["Tango"],
    recognitionTiers: [1],
    includeSinger: true
  },

  totalAttempts: 5678,
  accuracy: 0.82,
  avgResponseTimeMs: 7200,

  // Hardest songs in this criteria
  hardestSongs: [
    { songId: "x", title: "Song A", accuracy: 0.45 },
    { songId: "y", title: "Song B", accuracy: 0.52 },
    { songId: "z", title: "Song C", accuracy: 0.58 }
  ],

  // Easiest songs
  easiestSongs: [
    { songId: "a", title: "Song D", accuracy: 0.98 },
    { songId: "b", title: "Song E", accuracy: 0.97 },
    { songId: "c", title: "Song F", accuracy: 0.96 }
  ]
}
```

---

## Pattern Detection Queries

### Songs That Are Too Easy for Their Tier

```javascript
// Find Tier 3 songs with >90% accuracy (should be lower)
db.collection('songStats')
  .where('currentTier', '==', 3)
  .where('accuracy', '>', 0.90)
  .where('totalAttempts', '>', 50)  // Minimum sample size
  .orderBy('accuracy', 'desc')
```

**Action:** Consider promoting to Tier 2 or 1

### Songs That Are Too Hard for Their Tier

```javascript
// Find Tier 1 songs with <70% accuracy (should be higher)
db.collection('songStats')
  .where('currentTier', '==', 1)
  .where('accuracy', '<', 0.70)
  .where('totalAttempts', '>', 50)
  .orderBy('accuracy', 'asc')
```

**Action:** Consider demoting to Tier 2 or 3

### Commonly Confused Orchestras

```javascript
// Find pairs of orchestras often confused
// Aggregate from answer events where userAnswer != correctAnswer
// Group by (correctAnswer, userAnswer) pairs
```

**Action:** Educational content, better distinguishing features

### Criteria Combinations That Are Surprisingly Hard

```javascript
// Find criteria with accuracy much lower than expected
db.collection('criteriaStats')
  .where('accuracy', '<', 0.60)
  .where('totalAttempts', '>', 100)
  .orderBy('accuracy', 'asc')
```

**Action:** Investigate why, adjust difficulty expectations

---

## Expected Accuracy by Tier

| Tier | Name | Expected Accuracy |
|------|------|-------------------|
| 1 | Iconic | 85-95% |
| 2 | Well-Known | 70-85% |
| 3 | Familiar | 55-70% |
| 4 | Obscure | 40-55% |
| 5 | Rare | 25-40% |

Songs significantly outside their expected range should be flagged for review.

---

## Tier Mismatch Score

Calculate how "wrong" a song's tier is:

```javascript
function calculateTierMismatch(song) {
  const expectedRanges = {
    1: [0.85, 0.95],
    2: [0.70, 0.85],
    3: [0.55, 0.70],
    4: [0.40, 0.55],
    5: [0.25, 0.40]
  };

  const [min, max] = expectedRanges[song.currentTier];
  const accuracy = song.accuracy;

  if (accuracy > max) {
    // Too easy - should be higher tier
    return accuracy - max;  // Positive = promote
  } else if (accuracy < min) {
    // Too hard - should be lower tier
    return accuracy - min;  // Negative = demote
  } else {
    return 0;  // Within range
  }
}
```

---

## Admin Dashboard Views

### 1. Tier Health Overview

```
┌─────────────────────────────────────────────────────────────┐
│  TIER HEALTH DASHBOARD                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tier 1: Iconic (91 songs)                                  │
│  Expected: 85-95%  │  Actual: 88%  │  ✅ Healthy            │
│  ├── 3 songs too easy (>95%)                               │
│  └── 5 songs too hard (<85%)                               │
│                                                             │
│  Tier 2: Well-Known (621 songs)                            │
│  Expected: 70-85%  │  Actual: 76%  │  ✅ Healthy            │
│  ├── 12 songs too easy                                     │
│  └── 8 songs too hard                                      │
│                                                             │
│  Tier 3: Familiar (1,418 songs)                            │
│  Expected: 55-70%  │  Actual: 58%  │  ✅ Healthy            │
│  ├── 45 songs too easy                                     │
│  └── 32 songs too hard                                     │
│                                                             │
│  [ View Outliers ] [ Export Report ] [ Auto-Suggest ]      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Song Outliers List

```
┌─────────────────────────────────────────────────────────────┐
│  SONGS FLAGGED FOR REVIEW                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TOO EASY (should promote)                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Song              │ Tier │ Accuracy │ Attempts │ Act │   │
│  ├───────────────────┼──────┼──────────┼──────────┼─────┤   │
│  │ La Cumparsita     │  2   │   96%    │   234    │ ⬆️  │   │
│  │ El Choclo         │  2   │   94%    │   189    │ ⬆️  │   │
│  │ Poema             │  3   │   89%    │   145    │ ⬆️  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  TOO HARD (should demote)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Song              │ Tier │ Accuracy │ Attempts │ Act │   │
│  ├───────────────────┼──────┼──────────┼──────────┼─────┤   │
│  │ Milonga Triste    │  1   │   62%    │   156    │ ⬇️  │   │
│  │ Remembranzas      │  1   │   58%    │   123    │ ⬇️  │   │
│  │ Comme Il Faut     │  2   │   52%    │   98     │ ⬇️  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ Apply Suggestions ] [ Ignore ] [ Review Manually ]      │
└─────────────────────────────────────────────────────────────┘
```

### 3. Confusion Matrix

```
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRA CONFUSION MATRIX                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  When the answer is D'ARIENZO, users guess:                │
│  ├── D'Arienzo: 89% ✅                                     │
│  ├── Di Sarli: 5% (most confused)                          │
│  ├── Troilo: 3%                                            │
│  └── Other: 3%                                             │
│                                                             │
│  Most confused pairs:                                       │
│  1. Troilo ↔ Pugliese (8% confusion rate)                  │
│  2. Canaro ↔ Fresedo (6% confusion rate)                   │
│  3. Laurenz ↔ Demare (5% confusion rate)                   │
│                                                             │
│  [ Create Educational Content ] [ View Details ]           │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Pipeline

```
User answers question
        ↓
Client sends answer event
        ↓
Firebase Function: processAnswerEvent
        ├── Write to answerEvents collection (raw)
        ├── Update songStats (increment counters)
        ├── Update userStats (for personalization)
        └── Update criteriaStats (aggregates)
        ↓
Scheduled Function: calculateOutliers (daily)
        ├── Find tier mismatches
        ├── Flag songs for review
        └── Generate admin report
        ↓
Admin reviews in dashboard
        ↓
Admin adjusts tiers
        ↓
djSongsWeighted.json updated
```

---

## Privacy Considerations

| Data | Retention | Notes |
|------|-----------|-------|
| Raw answer events | 90 days | Then aggregate & delete |
| Per-user stats | Indefinite | Tied to account |
| Anonymous sessions | 30 days | No PII |
| Aggregated song stats | Indefinite | No user data |

---

## Implementation Phases

### Phase 1: Basic Tracking
- [ ] Answer event schema
- [ ] Client-side event logging
- [ ] Firestore write on answer
- [ ] Basic songStats aggregation

### Phase 2: Aggregation Pipeline
- [ ] Firebase Function for real-time aggregation
- [ ] Daily batch job for outlier detection
- [ ] criteriaStats collection

### Phase 3: Admin Dashboard
- [ ] Tier health overview
- [ ] Song outliers list
- [ ] Confusion matrix view
- [ ] Export to CSV

### Phase 4: Automation
- [ ] Auto-suggest tier changes
- [ ] Confidence thresholds
- [ ] One-click apply changes
- [ ] Audit log

---

*Last updated: 2026-02-26*
