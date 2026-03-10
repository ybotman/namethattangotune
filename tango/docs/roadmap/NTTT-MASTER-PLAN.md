# NTTT: Master Plan

*Name That Tango Tune — Vision, Architecture & Roadmap*

---

## Vision

**NTTT becomes the Duolingo of tango music recognition** — a gamified learning platform that helps dancers identify orchestras, singers, songs, and years through daily practice, progressive challenges, and social competition.

**The Core Differentiator:** There is no tango-specific music identification game with daily engagement loops. El Recodo's quiz exists but it's a static, sessionless test — a tool, not a game. NTTT is the first to combine:

- Tango music ID (completely unserved niche)
- Duolingo-style daily habit mechanics
- Community identity layer (milonga culture, DJ knowledge, dancer pride)
- Progressive skill ladder from beginner dancer → expert DJ

**The niche IS the moat.** No SongPop, no Wordle clone, nothing else touches this.

---

## The Duolingo Parallel

Duolingo turned language learning — a niche hobby with a passionate community — into a global phenomenon through daily mechanics. Tango has the same ingredients:

| Duolingo | NTTT |
|----------|------|
| Language skill ladder | Tango musical knowledge ladder |
| Daily lesson | Daily "Tanda" (5 songs = the cultural unit) |
| Streak + XP | Streak + tier progression |
| Community pride | Milonga identity ("I'm Level 4 on NTTT") |
| Free + premium | Free game + DJ/organizer tools |

**The daily format writes itself:** one Tanda per day, 5 songs, ~5 minutes. Natural session length. Natural vocabulary. Players already know what a tanda is.

---

## Platform Flywheel

NTTT is not just a game — it's a **tango community acquisition engine**.

```
NTTT Daily Game
    ↓  (engaged, identified tango community)
TangoTiempo Calendar
    ↓  (event discovery, attendance)
Organizer/DJ Monetization
    ↓  (festival promotion, featured placement, connections)
Revenue & Growth
    ↓  (funds better game, more users, stronger community)
```

### Monetization Paths
- **Organizers** pay for featured event placement in TangoTiempo
- **Festival promoters** buy targeted outreach to identified local dancer base
- **DJs** get tools (playlist builder, set history, recognition analytics)
- **Premium game** — advanced modes, unlimited daily plays, leaderboards
- **New user onboarding** — game brings in casual dancers, calendar converts them to event attendees

---

## Game Architecture

### Four Game Modes

| Mode | Description | Pool Size |
|------|-------------|-----------|
| **Iconic Songs** | 80 curated must-knows. Onboarding gateway. | 80 songs |
| **Orchestra** | Primary mode. 5 levels × 3 sub-tiers = 15 difficulty positions. | 4,733 songs |
| **Singer** | Era + fame level filters. Requires SingerMaster enrichment. | ~2,000 songs |
| **Title** | Identify composition across any orchestra version. Expert mode. | ~4,733 songs |

### Orchestra Levels

| Level | Orchestras |
|-------|------------|
| **1 — Iconic (Big 4)** | D'Arienzo, Di Sarli, Troilo, Pugliese |
| **2 — Essential** | Canaro, Biagi, Tanturi, Caló, D'Agostino, De Angelis, Rodriguez, Laurenz, Fresedo, Donato, Demare |
| **3 — Deep** | Everyone else (~42 orchestras) |

### Difficulty Sub-tiers (Per Level)

Drop the obscurity slider. Use 3 named positions per level:
- **Classics** — top ~30% most recognizable
- **Standards** — middle ~40%
- **Deep Cuts** — bottom ~30%

Reasons: UX research shows sliders fail for precise value selection; 68.6% of songs have zero plays (data too sparse for continuous gradation); discrete levels create shared vocabulary and ensure adequate pool sizes (~50+ songs per position).

### Composite Familiarity Score

```
familiarity = (0.35 × orchestra_level_inverted)
            + (0.25 × star_rating_normalized)
            + (0.20 × has_plays_binary)
            + (0.10 × play_count_normalized)
            + (0.10 × singer_fame_score)
            + iconic_bonus
```

Used to sort songs into Classics / Standards / Deep Cuts within each orchestra level.

---

## Key Data

| Metric | Value |
|--------|-------|
| Total songs | 4,733 |
| Songs with 0 plays | 68.6% (3,247 songs) |
| Curated iconic songs | 80 (51 Tier 1, 28 Tier 2) |
| Orchestras in database | 57 |
| Singers in database | 231 |
| El Recodo quiz plays | 840,000+ from 3,464 players, 101 countries |

### Level 1 Singers

**Golden Age (10):** Fiorentino (Troilo), Echagüe (D'Arienzo), Mauré (D'Arienzo), Vargas (D'Agostino), Podestá (Di Sarli), Rufino (Di Sarli), Castillo (Tanturi), Campos (Tanturi), Ruiz (De Angelis), Berón (Pugliese/Troilo/Caló)

**Later Era (3):** Goyeneche, Julio Sosa, Edmundo Rivero

**Soloist (1):** Carlos Gardel

### Top 30 Iconic Titles

La Cumparsita, El Choclo, Por Una Cabeza, El Día Que Me Quieras, Libertango, La Yumba, Malena, Bahía Blanca, Quejas de Bandoneón, Sur, Nostalgias, Milonga Sentimental, A Media Luz, Adiós Muchachos, Recuerdo, Poema, Volver, Mi Buenos Aires Querido, Nueve de Julio, Caminito, Gallo Ciego, Desde el Alma, La Última Curda, Uno, El Flete, Tres Esquinas, A Evaristo Carriego, La Bruja, Paciencia, Adiós Nonino

---

## PWA Strategy

Target: Progressive Web App, no app store friction.

- Works on desktop (DJs before a milonga), mobile (dancers at events)
- Push notifications on iOS 16.4+ = Duolingo-style streak reminders
- Share scores → natural social spread within tango communities
- Low barrier to DJ adoption — bookmark, not install

**Critical early validation:** Push notification opt-in rate. This is the retention engine. Without it, daily streaks don't work at scale.

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
         ├── Levels (Principiante → Gardel)
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
- [ ] Bug fixes
- [ ] Mobile testing complete
- [ ] Performance baseline

**Technical priorities:**
1. Fix orchestra levels in ArtistMaster (Troilo up, Biagi/Fresedo down, Tanturi up)
2. Orchestra Mode — 5 levels × 3 discrete sub-tiers
3. Iconic Songs Mode — 80 curated songs, onboarding gateway

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

### Phase 3: Daily Challenge (v3.2)
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

### Phase 4: Gamification (v3.3)
*Status: PLANNED*

**Goals:**
- Duolingo-level engagement
- Clear progression path
- Dopamine hits everywhere

**XP System:**

| Action | XP |
|--------|-----|
| Correct answer | +10 |
| Speed bonus (under 5s) | +5 to +20 |
| Streak bonus (per 5 correct) | +10 to +50 |
| Daily challenge complete | +50 |
| Perfect game | +100 |
| Achievement unlock | +50 to +500 |

**Levels:**

| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Principiante | 0 |
| 2 | Estudiante | 500 |
| 3 | Practicante | 1,500 |
| 4 | Bailarín | 3,500 |
| 5 | Milonguero | 7,000 |
| 6 | Tanguero | 12,000 |
| 7 | Maestro | 20,000 |
| 8 | Virtuoso | 32,000 |
| 9 | Leyenda | 50,000 |
| 10 | Gardel | 75,000 |

**Streaks:**
- Track consecutive days with at least one completed game
- Milestones at 3, 7, 14, 30, 60, 100, 365 days
- Streak Freeze unlocked at Level 7 (protects one missed day)

*See `GAMIFICATION.md` for full achievement list and UI specs.*

---

### Phase 5: Competition Mode (v3.4)
*Status: PLANNED*

**Goals:**
- Comparable scores across users
- Weekly competition cycles
- Bragging rights

**Features:**
- Predefined levels (fixed settings for fair comparison)
- Global leaderboards per level
- Weekly leagues (Bronze → Silver → Gold → Diamond)
- Promotion/demotion based on rank

*See `COMPETITION-MODE.md` for level definitions and league mechanics.*

---

### Phase 6: Platform Integration (v4.0+)
*Status: FUTURE*

**Goals:**
- Connect game to broader tango ecosystem
- Enable monetization paths
- Build DJ/organizer tools

**Features:**
- TangoTiempo integration — event discovery for game users
- Singer Mode — requires SingerMaster enrichment
- Title Mode — requires version-mapping data
- Organizer/DJ tools — playlist builder, recognition analytics

---

## Success Metrics

| Metric | Current | v3.0 Target | v4.0 Target |
|--------|---------|-------------|-------------|
| DAU | ~10 | 100 | 500 |
| Retention (D7) | unknown | 30% | 50% |
| Games/user/day | ~2 | 3 | 5 |
| Avg session | unknown | 5 min | 8 min |
| Registered users | ~5 | 200 | 1,000 |
| Push notification opt-in | N/A | 40% | 60% |

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
| Low engagement | High | Daily challenge, streaks, push notifications |
| Audio licensing | High | Document fair use, educational purpose |
| Scale issues | Medium | Optimize before v3.5 |
| Scope creep | Medium | Strict phase boundaries |
| Push notification rejection | High | Design compelling opt-in flow |

---

## The Honest Risk

> "The interconnected apps vision is powerful but sequence matters. The game needs to be genuinely fun and standalone first — the monetization layer only works if the user base is real and engaged."

**One polished mode beats four half-baked modes.** Get Orchestra Mode right — beginners enjoy Level 1 Classics, DJs are challenged by Level 5 Deep Cuts — and you have a game that serves the entire tango community. Everything else is expansion content.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `GAMIFICATION.md` | Full XP/achievement/streak specs |
| `COMPETITION-MODE.md` | League and level definitions |
| `USER-FEEDBACK-SYSTEM.md` | Feedback collection design |
| `SOCIAL-SHARING.md` | Share mechanics |
| `ANALYTICS-SYSTEM.md` | Tracking and metrics |
| `UI-INSPIRATIONS.md` | Design references |
| `FEATURES-BACKLOG.md` | Future feature ideas |

---

*Document owner: Compás*
*Last updated: 2026-03-01*
*Merged from: NTTT-strategic-summary.md + ROADMAP.md*
