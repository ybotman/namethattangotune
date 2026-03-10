# User Progress & Gamification Implementation Plan

**Status**: Implementation Guide
**Created**: 2026-03-03
**Author**: Compás
**Sources**: NTTT-MASTER-PLAN.md, GAMIFICATION.md, ANALYTICS-SYSTEM.md, userStatsService.js

---

## Overview

This document consolidates the user progress tracking system — from Firebase backend to GUI display. It defines the **implementation order** and what's already built.

---

## The 3x3 Grid System

### Orchestra Quiz Grid

```
                 Famous       Regular      Obscure
              (Classics)   (Standards)  (Deep Cuts)
           ┌───────────┬───────────┬───────────┐
Big 4      │     1     │     2     │     3     │
(Level 1)  │ D'Arienzo │           │           │
           │ Di Sarli  │           │           │
           │ Troilo    │           │           │
           │ Pugliese  │           │           │
           ├───────────┼───────────┼───────────┤
Classic    │     4     │     5     │     6     │
(Level 2)  │ Canaro    │           │           │
           │ Tanturi   │           │           │
           │ Biagi     │           │           │
           │ + 8 more  │           │           │
           ├───────────┼───────────┼───────────┤
Deep       │     7     │     8     │     9     │
(Level 3)  │ All other │           │           │
           │ orchestras│           │           │
           └───────────┴───────────┴───────────┘
```

### Singer Quiz Grid

```
                 Famous       Common       Obscure
           ┌───────────┬───────────┬───────────┐
Iconic     │     1     │     2     │     3     │
           │ Fiorentino│           │           │
           │ Vargas    │           │           │
           │ Goyeneche │           │           │
           ├───────────┼───────────┼───────────┤
Essential  │     4     │     5     │     6     │
           │           │           │           │
           ├───────────┼───────────┼───────────┤
Standard   │     7     │     8     │     9     │
           │           │           │           │
           └───────────┴───────────┴───────────┘
```

---

## What's Already Built

### Backend (Firebase/Firestore)

| Component | File | Status |
|-----------|------|--------|
| Save session results | `userStatsService.js` | ✅ Done |
| Grid key mappings | `userStatsService.js` | ✅ Done |
| Update user stats | `userStatsService.js` | ✅ Done |
| Fetch user stats | `userStatsService.js` | ✅ Done |
| User context provider | `UserContext.js` | ✅ Done |
| Session tracking hook | `useSessionTracking.js` | ✅ Done |
| Firebase config | `firebase.js` | ✅ Done |
| Firestore rules | `firestore.rules` | ✅ Done |

### Game Integration

| Game | Session Tracking | Status |
|------|------------------|--------|
| orchestra-quiz | `useSessionTracking` | ✅ Done |
| singer-quiz | - | ❌ TODO |
| song-quiz | - | ❌ TODO |
| clip-orchestra | - | ❌ TODO |
| clip-singer | - | ❌ TODO |
| year-learn | - | ❌ TODO |

### GUI

| Component | Status |
|-----------|--------|
| Status page (3x3 grid display) | ✅ Basic |
| Welcome page (quick stats) | ✅ Basic |
| XP display | ❌ TODO |
| Level progress bar | ❌ TODO |
| Streak display | ❌ TODO |
| Achievements | ❌ TODO |

---

## Firestore Schema

### User Document (`users/{uid}`)

```javascript
{
  profile: {
    displayName: "Toby",
    email: "toby@example.com",
    photoURL: "...",
    createdAt: Timestamp
  },

  preferences: {
    theme: "dark",
    defaultNumSongs: 10,
    defaultTimeLimit: 15
  },

  lastLoginAt: Timestamp,

  // Per game type stats
  gameStats: {
    "orchestra-quiz": {
      totalPlayed: 234,
      totalCorrect: 198,
      totalScore: 18450,
      sessionsCompleted: 23,
      bestSessionScore: 980,

      // Per grid cell
      cells: {
        "Big4-Famous": {
          played: 45,
          correct: 42,
          totalScore: 4200,
          sessions: 5,
          bestScore: 920,
          lastPlayed: Timestamp
        },
        "Big4-Regular": { ... },
        // ... all 9 cells
      }
    },
    "singer-quiz": { ... }
  }
}
```

### Session Document (`sessions/{sessionId}`)

```javascript
{
  userId: "firebase-uid",
  userEmail: "toby@example.com",
  gameType: "orchestra-quiz",
  gridCell: 1,
  gridKey: "Big4-Famous",

  config: {
    primaryFilterMode: "grid",
    gridCells: [1],
    orchestraTiers: ["Big4"],
    periods: ["Golden Age"],
    styles: { tango: true, vals: true, milonga: true },
    numSongs: 10,
    timeLimit: 15
  },

  results: [
    { songId: "xxx", correct: true, timeUsed: 4.2, score: 95 },
    { songId: "yyy", correct: false, timeUsed: 12.1, score: 0 },
    // ... per question
  ],

  totalScore: 780,
  correctCount: 8,
  totalQuestions: 10,
  accuracy: 80,
  completedAt: Timestamp
}
```

---

## Implementation Order

### Phase 1: Fix Firebase (BLOCKER)
**Priority: CRITICAL**

1. ✅ Update `.env.local` - use tangotiempo for both auth + data
2. ⏳ Add `NEXT_PUBLIC_FIREBASE_JSON` to Vercel (TEST + PROD)
3. ⏳ Remove `NEXT_PUBLIC_NTTT_FIREBASE_JSON` from Vercel
4. ⏳ Redeploy
5. ⏳ Test login + session save flow

### Phase 2: Add Session Tracking to All Games
**Priority: HIGH**

Add `useSessionTracking` hook to:

```javascript
// Pattern for each PlayTab.js:
import useSessionTracking from "@/hooks/useSessionTracking";

// Inside component:
useSessionTracking({
  gameType: "singer-quiz",  // or clip-orchestra, etc.
  config,
  showFinalSummary,
  roundStats,
  sessionScore,
});
```

Games to update:
- [ ] `singer-quiz/PlayTab.js`
- [ ] `song-quiz/PlayTab.js`
- [ ] `clip-orchestra/PlayTab.js`
- [ ] `clip-singer/PlayTab.js`
- [ ] `year-learn/QuizTab.js`

### Phase 3: Enhance Status Page
**Priority: MEDIUM**

Current Status page shows basic 3x3 grid. Enhance with:

1. **Row/Column Labels**
   - Rows: Big4, Classic, Deep (or Iconic, Essential, Standard)
   - Columns: Famous, Regular, Obscure

2. **Cell Details on Tap**
   - Sessions played
   - Best score
   - Last played date
   - Trend (improving/declining)

3. **Overall Stats Header**
   - Total games played
   - Overall accuracy
   - Current streak
   - Level progress

### Phase 4: XP & Levels
**Priority: MEDIUM**

1. **Add XP calculation** in `useSessionTracking`:
   ```javascript
   const xpEarned = calculateXP({
     correctCount,
     totalQuestions,
     avgResponseTime,
     isPerfect: correctCount === totalQuestions,
     isDaily: false
   });
   ```

2. **Store XP in user doc**:
   ```javascript
   {
     xp: 12450,
     level: 5,
     levelName: "Milonguero"
   }
   ```

3. **Display in UI**:
   - Progress bar on Welcome page
   - Level badge next to username
   - XP earned animation after game

### Phase 5: Streaks
**Priority: MEDIUM**

1. **Track in Firestore**:
   ```javascript
   streaks: {
     current: 12,
     best: 45,
     lastPlayDate: "2026-03-03",
     freezesRemaining: 2
   }
   ```

2. **Update on session save**:
   - If lastPlayDate === yesterday → increment streak
   - If lastPlayDate === today → no change
   - If lastPlayDate < yesterday → reset to 1 (unless freeze used)

3. **Display**:
   - Fire icon with count on Welcome page
   - Streak milestone celebrations

### Phase 6: Daily Challenge
**Priority: LOW (requires more design)

---

## XP Formula

```javascript
function calculateXP({ correctCount, totalQuestions, avgResponseTime, isPerfect, isDaily }) {
  let xp = 0;

  // Base: +10 per correct
  xp += correctCount * 10;

  // Speed bonus: +5 to +20 based on avg response time
  if (avgResponseTime < 3) xp += correctCount * 20;
  else if (avgResponseTime < 5) xp += correctCount * 15;
  else if (avgResponseTime < 8) xp += correctCount * 10;
  else if (avgResponseTime < 12) xp += correctCount * 5;

  // Perfect game bonus
  if (isPerfect) xp += 100;

  // Daily challenge bonus
  if (isDaily) xp += 50;

  // First play of day bonus
  // (check lastPlayDate)

  return xp;
}
```

## Level Thresholds

| Level | Name | XP Required | Cumulative |
|-------|------|-------------|------------|
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

---

## Testing Checklist

### After Phase 1 (Firebase fix):
- [ ] Can log in with Google
- [ ] Can log in with Apple
- [ ] No permission errors in console
- [ ] Session saves to Firestore after game complete
- [ ] Stats show on Status page

### After Phase 2 (All games tracked):
- [ ] Orchestra quiz saves session
- [ ] Singer quiz saves session
- [ ] Song quiz saves session
- [ ] Clip orchestra saves session
- [ ] Clip singer saves session
- [ ] Year quiz saves session
- [ ] Status page shows stats for all game types

### After Phase 3 (Enhanced Status):
- [ ] Grid cells are labeled
- [ ] Tapping cell shows details
- [ ] Color coding reflects accuracy

---

## Files to Modify

| Phase | Files |
|-------|-------|
| 1 | Vercel dashboard only |
| 2 | `singer-quiz/PlayTab.js`, `song-quiz/PlayTab.js`, `clip-orchestra/PlayTab.js`, `clip-singer/PlayTab.js`, `year-learn/QuizTab.js` |
| 3 | `games/gamehub/page.js` (StatusPage component) |
| 4 | `userStatsService.js`, `useSessionTracking.js`, `gamehub/page.js` |
| 5 | `userStatsService.js`, `useSessionTracking.js`, `gamehub/page.js` |

---

## Related Documents

- `NTTT-MASTER-PLAN.md` - Overall vision
- `GAMIFICATION.md` - XP, levels, achievements details
- `ANALYTICS-SYSTEM.md` - Song difficulty tracking
- `SHARED-AUTH-ARCHITECTURE.md` - Firebase auth setup

---

*Last updated: 2026-03-03*
