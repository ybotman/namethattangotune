# Tier Structure & Song Selection Logic (v3)

**Updated:** 2026-03-01 | **Stage 1 Complete**

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

### Mode 4: TITLE (Familiarity Range) - Phase 2

**Pick how famous the TITLE should be. Returns all recordings of matching titles.**

```
INPUT:  familiarityRange (Iconic / Known / Obscure)
OUTPUT: All recordings of titles in range

USE CASE: "Name the Song" - identify TITLE regardless of orchestra
```

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
| 5. UI Migration | 🟡 In Progress | `b0feafb8` | Orchestra Quiz done, 10 games remaining |
| 6. Title Mode | ⬜ Phase 2 | - | Version mapping |
| 7. Singer Mode | ⬜ Phase 3 | - | Era selector UI |

---

## UI Migration Status

### Games Updated ✅

| Game | Status | Notes |
|------|--------|-------|
| orchestra-quiz | ✅ Complete | 4-tier + sub-tier selector |

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

| Component | Change |
|-----------|--------|
| RecognitionSelector.js | 4-tier (I/E/D/X) + sub-tier toggle |
| (new) EraSelector.js | Golden / Later toggle for singer games |
| (new) OrchestraLevelSelector.js | 1-4 level checkboxes |

---

## Data Field Reference

| UI Selection | JSON Field | Values |
|--------------|------------|--------|
| Familiarity tier | `songFamiliarity` | 0.0-1.0 |
| Sub-tier | percentile of `songFamiliarity` | Classics/Standards/DeepCuts |
| Orchestra level | `orchestraLevel` | 1-5 |
| Singer level | `singerLevel` | 1-3 |
| Singer era | `singerEra` | golden / later |
| Iconic flag | `isIconic` | boolean |

---

*Compás - NTTT Tier System v3 - Updated 2026-03-01*
