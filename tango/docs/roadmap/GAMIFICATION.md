# Gamification System

*XP, Levels, Streaks, Achievements*

---

## Philosophy

Make every interaction feel rewarding. Users should feel:
- **Progress** — always moving forward
- **Recognition** — achievements celebrate milestones
- **Competition** — leaderboards create stakes
- **Habit** — streaks encourage daily play

---

## XP System

### Earning XP

| Action | XP | Notes |
|--------|-----|-------|
| **Correct answer** | +10 | Base points |
| **Speed bonus** | +5 to +20 | Based on response time |
| **Streak bonus (3)** | +10 | 3 correct in a row |
| **Streak bonus (5)** | +25 | 5 correct in a row |
| **Streak bonus (10)** | +50 | Perfect game |
| **Daily challenge** | +50 | Bonus for completing |
| **Daily first play** | +20 | Encourages daily login |
| **Competition level** | +100 | Higher stakes |
| **Achievement unlock** | +50-500 | Varies by achievement |

### Speed Bonus Tiers

| Response Time | Bonus |
|---------------|-------|
| < 3 seconds | +20 |
| 3-5 seconds | +15 |
| 5-8 seconds | +10 |
| 8-12 seconds | +5 |
| > 12 seconds | +0 |

---

## Levels

### Progression

| Level | Name | XP Required | Total XP |
|-------|------|-------------|----------|
| 1 | Principiante | 0 | 0 |
| 2 | Estudiante | 500 | 500 |
| 3 | Practicante | 1,000 | 1,500 |
| 4 | Bailarín | 2,000 | 3,500 |
| 5 | Milonguero | 3,500 | 7,000 |
| 6 | Tanguero | 5,000 | 12,000 |
| 7 | Maestro | 8,000 | 20,000 |
| 8 | Virtuoso | 12,000 | 32,000 |
| 9 | Leyenda | 18,000 | 50,000 |
| 10 | Gardel | 25,000 | 75,000 |

### Level-Up Rewards

| Level | Reward |
|-------|--------|
| 2 | Unlock Competition Mode |
| 3 | Profile badge |
| 4 | Custom avatar frame |
| 5 | Unlock Expert levels |
| 6 | Profile badge |
| 7 | Unlock Daily Streak Freeze |
| 8 | Profile badge |
| 9 | Special achievement |
| 10 | Legend status, special effects |

---

## Streaks

### Daily Streak

Track consecutive days with at least one completed game.

| Streak | Reward |
|--------|--------|
| 3 days | +10 XP bonus |
| 7 days | +25 XP bonus, badge |
| 14 days | +50 XP bonus |
| 30 days | +100 XP bonus, badge |
| 60 days | +200 XP bonus |
| 100 days | +500 XP bonus, special badge |
| 365 days | Legendary badge |

### Streak Freeze

- Unlocked at Level 7
- Protects streak if you miss a day
- Earn 1 freeze per week of streak
- Max 3 freezes stored

### Streak UI

```
┌─────────────────────────────────────────┐
│  🔥 12-Day Streak                       │
│  ████████████░░░░░░░░░░░░░░░░░ 12/30   │
│  Next milestone: 30 days (+100 XP)      │
│                                         │
│  ❄️ Streak Freezes: 2 remaining        │
└─────────────────────────────────────────┘
```

---

## Achievements

### Categories

#### Getting Started
| Badge | Name | Requirement |
|-------|------|-------------|
| 🎵 | First Notes | Complete your first game |
| ⭐ | Rising Star | Get 80%+ on any game |
| 🎯 | Perfect Game | 10/10 correct |
| 📚 | Student | Complete 10 games |

#### Dedication
| Badge | Name | Requirement |
|-------|------|-------------|
| 🔥 | On Fire | 7-day streak |
| 💪 | Committed | 30-day streak |
| 🏆 | Unstoppable | 100-day streak |
| 📅 | Year-Round | 365-day streak |

#### Mastery
| Badge | Name | Requirement |
|-------|------|-------------|
| 👑 | D'Arienzo Expert | 50 correct D'Arienzo |
| 🎭 | Di Sarli Savant | 50 correct Di Sarli |
| 🎪 | Pugliese Pro | 50 correct Pugliese |
| 🌟 | Golden Age Master | 500 correct Golden Age |

#### Competition
| Badge | Name | Requirement |
|-------|------|-------------|
| 🥉 | Bronze Competitor | Reach Bronze league |
| 🥈 | Silver Competitor | Reach Silver league |
| 🥇 | Gold Competitor | Reach Gold league |
| 💎 | Diamond Elite | Reach Diamond league |
| 🏅 | Top 10 | Finish top 10 in any level |
| 🏆 | Champion | #1 in any level |

#### Milestones
| Badge | Name | Requirement |
|-------|------|-------------|
| 💯 | Century | 100 games completed |
| 🎖️ | Veteran | 500 games completed |
| 🏛️ | Legend | 1,000 games completed |
| ✨ | 10K Club | Earn 10,000 XP |
| 💫 | 50K Club | Earn 50,000 XP |

#### Special
| Badge | Name | Requirement |
|-------|------|-------------|
| 🌅 | Early Bird | Play before 6 AM |
| 🌙 | Night Owl | Play after midnight |
| 🚀 | Speed Demon | 10 answers under 3s |
| 🎲 | Lucky | Perfect game on first try |
| 🤝 | Social | Share 10 results |

---

## Achievement UI

### Pop-up on Unlock
```
┌─────────────────────────────────────────┐
│           🏅 ACHIEVEMENT UNLOCKED!       │
│                                         │
│               [Badge Icon]              │
│                                         │
│            "Perfect Game"               │
│         10/10 correct answers           │
│                                         │
│              +50 XP earned              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         [ Share ]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│              [ Continue ]               │
└─────────────────────────────────────────┘
```

### Achievements Page
```
┌─────────────────────────────────────────┐
│  🏅 ACHIEVEMENTS                        │
│                                         │
│  Unlocked: 12/50                        │
│  ████████░░░░░░░░░░░░░░░░░░░ 24%       │
│                                         │
│  RECENT                                 │
│  ┌─────────────────────────────────┐   │
│  │ 🎯 Perfect Game    Today [Share]│   │
│  │ 🔥 On Fire         Yesterday    │   │
│  │ ⭐ Rising Star     Feb 24       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  CATEGORIES                             │
│  ┌──────────┐ ┌──────────┐            │
│  │ Getting  │ │ Dedica-  │            │
│  │ Started  │ │ tion     │            │
│  │ 4/4 ✅   │ │ 2/4      │            │
│  └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐            │
│  │ Mastery  │ │ Competi- │            │
│  │          │ │ tion     │            │
│  │ 3/10     │ │ 1/6      │            │
│  └──────────┘ └──────────┘            │
└─────────────────────────────────────────┘
```

---

## Progress Bars

Show progress everywhere:

### Game Progress
```
Question 7/10
███████░░░ 70%
```

### Daily Goal
```
Daily Goal: 3/5 games
██████░░░░ 60%
+20 XP at completion
```

### Level Progress
```
Level 5: Milonguero
████████░░ 2,345/3,500 XP
```

### Achievement Progress
```
D'Arienzo Expert: 42/50
████████░░ 84%
```

---

## Data Model

```javascript
// Firestore: users/{uid}/stats
{
  xp: 12450,
  level: 5,
  gamesPlayed: 234,
  correctAnswers: 1876,
  accuracy: 0.89,

  streaks: {
    current: 12,
    best: 45,
    freezesRemaining: 2,
    lastPlayDate: "2026-02-26"
  },

  achievements: [
    { id: "perfect-game", unlockedAt: timestamp },
    { id: "on-fire", unlockedAt: timestamp },
    ...
  ],

  orchestraStats: {
    "D'Arienzo": { correct: 42, total: 50 },
    "Di Sarli": { correct: 38, total: 45 },
    ...
  }
}
```

---

## Notifications

### Push Notifications (Optional)

| Trigger | Message |
|---------|---------|
| Streak at risk | "🔥 Don't lose your 12-day streak! Play now." |
| Daily reset | "🎵 New daily challenge available!" |
| Achievement near | "🎯 Just 3 more for Perfect Game badge!" |
| Friend beat score | "👀 @TangoKing beat your score. Time for revenge?" |
| League demotion risk | "⚠️ You're in the demotion zone. Play to stay!" |

---

## A/B Testing Ideas

| Test | Variants |
|------|----------|
| XP visibility | Always shown vs. end of game only |
| Streak warning | 1 hour before vs. at risk |
| Achievement frequency | Many small vs. fewer big |
| Level curve | Steep vs. gradual |

---

*Last updated: 2026-02-26*
