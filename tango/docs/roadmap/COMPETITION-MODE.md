# Competition Mode & Leaderboard Hub

*Predefined levels, global rankings, weekly competitions*

---

## Concept

Competition Mode provides **standardized challenges** where all players use identical settings, enabling fair global score comparison and leaderboards.

---

## Competition Hub UI

```
┌─────────────────────────────────────────────────────────────┐
│  🏆 COMPETITION HUB                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  YOUR RANKING                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🥉 #847 Global    │  🔥 Silver League (Top 15%)   │   │
│  │  ↑ 23 from last week                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🔥 WEEKLY TOURNAMENT (ends in 3d 14h)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "Renaissance Masters"                               │   │
│  │  🎵 Orchestra Quiz • Renaissance Era • All Tiers    │   │
│  │                                                      │   │
│  │  Your best: 892  │  Leader: 987 (@TangoKing)        │   │
│  │                                                      │   │
│  │  [ PLAY NOW ]              [ View Leaderboard ]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  COMPETITION LEVELS                                         │
│                                                             │
│  BEGINNER                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 🌟       │ │ 🌟       │ │ 🌟       │                   │
│  │ Golden   │ │ D'Arienzo│ │ Vals     │                   │
│  │ Classics │ │ Basics   │ │ Intro    │                   │
│  │ #42/1.2k │ │ #156/890 │ │ --/--    │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  INTERMEDIATE                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ ⭐       │ │ ⭐       │ │ ⭐       │                   │
│  │ Mixed    │ │ Singer   │ │ Year     │                   │
│  │ Eras     │ │ Challenge│ │ Master   │                   │
│  │ #89/2.1k │ │ --/--    │ │ #12/456  │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  EXPERT                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 💎       │ │ 💎       │ │ 💎       │                   │
│  │ Deep     │ │ Speed    │ │ Ultimate │                   │
│  │ Cuts     │ │ Round    │ │ Challenge│                   │
│  │ --/--    │ │ #5/234   │ │ --/--    │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📊 LEADERBOARDS                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [ All Time ] [ This Week ] [ Today ] [ Friends ]    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🥇 TangoMaster      12,450 XP   Level 12           │   │
│  │ 🥈 MilongaQueen     11,890 XP   Level 11           │   │
│  │ 🥉 BuenosAiresBob   10,234 XP   Level 10           │   │
│  │  4 DarienzoDan       9,876 XP   Level 9            │   │
│  │  5 ValsVicky         9,654 XP   Level 9            │   │
│  │ ...                                                 │   │
│  │ 847 YOU              2,345 XP   Level 5  ← You     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Level Definitions

### Schema

```json
{
  "levelId": "golden-iconic-15",
  "name": "Golden Age Classics",
  "description": "The must-know hits from the Golden Age",
  "difficulty": "beginner",
  "icon": "🌟",

  "gameType": "orchestra",
  "mode": "timed",

  "settings": {
    "numSongs": 10,
    "timeLimit": 15,
    "recognitionTiers": [1],
    "periods": ["Golden Age"],
    "styles": ["Tango", "Vals", "Milonga"],
    "includeSinger": true
  },

  "scoring": {
    "maxScore": 1000,
    "correctAnswer": 80,
    "speedBonus": {
      "under5sec": 20,
      "under10sec": 10
    },
    "streakBonus": {
      "3inRow": 10,
      "5inRow": 25,
      "perfect": 100
    }
  },

  "leaderboard": true,
  "weeklyReset": false
}
```

### Predefined Levels

#### Beginner (🌟)

| Level ID | Name | Game | Settings |
|----------|------|------|----------|
| `golden-iconic-15` | Golden Age Classics | Orchestra | Golden, Tier 1, 15s |
| `darienzo-basics` | D'Arienzo Basics | Orchestra | D'Arienzo only, 20s |
| `vals-intro` | Vals Introduction | Orchestra | Vals only, Tier 1-2, 20s |
| `singer-famous` | Famous Voices | Singer | All eras, Tier 1, 20s |

#### Intermediate (⭐)

| Level ID | Name | Game | Settings |
|----------|------|------|----------|
| `mixed-eras` | Era Explorer | Orchestra | All eras, Tier 1-2, 12s |
| `singer-challenge` | Singer Challenge | Singer | Golden Age, Tier 1-3, 15s |
| `year-master` | Year Master | Year | Golden Age, Tier 1-2, 15s |
| `milonga-mania` | Milonga Mania | Orchestra | Milonga only, 12s |

#### Expert (💎)

| Level ID | Name | Game | Settings |
|----------|------|------|----------|
| `deep-cuts` | Deep Cuts | Orchestra | Tier 3-5, 10s |
| `speed-round` | Speed Round | Orchestra | Tier 1-2, 5s |
| `ultimate-challenge` | Ultimate Challenge | Mixed | All, Tier 1-5, 8s |
| `guardia-vieja` | Old Guard Expert | Orchestra | Old Guard, 12s |

---

## Weekly Tournament

Every week, a special tournament with:

- **Fixed level** — same settings for everyone
- **Limited attempts** — best of 3 plays
- **Prizes** — badges, XP multipliers
- **Leaderboard** — resets weekly

### Tournament Schedule

| Day | Event |
|-----|-------|
| Monday | New tournament opens |
| Monday-Saturday | Play period |
| Sunday | Final standings, prizes awarded |

---

## League System

Inspired by Duolingo leagues:

```
Diamond    (Top 1%)     ← Promotion zone
  ↑
Platinum   (Top 5%)
  ↑
Gold       (Top 15%)
  ↑
Silver     (Top 35%)    ← You are here
  ↑
Bronze     (Top 60%)
  ↑
Iron       (Everyone)   ← Demotion zone
```

### Weekly League Rules

- Play competition levels to earn League XP
- Top 10 in your bracket get promoted
- Bottom 5 get demoted
- Badges for reaching each league

---

## Leaderboard Data Model

```javascript
// Firestore: leaderboards/{levelId}/scores/{oderedByScore}
{
  oderedByScore: "000982_user123",  // Zero-padded for sorting
  oderedByUser: "user123",
  oderedByDate: "2026-02-26",
  score: 982,
  userId: "user123",
  displayName: "TangoMaster",
  avatar: "url",
  playedAt: timestamp,
  stats: {
    correct: 10,
    avgTime: 4.2,
    streak: 10
  }
}

// Firestore: users/{uid}/competitionScores/{levelId}
{
  levelId: "golden-iconic-15",
  bestScore: 982,
  attempts: 5,
  lastPlayed: timestamp,
  rank: 42
}
```

---

## Score Submission Flow

```
1. User completes competition level
          ↓
2. Client calculates score
          ↓
3. Submit to API: POST /api/scores
   {
     levelId: "golden-iconic-15",
     score: 982,
     answers: [...],  // For anti-cheat
     timing: [...]    // Response times
   }
          ↓
4. Server validates:
   - User authenticated
   - Level exists
   - Score within possible range
   - (Future: anti-cheat checks)
          ↓
5. Update leaderboard
          ↓
6. Return new rank to client
          ↓
7. Client shows result + share option
```

---

## Anti-Cheat Considerations

| Risk | Mitigation |
|------|------------|
| Fake scores | Server-side validation |
| Too-fast answers | Minimum response time |
| Repeated perfect games | Statistical anomaly detection |
| Bot accounts | Rate limiting, captcha |

---

## Sharing Competition Results

```
🏆 NTTT Competition 🏆

Level: Golden Age Classics
Score: 982/1000 ⭐ NEW PERSONAL BEST!

Global Rank: #42 of 1,247 players
Top 4% 📈

Breakdown:
✅ 10/10 correct
⚡ Avg 4.2s response
🔥 Perfect streak!

Can you beat my score?
👉 nttt.app/compete/golden-iconic

#NTTT #TangoQuiz
```

---

## Implementation Phases

### Phase 1: Basic Competition
- [ ] Level definitions (JSON)
- [ ] Locked settings during play
- [ ] Score calculation
- [ ] Local best score tracking

### Phase 2: Leaderboards
- [ ] Firestore schema
- [ ] Score submission API
- [ ] Leaderboard display
- [ ] Your rank indicator

### Phase 3: Weekly Tournament
- [ ] Tournament level rotation
- [ ] Limited attempts
- [ ] Weekly reset
- [ ] Prize distribution

### Phase 4: Leagues
- [ ] League assignment
- [ ] Weekly promotion/demotion
- [ ] League badges
- [ ] League leaderboard

---

*Last updated: 2026-02-26*
