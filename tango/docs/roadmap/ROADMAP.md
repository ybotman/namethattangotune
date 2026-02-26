# NTTT Roadmap

*Living document - expect frequent updates*

---

## Vision Statement

NTTT becomes the **Duolingo of tango music recognition** — a gamified learning platform that helps dancers identify orchestras, singers, songs, and years through daily practice, progressive challenges, and social competition.

---

## Release Timeline

```
2026 Q1 ─────────────────────────────────────────────────────────
  Feb    v2.0 Beta (current)
         ├── Basic games working
         ├── Local scoring only
         └── Category-based menu

  Mar    v2.5 Stability
         ├── Bug fixes
         ├── Mobile polish
         └── Performance optimization

2026 Q2 ─────────────────────────────────────────────────────────
  Apr    v3.0 GameHub Redesign
         ├── New homepage layout
         ├── Icon tiles for game types
         ├── Segmented mode selector
         └── Progressive config disclosure

  May    v3.1 User Accounts
         ├── Firebase auth polish
         ├── User profiles
         ├── Cloud score sync
         └── Settings persistence

  Jun    v3.2 Daily Challenge
         ├── Daily seeded quiz
         ├── Streak tracking
         ├── Share results (emoji grid)
         └── Push notifications (optional)

2026 Q3 ─────────────────────────────────────────────────────────
  Jul    v3.3 XP & Progression
         ├── XP system
         ├── Levels (Beginner → Milonguero)
         ├── Progress bars
         └── Achievements (badges)

  Aug    v3.4 Competition Mode
         ├── Predefined levels
         ├── Leaderboards
         ├── Weekly leagues
         └── Promotion/demotion

  Sep    v3.5 Social Features
         ├── Friend challenges
         ├── Share to social
         ├── Compare with friends
         └── Community stats

2026 Q4 ─────────────────────────────────────────────────────────
  Oct    v4.0 Learning Paths
         ├── Structured curriculum
         ├── "Duolingo trail" UI
         ├── Skill trees by orchestra
         └── Mastery tracking

  Nov    v4.1 Content Expansion
         ├── More orchestras
         ├── More songs
         ├── Era deep-dives
         └── Educational content

  Dec    v4.2 Polish & Scale
         ├── Performance optimization
         ├── Analytics dashboard
         ├── Admin tools
         └── Documentation

2027+ ───────────────────────────────────────────────────────────
         v5.0 Platform
         ├── Mobile apps (React Native?)
         ├── Offline mode
         ├── Premium features?
         └── API for partners
```

---

## Phase Details

### Phase 1: Foundation (v2.x - Current)
*Status: IN PROGRESS*

**Goals:**
- Stable, bug-free gameplay
- All game modes working
- Mobile-responsive UI

**Deliverables:**
- [x] Orchestra Quiz (timed)
- [x] Singer Quiz (timed)
- [x] Song Title Quiz (timed)
- [x] Year Quiz (timed)
- [x] Clip Quiz (untimed)
- [x] Learn modes
- [x] Listen mode
- [x] Same Song compare
- [ ] Bug fixes (infinite loop fixed)
- [ ] Mobile testing complete
- [ ] Performance baseline

---

### Phase 2: GameHub Redesign (v3.0)
*Status: PLANNING*

**Goals:**
- Modern, engaging homepage
- Reduced friction to play
- Clear visual hierarchy

**Key Changes:**

```
BEFORE (v2.x)                    AFTER (v3.0)
─────────────────────────────    ─────────────────────────────
Category cards                   Daily Challenge hero
├── Timed Quiz                   Stats bar (streak/level)
│   ├── Orchestra               Quick Play tiles
│   ├── Singer                   ├── Orchestra icon
│   ├── Song                     ├── Singer icon
│   └── Year                     ├── Song icon
├── Clip Quiz                    └── Year icon
│   ├── Orchestra               Mode selector (segmented)
│   └── Singer                  [Timed|Practice|Learn|Listen]
├── Learn Mode                  Expandable config
├── Other                       Leaderboard/Achievements
└── Tools
```

**MUI Components:**
- `Card` + `CardActionArea` for game tiles
- `ToggleButtonGroup` for mode selector
- `Accordion` for advanced config
- `LinearProgress` for stats
- `Chip` for filters

---

### Phase 3: User Accounts (v3.1)
*Status: PLANNED*

**Goals:**
- Persistent user identity
- Cross-device sync
- Foundation for leaderboards

**Features:**
- Google sign-in (already implemented)
- Email/password option
- Apple sign-in
- User profile page
- Avatar upload
- Display name
- Privacy settings

**Data Model:**
```javascript
// Firestore: users/{uid}
{
  uid: "firebase-uid",
  displayName: "TangoMaster",
  email: "user@example.com",
  avatar: "url",
  createdAt: timestamp,
  lastActive: timestamp,
  preferences: {
    theme: "dark",
    defaultFilters: { ... }
  }
}
```

---

### Phase 4: Daily Challenge (v3.2)
*Status: PLANNED*

**Goals:**
- #1 retention mechanic
- Shareable results
- FOMO-driven engagement

**Features:**
- One challenge per day (same for all users)
- Seeded random (deterministic per day)
- Streak tracking (consecutive days)
- Share emoji grid to social

**Share Format (Heardle-style):**
```
🎵 NTTT Daily #127 🎵
🟩⬜⬜⬜ Orchestra
🟩🟩⬜⬜ Singer
🟩🟩🟩⬜ Year
Score: 850/1000
🔥 12-day streak

https://nttt.app/daily
```

---

### Phase 5: Gamification (v3.3)
*Status: PLANNED*

**Goals:**
- Duolingo-level engagement
- Clear progression path
- Dopamine hits everywhere

**XP System:**
| Action | XP |
|--------|-----|
| Correct answer | +10 |
| Speed bonus (under 5s) | +5 |
| Streak bonus (per 5 correct) | +10 |
| Daily challenge complete | +50 |
| Perfect game | +100 |

**Levels:**
| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Principiante | 0 |
| 2 | Estudiante | 500 |
| 3 | Practicante | 1,500 |
| 4 | Bailarín | 3,500 |
| 5 | Milonguero | 7,000 |
| 6 | Maestro | 15,000 |

**Achievements:**
- First Perfect Game
- 7-Day Streak
- 100 Games Played
- D'Arienzo Expert (50 correct)
- Golden Age Master
- etc.

---

### Phase 6: Competition Mode (v3.4)
*Status: PLANNED*

**Goals:**
- Comparable scores across users
- Weekly competition cycles
- Bragging rights

**Features:**
- Predefined levels (fixed settings)
- Global leaderboards per level
- Weekly leagues (Bronze → Diamond)
- Promotion/demotion based on rank

**Level Example:**
```json
{
  "levelId": "golden-iconic-15",
  "name": "Golden Age Classics",
  "settings": {
    "gameType": "orchestra",
    "mode": "timed",
    "numSongs": 10,
    "timeLimit": 15,
    "periods": ["Golden Age"],
    "recognitionTiers": [1],
    "styles": ["Tango", "Vals", "Milonga"]
  }
}
```

---

## Success Metrics

| Metric | Current | v3.0 Target | v4.0 Target |
|--------|---------|-------------|-------------|
| DAU | ~10 | 100 | 500 |
| Retention (D7) | unknown | 30% | 50% |
| Games/user/day | ~2 | 3 | 5 |
| Avg session | unknown | 5 min | 8 min |
| Registered users | ~5 | 200 | 1,000 |

---

## Open Questions

1. **Monetization?** — Free forever? Donations? Premium features?
2. **Mobile apps?** — PWA vs React Native vs native
3. **Content licensing?** — Audio rights for public use
4. **Partnerships?** — Tango schools, festivals, DJs
5. **Localization?** — Spanish, other languages

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low engagement | High | Daily challenge, streaks |
| Audio licensing | High | Document fair use, educational purpose |
| Scale issues | Medium | Optimize before v3.5 |
| Scope creep | Medium | Strict phase boundaries |

---

*Document owner: Compás*
*Last updated: 2026-02-26*
