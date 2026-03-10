# NTTT: Strategic Summary
*Name That Tango Tune — Game, Platform & Ecosystem Vision*

---

## The Core Differentiator

**There is no tango-specific music identification game with daily engagement loops.** El Recodo's quiz exists but it's a static, sessionless test — a tool, not a game. NTTT is the first to combine:

- Tango music ID (completely unserved niche)
- Duolingo-style daily habit mechanics
- Community identity layer (milonga culture, DJ knowledge, dancer pride)
- Progressive skill ladder from beginner dancer → expert DJ

The **niche IS the moat.** No SongPop, no Wordle clone, nothing else touches this.

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

## The Platform Flywheel

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

## The PWA Strategy

Target: Progressive Web App, no app store friction.

- Works on desktop (DJs before a milonga), mobile (dancers at events)
- Push notifications on iOS 16.4+ = Duolingo-style streak reminders
- Share scores → natural social spread within tango communities
- Low barrier to DJ adoption — bookmark, not install

**Critical early validation:** Push notification opt-in rate. This is the retention engine. Without it, daily streaks don't work at scale.

---

## Game Architecture (Tier System)

### Four Modes
| Mode | Description | Pool size |
|------|-------------|-----------|
| **Iconic Songs** | 80 curated must-knows. Onboarding gateway. | 80 songs |
| **Orchestra** | Primary mode. 5 levels × 3 sub-tiers = 15 difficulty positions. | 4,733 songs |
| **Singer** | Era + fame level filters. Requires SingerMaster enrichment. | ~2,000 songs |
| **Title** | Identify composition across any orchestra version. Expert mode. | ~4,733 songs |

### Orchestra Levels (Corrected)
| Level | Orchestras |
|-------|------------|
| **1 — Iconic (Big 4)** | D'Arienzo, Di Sarli, Troilo, Pugliese |
| **2 — Essential** | Canaro, Biagi, Tanturi, Caló, D'Agostino, De Angelis, Rodriguez, Laurenz, Fresedo, Donato, Demare |
| **3 — Deep** | Everyone else (~42 orchestras) |

**Key corrections from current ArtistMaster:**
- Troilo → promote to Level 1 (was Level 2)
- Biagi → demote to Level 2 (was Level 1)
- Fresedo → demote to Level 2 (was Level 1)
- Tanturi → promote to Level 2 (was Level 3)

### Difficulty: Discrete Sub-tiers, Not a Dial
Drop the obscurity slider. Use 3 named positions per level:
- **Classics** — top ~30% most recognizable
- **Standards** — middle ~40%
- **Deep Cuts** — bottom ~30%

Reasons: UX research is clear that sliders fail for precise value selection; 68.6% of songs have zero plays (data too sparse for continuous gradation); discrete levels create shared vocabulary and ensure adequate pool sizes (~50+ songs per position).

---

## Key Data Findings

| Metric | Value |
|--------|-------|
| Total songs | 4,733 |
| Songs with 0 plays | 68.6% (3,247 songs) |
| Curated iconic songs | 80 (51 Tier 1, 28 Tier 2) |
| Orchestras in database | 57 |
| Singers in database | 231 |
| El Recodo quiz plays (validation source) | 840,000+ from 3,464 players, 101 countries |

**The broken formula** (old system):
```
recognitionScore = 0.45×playCount + 0.30×starRating + 0.25×orchestraLevel
```
Max score with 0 plays = 0.55. Tier 1 cutoff = 0.631. **Unbridgeable gap for 68.6% of library.**

**The fix:** Orchestra level becomes the primary difficulty axis. A Level 1 orchestra's obscure recording is more recognizable than a Level 4 orchestra's biggest hit — this is how dancers actually experience music.

---

## Composite Familiarity Score (Replacement Formula)

```
familiarity = (0.35 × orchestra_level_inverted)
            + (0.25 × star_rating_normalized)
            + (0.20 × has_plays_binary)
            + (0.10 × play_count_normalized)
            + (0.10 × singer_fame_score)
            + iconic_bonus
```

Used to sort songs into Classics / Standards / Deep Cuts within each orchestra level. Does not determine which level a song belongs to — orchestra assignment does that.

---

## Top 30 Tier 1 Titles

*Universal — recognizable across versions and orchestras*

La Cumparsita, El Choclo, Por Una Cabeza, El Día Que Me Quieras, Libertango, La Yumba, Malena, Bahía Blanca, Quejas de Bandoneón, Sur, Nostalgias, Milonga Sentimental, A Media Luz, Adiós Muchachos, Recuerdo, Poema, Volver, Mi Buenos Aires Querido, Nueve de Julio, Caminito, Gallo Ciego, Desde el Alma, La Última Curda, Uno, El Flete, Tres Esquinas, A Evaristo Carriego, La Bruja, Paciencia, Adiós Nonino

---

## Level 1 Singers (Corrected)

**Golden Age (10):** Fiorentino (Troilo), Echagüe (D'Arienzo), Mauré (D'Arienzo), Vargas (D'Agostino), Podestá (Di Sarli), Rufino (Di Sarli), Castillo (Tanturi), Campos (Tanturi), Ruiz (De Angelis), Berón (Pugliese/Troilo/Caló)

**Later Era (3):** Goyeneche, Julio Sosa, Edmundo Rivero

**Soloist (1):** Carlos Gardel

**Removed from previous list:** Castaña (misidentification), Lago (wrong orchestra), Mercedes Sosa (folk, not tango)

---

## Implementation Priority

### Phase 1 — MVP
1. **Fix orchestra levels** in ArtistMaster (Troilo up, Biagi/Fresedo down, Tanturi up)
2. **Orchestra Mode** — 5 levels × 3 discrete sub-tiers, full 4,733 song pool
3. **Iconic Songs Mode** — 80 curated songs, onboarding/beginner gateway

### Phase 2 — Post-launch
4. **Title Mode** — requires version-mapping data construction
5. **El Recodo data enrichment** — popularity indicators for top ~200 songs (~6 hrs manual)
6. **Daily Tanda mechanics** — streak, XP, push notifications

### Phase 3 — Platform
7. **Singer Mode** — requires SingerMaster level + era enrichment (~4 hrs)
8. **TangoTiempo integration** — event discovery layer for active game users
9. **Organizer/DJ tools** — playlist builder, recognition analytics, promotion features

---

## The Honest Risk

> "The interconnected apps vision is powerful but sequence matters. The game needs to be genuinely fun and standalone first — the monetization layer only works if the user base is real and engaged."

**One polished mode beats four half-baked modes.** Get Orchestra Mode right — beginners enjoy Level 1 Classics, DJs are challenged by Level 5 Deep Cuts — and you have a game that serves the entire tango community. Everything else is expansion content.

---

*Generated: 2026-03-01 | Session: NTTT Tier Redesign Deep Dive*
