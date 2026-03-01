# Tier Structure & Song Selection Logic (v3)

**Updated:** 2026-03-01 | **Stage 5a Complete**

---

## Two Filtering Systems (UI Icon Spec)

NTTT uses **two different filtering systems** with distinct icons to avoid confusion:

### 🌶 CHILI = Orchestra Difficulty (How hard to identify)

| UI | Internal | Data Levels | Orchestras | Songs |
|----|----------|-------------|------------|-------|
| 🌶 | Big4 | 1 | 4 (D'Arienzo, Di Sarli, Troilo, Pugliese) | 1,428 |
| 🌶🌶 | Classic | 2 | ~16 (Canaro, Biagi, Tanturi, etc.) | 1,592 |
| 🌶🌶🌶 | Deep | 3, 4, 5 | ~40 (everyone else) | 1,713 |

**Used in:** Orchestra Quiz, Orchestra Learn, Clip Orchestra

**Meaning:** More 🌶 = more orchestras to distinguish = harder

---

### 🎵 NOTES = Knowledge Depth (How well-known the song is)

| UI | Internal | Score Range | Songs |
|----|----------|-------------|-------|
| 🎵 | Famous | 0.8 - 1.0 | 664 |
| 🎵🎵 | Known | 0.6 - 0.8 | 1,328 |
| 🎵🎵🎵 | DJ | 0.4 - 0.6 | 2,125 |
| 🎵🎵🎵🎵 | Rare | 0.0 - 0.4 | 616 |

**Used in:** Singer Quiz, Song Quiz, Title Quiz

**Meaning:** More 🎵 = deeper musical knowledge required

---

### Sub-Tiers (Both Systems)

Within any tier, songs are further divided:

| Sub-Tier | Percentile | Description |
|----------|------------|-------------|
| Classics | Top 30% | Most recognizable |
| Standards | Middle 40% | Regular milonga fare |
| Deep Cuts | Bottom 30% | Specialists only |

---

## Source of Truth

**IconicMaster.json** (v3) - curated from Claude analysis + DJ consensus + strategic research

| Section | Count | Use |
|---------|-------|-----|
| iconicOrchestras | **4** | Big 4 only (D'Arienzo, Di Sarli, Troilo, Pugliese) |
| iconicSingers | **20** (14 L1 + 6 L2) | Singer tiers with era field |
| iconicSongs | 80 (51 T1, 28 T2) | Direct "Iconic Songs" mode |

---

## Four Tiers (Named)

| Tier | Name | El Recodo Equiv | Pool Size | Description |
|------|------|-----------------|-----------|-------------|
| 1 | **Iconic** | Levels 0-3 | ~100-200 | Every tango dancer should know |
| 2 | **Essential** | Levels 4-7 | ~300-500 | Regular milonga-goers recognize |
| 3 | **DJ** | Levels 8-12 | ~500-1,500 | Working DJs and serious enthusiasts |
| 4 | **Deep** | Levels 13-20 | ~1,500-4,733 | Collectors, historians, experts |

---

## Three Sub-Tiers (Discrete, NOT Slider)

Within each orchestra level, songs are divided into:

| Sub-Tier | Name | Percentile | Description |
|----------|------|------------|-------------|
| A | **Classics** | Top ~30% | Most recognizable within that level |
| B | **Standards** | Middle ~40% | Regular milonga fare |
| C | **Deep Cuts** | Bottom ~30% | Specialists only |

**UI:** Segmented control (3 buttons), NOT continuous slider.

**Why:** UX research shows sliders are hard to use. Discrete levels create shared vocabulary ("I cleared Level 2 Deep Cuts!") and ensure adequate pool sizes.

---

## Orchestra Levels (ArtistMaster.json v3)

| Level | Count | Orchestras |
|-------|-------|------------|
| **1 (Iconic)** | 4 | D'Arienzo, Di Sarli, Troilo, Pugliese |
| **2 (Essential)** | 16 | Biagi, Fresedo, Canaro, Tanturi, Caló, D'Agostino, De Angelis, Rodriguez, Laurenz, Donato, Demare, Lomuto, Piazzolla, Varela, OTV, Gardel |
| **3 (Deep)** | 18 | Firpo, Gobbi, Salgán, Sassone, Federico (D), Maderna, modern/neo orchestras |
| **4 (Specialist)** | 16 | Contemporary ensembles, early pioneers |
| **5 (Rare)** | 5 | Historical/obscure |

---

## The Four Game Modes

### Mode 1: ICONIC SONGS (Curated List)
**No algorithm. Direct curated list.**

| Tier | Count | Description |
|------|-------|-------------|
| Tier 1 | 51 | Must-know, every milonga |
| Tier 2 | 28 | Essential for serious dancers |

```
INPUT:  tier (1, 2, or both)
OUTPUT: Exact curated songs (51 or 79)
SUB-TIER: N/A - these ARE the iconic songs
```

---

### Mode 2: ORCHESTRA (Level × Sub-Tier = 15 positions)

| Selection | Description |
|-----------|-------------|
| Orchestra Level | 1-4 (checkboxes, multi-select) |
| Sub-Tier | Classics / Standards / Deep Cuts (segmented control) |

```
INPUT:  orchestraLevels[] + subTier (A/B/C)
STEP 1: Get orchestras at selected levels
STEP 2: Get all songs by those orchestras
STEP 3: Filter by songFamiliarity percentile for sub-tier
OUTPUT: Filtered songs

EXAMPLE: Level 1 + Classics → D'Arienzo/Di Sarli/Troilo/Pugliese greatest hits
         Level 2 + Deep Cuts → Biagi/Fresedo/Tanturi obscure recordings
```

---

### Mode 3: SINGER (Level + Era + Sub-Tier)

| Selection | Options |
|-----------|---------|
| Singer Level | 1 (14 iconic) or 2 (additional) |
| Era | Golden (1935-1955) / Later (1955+) / Both |
| Sub-Tier | Classics / Standards / Deep Cuts |

```
INPUT:  singerLevel + era[] + subTier
OUTPUT: Songs with matching singer profile
```

**Level 1 Singers (14):**
- Golden (10): Fiorentino, Echagüe, Mauré, Vargas, Podestá, Rufino, Castillo, Campos, Chanel, Berón
- Later (3): Goyeneche, Sosa, Rivero
- Soloist (1): Gardel

---

### Mode 4: TITLE (Familiarity Range)

**Pick how famous the TITLE should be. Returns all recordings of matching titles.**

```
INPUT:  familiarityRange (🎵 to 🎵🎵🎵🎵)
OUTPUT: All recordings of titles in range

USE CASE: "Name the Song" - identify TITLE regardless of orchestra
```

**titleFamiliarity formula** (derived from existing data):
```javascript
titleFamiliarity = aggregate across all recordings of same title:
  - max(songFamiliarity) across versions
  - count of recordings (more versions = more famous)
  - avg(starRating) across versions
  - sum(playCount) across versions
```

**Curated iconic titles list:** Phase 2+ enhancement

---

## Data Files Status

### Complete ✅
| File | Status |
|------|--------|
| IconicMaster.json | v3 - 4 orchestras, 20 singers with era |
| ArtistMaster.json | v3 - Corrected levels (Big 4 = L1) |

### Needed (Stage 2-3)
| File | Action |
|------|--------|
| SingerMaster.json | Create with level + era for all singers |
| djSongsWeighted.json | Add orchestraLevel, singerLevel, singerEra, songFamiliarity |
| TitleFamiliarity.json | Build for Title Mode (Phase 2) |

---

## Composite Familiarity Score Algorithm

```javascript
songFamiliarity =
  (0.35 × orchestra_level_inverted) +     // L1=1.0, L5=0.2
  (0.25 × star_rating_normalized) +        // StarRating / 5
  (0.20 × has_plays_binary) +              // 1 if PlayCount > 0
  (0.10 × play_count_normalized) +         // log(PlayCount) / max
  (0.10 × singer_fame_score) +             // From SingerMaster
  iconic_bonus                              // +0.3 if in IconicMaster
```

**Note:** 68.6% of songs have 0 plays, so orchestra_level is the primary signal.

---

## Implementation Stages

| Stage | Status | Commit | Description |
|-------|--------|--------|-------------|
| 1. Data Corrections | ✅ Complete | `deb518cf` | ArtistMaster, IconicMaster fixed |
| 2. SingerMaster | ✅ Complete | `fd4303ee` | 210 singers with level + era |
| 3. Familiarity Score | ✅ Complete | `f26e9ec4` | songFamiliarity on all 4,733 songs |
| 4. dataFetching.js | ✅ Complete | `6c5dc57f` | Discrete sub-tiers + new filters |
| 5a. Orchestra Quiz UI | ✅ Complete | - | OrchestraLevelSelector, orchestraTiers, distractor fix |
| 5b. ArtistMaster type field | ✅ Complete | - | Added `type: orchestra\|soloist` to all entries |
| 5c. Other Games UI | 🟡 In Progress | - | 9 games remaining |
| 6. Title Mode | ⬜ Phase 2 | - | Version mapping |
| 7. Singer Mode | ⬜ Phase 3 | - | Era selector UI |

---

## UI Migration Status

### Games Updated ✅

| Game | Status | Notes |
|------|--------|-------|
| orchestra-quiz | ✅ Complete | OrchestraLevelSelector (3 UI tiers → 5 data levels), distractors from ArtistMaster by level+type |

### Games Pending

| Game | Priority | Migration Notes |
|------|----------|-----------------|
| orchestra-learn | HIGH | Same pattern as quiz |
| singer-quiz | HIGH | Add singerLevels + singerEras |
| singer-learn | HIGH | Add singerLevels + singerEras |
| clip-orchestra | MEDIUM | |
| clip-singer | MEDIUM | |
| title-quiz | MEDIUM | Phase 2 - needs titleFamiliarity |
| same-song | LOW | |
| mystery-clip | LOW | |
| quick-play | LOW | |
| practice | LOW | |

### UI Component Updates

| Component | Status | Icon | Description |
|-----------|--------|------|-------------|
| OrchestraLevelSelector.js | ✅ Created | 🌶 | 3 tiers (Big4/Classic/Deep) → levels 1/2/3-5 |
| RecognitionSelector.js | 🟡 Update needed | 🎵 | 4 tiers (Famous/Known/DJ/Rare) |
| (new) EraSelector.js | ⬜ Planned | - | Golden / Later toggle for singer games |

### Icon System Rationale

| Icon | System | Meaning | Direction |
|------|--------|---------|-----------|
| 🌶 Chili | Orchestra | Difficulty / intensity | More = harder |
| 🎵 Notes | Familiarity | Musical knowledge depth | More = deeper |

**Why two icons?** Visually distinguishes that these are **two different filtering systems**. No explanation needed - player instantly reads:
- 🌶🌶🌶 = "this is going to be tough"
- 🎵🎵🎵 = "this requires deep knowledge"

---

## Data Field Reference

### Song Fields (djSongsWeighted.json)

| UI Selection | JSON Field | Values |
|--------------|------------|--------|
| Familiarity tier | `songFamiliarity` | 0.0-1.0 |
| Sub-tier | percentile of `songFamiliarity` | Classics/Standards/DeepCuts |
| Orchestra level | `orchestraLevel` | 1-5 |
| Singer level | `singerLevel` | 1-3 |
| Singer era | `singerEra` | golden / later |
| Iconic flag | `isIconic` | boolean |

### Artist Fields (ArtistMaster.json)

| Field | Values | Purpose |
|-------|--------|---------|
| `type` | `orchestra` / `soloist` | Filter soloists from orchestra games |
| `level` | 1-5 | Difficulty tier |
| `active` | true/false | Include in games |

### Orchestra UI Tier Mapping (🌶 System)

| UI | Label | Tooltip | ArtistMaster levels | Examples |
|----|-------|---------|---------------------|----------|
| 🌶 | Big4 | "The Big 4" | 1 | D'Arienzo, Di Sarli, Troilo, Pugliese |
| 🌶🌶 | Classic | "Golden Age Classics" | 2 | Canaro, Biagi, Tanturi, Caló |
| 🌶🌶🌶 | Deep | "Deep Cuts" | 3, 4, 5 | Everyone else |

### Familiarity UI Tier Mapping (🎵 System)

| UI | Label | Score Range | Songs |
|----|-------|-------------|-------|
| 🎵 | Famous | 0.8 - 1.0 | 664 |
| 🎵🎵 | Known | 0.6 - 0.8 | 1,328 |
| 🎵🎵🎵 | DJ | 0.4 - 0.6 | 2,125 |
| 🎵🎵🎵🎵 | Rare | 0.0 - 0.4 | 616 |

---

## Distractor Rules

Distractors must match the selected tier exactly - no bleeding across tiers.

| Game Mode | Player Selects | Distractor Pool |
|-----------|----------------|-----------------|
| Orchestra Quiz - Big 4 | Level 1 | ArtistMaster level 1, type=orchestra |
| Orchestra Quiz - Essential | Level 2 | ArtistMaster level 2, type=orchestra |
| Orchestra Quiz - Deep | Levels 3-5 | ArtistMaster levels 3,4,5, type=orchestra |
| Singer Quiz | (TBD) | SingerMaster by level + era |

**Key:** Soloists (Gardel, Lavie) excluded from orchestra games via `type !== "soloist"` filter.

---

## Current Plan & Next Steps

### ✅ Completed This Session
1. OrchestraLevelSelector component (3 tiers → 5 data levels)
2. Orchestra Quiz uses orchestraTiers instead of familiarityTiers
3. Distractors from ArtistMaster filtered by level + type
4. ArtistMaster.json: added `type: orchestra|soloist` field
5. Gardel/Lavie excluded from orchestra distractors

### 🟡 In Progress
- Testing orchestra-quiz with new system
- Icon system spec (🌶 / 🎵) documented

### ⬜ Next Steps (Priority Order)
| # | Task | Effort |
|---|------|--------|
| 1 | Update OrchestraLevelSelector labels to 🌶 icons | Small |
| 2 | Migrate orchestra-learn (same pattern as quiz) | Small |
| 3 | Migrate clip-orchestra | Small |
| 4 | Update RecognitionSelector labels to 🎵 icons | Small |
| 5 | Create SingerLevelSelector + EraSelector | Medium |
| 6 | Migrate singer-quiz, singer-learn, clip-singer | Medium |
| 7 | Add pool count badges + disable low-pool tiers | Medium |
| 8 | Title Mode - use formula from existing data | Medium |

### Future Enhancements
- Pool count badges on tier buttons
- Disable tiers with <40 songs
- Tooltips explaining each tier

---

*Compás - NTTT Tier System v3 - Updated 2026-03-01*
