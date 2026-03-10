# NTTT Pre-Launch Audit Report
**Name That Tango Tune — Data Integrity Review**  
Generated from: `gridInventory.json`, `singerGridInventory.json`, `songGridInventory.json`  
Total songs analyzed: **4,733**

---

## Summary Scorecard

| Category | Severity | Count | Action |
|---|---|---|---|
| Non-tango tracks in database | 🔴 Critical | 4+ | Remove |
| Blank orchestra field | 🔴 Critical | 1,305 | Fix or separate |
| Filename-style titles (raw metadata) | 🔴 Critical | 7+ | Clean titles |
| Orchestra names in Singer field | 🔴 Critical | ~15 songs | Fix field mapping |
| Wrong singer/orchestra pairing | 🟠 High | 1 confirmed | Fix attribution |
| Post-death year anomaly (Troilo 1999) | 🟠 High | 1 | Fix year |
| Missing major orchestras | 🟠 High | 2 | Add Laurenz, Biagi |
| Duplicate records | 🟡 Medium | 421 records | Deduplicate |
| Singer tier vs orchestra tier mismatch | 🟡 Medium | 256 songs | Review policy |
| Iconic song familiarity underscored | 🟡 Medium | Several | Review scores |
| Piazzolla / Gardel as "orchestra" | 🟢 Low | 13 songs | Acceptable, review |

---

## 🔴 CRITICAL ISSUES

### 1. Non-Tango / Non-Argentine Tracks

These tracks have **no business being in an Argentine tango game**. They are Turkish popular music or completely unidentifiable tracks that crept into the database.

| Title | Orchestra | Year | Cell |
|---|---|---|---|
| Son nefes - Ibrahim Ozgur | (blank) | 2001 | Niche-Famous |
| Askin sesi - Ibrahim Ozgur | (blank) | 2001 | Niche-Known |
| Ayse - Ibrahim Ozgur | (blank) | 2004 | Niche-Known |
| Begin for Julia | (blank) | 2001 | Niche-Known |

**Ibrahim Ozgur is a Turkish musician.** These tracks appear to have been ingested from an untrusted source alongside legitimate tango files. Also review all ~327 post-1975 blank-orchestra tracks for similar contamination.

**Action:** Delete these 4 records immediately. Run a broader scan of blank-orchestra post-1990 tracks for additional non-tango content.

---

### 2. Blank Orchestra Field — 1,305 Songs

This is the largest data quality problem in the database. **27.6% of all songs have no orchestra assigned**, yet they are all appearing in the game under the Niche tier.

**Distribution:**
- `Niche-Famous`: 85 songs
- `Niche-Known`: 1,220 songs
- Instrumental (no singer either): 801 songs
- Has singer but no orchestra: 504 songs

**Examples of well-known songs with blank orchestra:**

| Title | Singer | Year | Problem |
|---|---|---|---|
| Sin rumbo fijo | Angel Vargas | 1938 | Vargas sang with D'Agostino — orchestra should not be blank |
| Carrillon de la Merced | Ernesto Fama | 1931 | Fama sang with Canaro |
| Cuartito azul | Ricardo Ruiz | 1939 | Should be Francisco Lomuto |
| Telon | Roberto Ray | 1938 | Ray sang with Di Sarli / Fresedo |
| Yo Soy De San Telmo | Alberto Podesta | 1943 | Podesta sang with Di Sarli / Caló |

The pattern is clear: many of these are real golden-age recordings where the orchestra field simply wasn't populated during ingestion. The singers are recognized, the songs are real — the orchestra FK is just missing.

**Action:** This needs a data backfill pass. Cross-reference by singer name against their known orchestras to recover ~60% of these. The Turkish tracks above are within this set — blanks must be audited track by track before any go live.

---

### 3. Filename-Style Titles (Raw Metadata in Title Field)

Several songs have file processing metadata embedded in their title field. These will display literally in-game and break immersion.

| Raw Title | Should Be | Orchestra |
|---|---|---|
| `Hasta Siempre Amor(jorge.valdez)-S-R-V-*` | Hasta Siempre Amor | Juan D'Arienzo |
| `Remembranzas(slow.ver)-S-R-V` | Remembranzas (slow) | Juan D'Arienzo |
| `Remembranza(fast.ver)-S-R-V` | Remembranza (fast) | Juan D'Arienzo |
| `Pedacito De Cielo(1942.alberto.podesta)-S-V` | Pedacito de Cielo | Miguel Caló |
| `Bajo Un Cielo De Estrellas(1941.alberto.podesta)-F-V` | Bajo un Cielo de Estrellas | Miguel Caló |
| `02 - Orquesta Romantica Milonguera - Poema` | Poema | Orquesta Romantica Milonguera |

The `-S-R-V-*` suffixes are file-processing flags (Singer/Restored/Vocal etc.). The parenthetical metadata like `(jorge.valdez)` and `(1942.alberto.podesta)` are internal tags.

**Action:** Strip all processing suffixes from display titles. Create a `rawFileName` field for internal tracking if needed.

---

### 4. Orchestra Names Stored in Singer Field

At least 15 songs have an orchestra name in the `singer` field and a blank `orchestra` field — the fields are swapped.

| "Singer" Value | Title | What's Really Happening |
|---|---|---|
| Orquesta Emilio Balcarce | La pulpera de Santa Lucia | Emilio Balcarce IS the orchestra |
| Orquesta Enrique Alessio | Idilio trunco | Enrique Alessio IS the orchestra |
| Orquesta Enrique Alessio | Violetas | Same |
| Orquesta Angel Condercuri | La vieja serenata | Same |
| Orquesta Jorge Dragone | Que Nadie Sepa Mi Sufrir | Same |

All of these also have a blank orchestra. The orchestra name was apparently entered into the singer column during data entry.

**Action:** For all records where `singer` starts with "Orquesta": move value to `orchestra`, set `singer` to null, set `vocalType` to "instrumental" (unless actual singer is known).

---

## 🟠 HIGH PRIORITY ISSUES

### 5. Roberto Rufino Attributed to Troilo's "Desencuentro"

**1 confirmed wrong singer/orchestra pairing:**

| Title | Orchestra | Singer | Problem |
|---|---|---|---|
| Desencuentro | Anibal Troilo | Roberto Rufino | 1963 |

Roberto Rufino was Carlos Di Sarli's primary singer throughout the golden age. He is correctly listed with Di Sarli for 78 other songs in the singer grid. Troilo's recording of "Desencuentro" (1963) was sung by **Edmundo Rivero**, not Rufino. This is a misattribution.

**Action:** Change singer on this record from `Roberto Rufino` → `Edmundo Rivero`.

---

### 6. "Palomita Blanca" (Troilo) Dated 1999

Aníbal Troilo died in **May 1975**. A recording dated 1999 under his name is almost certainly either a remaster/re-release being tagged with the release year rather than the recording year, or a compilation album date.

**Action:** Verify and correct to the original recording year. Likely 1940s–1960s.

---

### 7. Missing Orchestras: Pedro Laurenz and Rodolfo Biagi

**Pedro Laurenz** and **Rodolfo Biagi** are completely absent from the grid. Both are significant golden-age orchestras widely played at milongas:

- **Pedro Laurenz** — "Milonga de mis amores", "Nunca tuvo novio", "Arrabalera". A Core-level orchestra at minimum, arguably Icons-adjacent.
- **Rodolfo Biagi** ("Manos Brujas") — "El recodo", "Racing Club", "Indiferencia". Distinctive staccato rhythmic style, played at virtually every milonga. Core-level.

These are gaps that a serious tango dancer will notice immediately.

**Action:** Classify both as Core (level 2) and add their catalogs.

---

## 🟡 MEDIUM ISSUES

### 8. Duplicate Records — 421 Entries

421 records share the same title + orchestra + year combination. Worst offenders:

| Title | Orchestra | Year | Count |
|---|---|---|---|
| Canaro | Juan D'Arienzo | 1941 | 5× |
| Adios Bardi | Osvaldo Pugliese | 1944 | 5× |
| Verdemar | Carlos Di Sarli | 1943 | 4× |
| Chique | Juan D'Arienzo | 1942 | 4× |
| Amurado | Osvaldo Pugliese | 1944 | 4× |
| Quejas de bandoneon | Anibal Troilo | 1952 | 4× |
| Indiferencia | (blank) | 1942 | 4× |

Some may be intentional (different versions — slow vs fast, vocal vs instrumental) and the title just needs disambiguation. Others are true duplicates. The filename-style titles like `Remembranzas(slow.ver)` and `Remembranza(fast.ver)` suggest this is partially intentional, but the cleanup is incomplete.

**Action:** Audit duplicates. If truly different versions, ensure titles distinguish them clearly. Merge true duplicates.

---

### 9. Singer Tier vs Orchestra Tier Mismatch (256 Songs)

The singer grid places **256 songs in Icons-level cells** where the underlying orchestra is Core or Niche level. The biggest cases:

| Singer | Primary Orchestra | Orchestra Tier | Singer Cell | Songs |
|---|---|---|---|---|
| Enrique Campos | Ricardo Tanturi | Core | Icons-Known | 117 |
| Angel Vargas | Angel D'Agostino | Core | Icons-Famous/Known | 82 |
| Alberto Podesta | Miguel Caló + Di Sarli | Core + Icons | Icons-Famous/Known | 32+ |

**Angel Vargas** is an interesting case — he only ever sang with D'Agostino, which is a Core-level orchestra. Placing him in Icons-Famous cells means a player can get an Icons-level song quiz (presumably easier) but the hint system shows a Core-level orchestra. This is inconsistent.

**Alberto Podesta** is more defensible since he sang significantly with Di Sarli (Icons level).

This is partly a **design decision**: do you tier singers by their own recognition level (how famous is Vargas as a singer?) or by their orchestra's tier (Core)? Either is valid, but it needs to be consistent.

**Action:** Define the policy explicitly. If singer tier = singer recognition level independent of orchestra, document it. If singer tier should match orchestra tier, these 256 songs need reclassification.

---

### 10. Song Familiarity Scoring for Iconic Songs

Several of the most canonical Argentine tango titles are not reaching `High-Famous` in the song grid:

| Title | Song Grid Cells Found | Expected |
|---|---|---|
| Bahia Blanca (Di Sarli) | `Medium-Famous` | Should be High-Famous |
| Malena (Troilo) | `Medium-Famous` | Should be High-Famous |
| El Choclo | `Medium-Known` only | Should be High-Famous |
| La Trampera (Troilo) | `Low-Known` | Should be at least Medium |
| El Marne (Troilo) | `Medium-Known` / `Low-Famous` | Should be higher |
| Quejas de bandoneon (Troilo) | `Medium-Known` | Should be higher |
| A la gran muneca (Di Sarli) | `Medium-Famous` | Should be High-Famous |

Note: "La Cumparsita" does have many High-Famous entries (correct), and "La Yumba" also has some. But Bahia Blanca being in Medium is a meaningful calibration miss — it's Di Sarli's signature piece, played at virtually every milonga worldwide.

**Action:** Review the familiarity scoring inputs (recognitionScore weights, TimesPlayed, Rating) for these specific tracks. Likely the data is there but the weighting is pulling them down due to the sheer number of less-known versions diluting the score.

---

## 🟢 LOW PRIORITY / JUDGMENT CALLS

### 11. Francisco Canaro: Core vs Icons

**Canaro is currently classified as Core (level 2)**. An argument exists that he belongs in Icons:
- Extremely prolific: over 9,000 recordings
- Widely played at milongas worldwide
- "Poema", "Madreselva", "Organito de la tarde" are milonga staples
- Historical importance is unquestionable

The counter-argument: his sound is less distinctive/identifiable than D'Arienzo, Di Sarli, Troilo, or Pugliese, which is exactly what Icons-level is testing for — "can you identify this from the first 5 seconds?"

**Action:** No immediate change needed. Consider promoting to Icons if your tester cohort shows strong identification rates for Canaro.

---

### 12. Piazzolla and Gardel as "Orchestra"

**Carlos Gardel** (11 songs, Core-Known) and **Astor Piazzolla** (2 songs, Core-Known) are listed with orchestra as their artist name. This is acceptable in most tango databases — Gardel has no "orchestra" in the traditional sense and Piazzolla's music is categorized differently. Core-Known is a reasonable placement for both given that:
- Gardel is universally known but his music isn't milonga repertoire
- Piazzolla's pieces ("La Ultima Curda", "Balada Para Un Loco") are salon tangos, not traditional social dance

No change needed, but may want to add a `type: "singer-composer"` flag to distinguish from orchestras in game UI.

---

## Summary Action Plan

### Do Before Public Launch (Blockers)
1. **Remove** the 4 Turkish / non-tango tracks (Ibrahim Ozgur × 3, "Begin for Julia")
2. **Fix** orchestra/singer field swap (~15 records with "Orquesta X" in singer field)
3. **Fix** filename-style titles (7+ records)
4. **Fix** Roberto Rufino → Edmundo Rivero on Troilo's "Desencuentro"
5. **Audit** all 1,305 blank-orchestra songs — at minimum, gate them from appearing in the Orchestra-identification game mode

### Do Soon After Launch
6. Backfill orchestra field using singer lookup (Angel Vargas → D'Agostino, Ernesto Fama → Canaro, etc.)
7. Fix Troilo "Palomita Blanca" year (1999 → correct recording year)
8. Deduplicate the 421 duplicate records
9. Add Pedro Laurenz and Rodolfo Biagi catalogs

### Review / Design Decision
10. Define singer tier policy (recognition-based vs orchestra-based) and apply consistently
11. Recalibrate familiarity scoring for Bahia Blanca, Malena, El Choclo, Quejas de bandoneon
12. Decide on Canaro's tier (Core stays defensible; Icons is arguable)
