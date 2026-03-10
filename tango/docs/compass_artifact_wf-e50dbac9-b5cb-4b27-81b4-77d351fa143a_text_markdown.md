# NTTT tier system redesign: a complete analysis

**The current recognition score is fundamentally broken — but the data and tango community consensus provide a clear path to a superior system.** The Big 4 orchestras (D'Arienzo, Di Sarli, Troilo, Pugliese) are unanimous across every authoritative source, yet Troilo sits misplaced at Level 2 while Biagi and Fresedo occupy Level 1 slots they don't warrant. El Recodo's quiz — with 840,000+ plays from 3,464 players across 101 countries — proves that community-validated difficulty works at scale. Their adaptive system, which auto-labels songs easy or hard based on aggregate player answers, is exactly the model NTTT should emulate using proxy signals where play data is missing. This report synthesizes findings across orchestra rankings, singer tiers, iconic titles, game design best practices, and data viability to deliver actionable recommendations for all four proposed game modes.

---

## 1. The data absolutely supports four modes — with caveats

### Iconic Songs Mode (80 songs): viable as gateway, not primary

Eighty curated songs provide roughly 16 unique 5-song rounds before exact repetition. QuizUp required **500 questions minimum** per category for a viable topic launch, which puts 80 songs well below the replayability threshold for a primary mode. However, for a niche hobby game where players value the learning component, 80 songs works as a tutorial/onboarding mode. This should be labeled "Classics" or "Beginner" — never positioned as the main competitive experience.

The 51 Tier 1 / 28 Tier 2 split within the iconic list is sensible. Players who master all 80 need a clear graduation path into Orchestra Mode.

### Orchestra Mode: the backbone of the game

With **4,733 songs across 57 orchestras**, Orchestra Mode has the deepest pool and maps directly to how tango dancers think about music. Level 1 orchestras (Big 4) likely average **150–300 songs each**, providing excellent depth. Even Level 3–5 orchestras with smaller catalogs become viable when grouped by level rather than individual orchestra. The math works: 5 orchestra levels × 3 obscurity sub-tiers = **15 difficulty positions**, each with pools likely exceeding the 50-song ideal minimum.

**This must be the primary game mode.** It uses every song in the database and scales from beginners (Level 1 "Classics" sub-tier) to expert DJs (Level 5 "Deep Cuts").

### Singer Mode: marginal until data enrichment

The 231 singers follow a steep power law: the top 20–30 singers cover most recordings, while the bottom 150+ have fewer than 5 songs each. Individual singer quizzes only work for the most prolific vocalists. **Singer Mode is viable only if aggregated** by era ("1940s Vocalists") or fame tier ("Famous Singers" vs. "Rare Singers") rather than individual singer selection.

Critical data gap: SingerMaster.json needs level and era fields added for all 231 singers. Without this metadata, the mode cannot launch. Many songs are also instrumentals (no singer), which need explicit handling.

### Title Mode: strong as a secondary/expert experience

Title Mode is mechanically distinct — it tests whether a player recognizes a composition regardless of which orchestra performs it. Songs like La Cumparsita (2,700+ recorded versions) and El Choclo (hundreds of versions since 1903) create natural difficulty variation: hearing D'Arienzo's version is easy; hearing an obscure orchestra's arrangement is hard. This mode requires **version-mapping data** linking different recordings of the same composition, which may need construction from the existing database. Launch as Phase 2 after Orchestra Mode is proven.

---

## 2. El Recodo's quiz validates community-driven difficulty

El Recodo's Tango Music Quiz is the world's largest tango identification game: **840,657 quizzes performed by 3,464 players from 101 countries**, totaling over 66 million points. Its mechanics offer direct lessons for NTTT.

The quiz plays a 10-second audio excerpt and asks four multiple-choice questions: orchestra, singer, title, and recording period. Crucially, **song difficulty is labeled automatically based on aggregate player answers** — not editorially assigned. As El Recodo states: "La Bruja by D'Arienzo, as an all-time classic, will be guessed by experts and beginners alike, thus showing up at the lowest levels. An old ranchera by Lomuto, is rarely heard in milongas and will be hard to identify by beginners, so it should only show up in higher levels."

Their level system (0–20) scales difficulty across two simultaneous axes: the **number of possible orchestras increases with level** (beginners see fewer choices), and the **number of multiple-choice options increases** (fewer answer choices at lower levels, more at higher). Level 7 is the maximum free tier; Level 8+ requires a paid subscription — a natural breakpoint that NTTT could mirror.

El Recodo also flags approximately **10% of their database as "famous"** (based on their BPM data coverage for "famous ~10% of recordings"). For NTTT's 4,733 songs, this implies roughly **470–500 songs** would constitute the "well-known" pool — aligning well with the combined Tier 1 + Tier 2 pools proposed below.

### Mapping El Recodo's levels to NTTT's tiers

| El Recodo levels | NTTT tier | Description | Estimated pool |
|---|---|---|---|
| 0–3 | **Tier 1: Universal** | Every dancer recognizes these | ~100–200 songs |
| 4–7 | **Tier 2: Familiar** | Regular milonga fare, active dancers know these | ~200–500 songs |
| 8–12 | **Tier 3: DJ-level** | Good DJs know these; played less frequently | ~500–1,500 songs |
| 13–20 | **Tier 4: Expert** | Collectors, historians, expert DJs only | ~1,500–4,700 songs |

The free/paid boundary at Level 7 is significant — it represents El Recodo's own judgment that levels 0–7 encompass the "essential" repertoire any enthusiast should aspire to know.

---

## 3. Drop the dial — use discrete sub-tiers instead

### The UX research is clear

Nielsen Norman Group's research shows that **acquiring a precise value on a slider is difficult** due to motor control constraints. Smashing Magazine's slider UX guide warns sliders are "too difficult to use, require too much precision, are confusing to navigate." For a niche hobby game, most players won't understand what 0.37 vs. 0.42 obscurity means.

Nearly every successful trivia game uses **discrete difficulty levels** (typically 3–5), not continuous sliders. SongPop uses playlist-based categories. QuizUp uses Elementary → Scholar → Genius. Trivia Machine uses 3 discrete tiers. The closest any game comes to continuous difficulty is SongPop's progressive unlock, which is still internally bucketed.

### The data distribution doesn't support continuous either

With **68.6% of songs having zero play counts**, there simply isn't enough gradation data to create meaningful continuous positions. A dial from 0.0 to 1.0 implies infinite possible pools — most of which will contain too few songs for a good quiz experience. The minimum viable pool is **20 songs per difficulty bucket** (ensuring ~4 unique sessions), with 50+ preferred.

### Recommendation: 3 discrete sub-tiers per orchestra level

Use three named obscurity levels within each orchestra level:

- **"Classics"** — the top ~30% most recognizable songs in that level
- **"Standards"** — the middle ~40%
- **"Deep Cuts"** — the bottom ~30%

This creates **5 orchestra levels × 3 sub-tiers = 15 total difficulty positions** — more than enough range to scale from beginner dancers to expert DJs. Present the three positions as a segmented control or toggle (not a slider). Each position has clear meaning, creates shared vocabulary ("I cleared Level 2 Deep Cuts!"), and ensures adequate pool sizes.

### Sorting songs into sub-tiers without play data

Since 68.6% of songs lack play counts, use a **composite familiarity score**:

```
familiarity = (0.35 × orchestra_level_inverted) +
              (0.25 × star_rating_normalized) +
              (0.20 × has_plays_binary) +
              (0.10 × play_count_normalized) +
              (0.10 × singer_fame_score) +
              iconic_bonus
```

**Orchestra level is the strongest proxy.** Even an obscure Di Sarli recording is more recognizable than a hit from a Level 4 orchestra. Star rating (1–5) correlates with milonga playability. The binary play count signal (has plays vs. doesn't) is reliable even when absolute counts are sparse. Singer fame can be estimated from recording count within the database.

---

## 4. Orchestra Level 1 must be exactly the Big 4

### The community consensus is unanimous

Every authoritative source — Paul Lohman's "Big Four" page, Tejastango's collection guide, Tango Voice's DJ recommendations, Tango Space, statistical analyses of Buenos Aires milonga playlists — agrees: **the Big 4 are D'Arienzo, Di Sarli, Troilo, and Pugliese.** There is no credible "Big 5."

Ron Weigel's Buenos Aires milonga survey provides quantitative backing: D'Arienzo and Di Sarli each command **~14.8% of tango tandas** — they are the backbone of 21st-century milonga playlists. Troilo follows at ~8.5%, Pugliese at ~6.3%. Dmitry Pruss's statistical analysis confirms that only D'Arienzo and Di Sarli are clearly separable from the pack; beyond them, the data gets noisier.

### Three corrections to the current ArtistMaster

**Troilo must move UP to Level 1.** His current Level 2 placement contradicts universal consensus. He is part of the Big 4 in literally every source consulted. Troilo-Fiorentino recordings (1938–1945) are among the most iconic in all tango.

**Biagi must move DOWN to Level 2.** Despite his milonga popularity (7.4% of Buenos Aires tandas), every educational guide places him in the second tier. Tejastango puts him in "expanding the basic collection" below the Big 4. Only 12% of DJs listed him as "must play" versus 66–68% for D'Arienzo and Di Sarli. His distinctive "manos brujas" piano makes him top of Level 2, not Level 1.

**Fresedo must move DOWN to Level 2.** Tango Voice places him in the third tier of recommendations — below Tanturi, Biagi, and Caló. He doesn't appear in top tanda frequency rankings from Buenos Aires. His historical importance is immense (60-year career, pioneered romantic salon tango), but modern milonga play frequency is limited mainly to Fresedo-Ray partnerships and 1930s instrumentals.

### Recommended orchestra assignments

| Level | Orchestras | Count |
|---|---|---|
| **Level 1 (Iconic)** | D'Arienzo, Di Sarli, Troilo, Pugliese | **4** |
| **Level 2 (Essential)** | Canaro, Biagi, Tanturi, Caló, D'Agostino, De Angelis, Rodriguez, Laurenz, Fresedo, Donato, Demare | **11** |
| **Level 3 (Deep)** | Gobbi, Malerba, Firpo, Lomuto, OTV, De Caro, Salgan, Francini-Pontier, Garello, Sassone, Varela + all modern/neo-tango | **~42** |

Note that **Tanturi is promoted from Level 3 to Level 2** — his 7.4% of Buenos Aires tandas (tied with Biagi) and the beloved Tanturi-Castillo recordings make him essential. The old Tango Voice note that "tango snobs like to denigrate Tanturi but dancers love him" makes him perfect for a game aimed at social dancers.

**Canaro** stays at Level 2 but sits at its top: he dominates the milonga rhythm genre (25% of milonga tandas in Buenos Aires) and his catalog of ~3,500 recordings is by far the largest, but he was never cited as part of the Big 4 in any source.

---

## 5. Singer Level 1 needs four corrections and two additions

### Critical data errors in the current proposal

The proposed singer list contains several factual errors that must be fixed:

**Vargas is with D'Agostino, not D'Arienzo/Tanturi.** Ángel Vargas was the singer of Ángel D'Agostino's orchestra — the famous "Two Angels" pairing. Troilo himself said Vargas's voice was "the best instrument in all of tango."

**"Castaña (with D'Arienzo)" is a misidentification.** No singer named Castaña was associated with D'Arienzo. D'Arienzo's key singers were Echagüe, Mauré, Reynal, Laborde, Valdez, and Bustos. Cacho Castaña was a modern popular singer (1942–2019), not a Golden Age orchestra vocalist.

**"Lago (with D'Arienzo)" is misattributed.** Horacio Lagos sang with Edgardo Donato's orchestra, not D'Arienzo's.

**Mercedes Sosa is not a tango singer.** She was a folk/nueva canción icon. While she occasionally performed tangos, her inclusion in a tango identification game would be anomalous.

### Recommended Level 1 singer list

**Golden Age (10 singers):**

| Singer | Orchestra | Why Level 1 |
|---|---|---|
| Fiorentino | Troilo | THE definitive Golden Age pairing; "Malena" appears in every top-10 list |
| Echagüe | D'Arienzo | Distinctive "reo" (rough) voice; 3 stints with D'Arienzo |
| Mauré | D'Arienzo | Considered D'Arienzo's best singer; lyrical and dramatic |
| Vargas | D'Agostino | "Best instrument in all of tango" per Troilo; the "Two Angels" |
| Podestá | Di Sarli | "The incomparable" — 4 stints with Di Sarli across decades |
| Rufino | Di Sarli | Started at age 16; 3 stints with Di Sarli |
| Castillo | Tanturi | "Singer of the 100 neighborhoods"; great showman |
| **Campos** | **Tanturi** | **Added.** Milongueros actually prefer Tanturi-Campos for dancing over Tanturi-Castillo. "Una Emoción" is called "a tangazo of tangazos." |
| Ruiz | De Angelis | Key vocalist for one of the essential Level 2 orchestras |
| Berón | Pugliese/Troilo/Caló | "The romantic voice of tango"; sang with 3 legendary orchestras |

**Later Era (3 singers):**

| Singer | Why Level 1 |
|---|---|
| Goyeneche | Most distinctive voice in tango history — gravelly, time-worn, instantly recognizable |
| Julio Sosa | "El Varón del Tango" — virile, commanding, hugely popular in the 1950s–60s |
| Edmundo Rivero | Deep, distinctive voice; definitive "Cafetín de Buenos Aires"; superb Troilo partnership |

**Special Category (1 soloist):**

| Singer | Why Level 1 |
|---|---|
| **Gardel** | **Added.** The most famous tango singer of all time. "Por Una Cabeza" and "El Día Que Me Quieras" are globally recognized. Requires separate "Soloist" treatment since he wasn't an orchestra vocalist. |

### Voice distinctiveness matters for game design

For a singer identification mode, **how recognizable a voice is matters as much as historical importance.** The easiest singers to identify by voice alone: Goyeneche (gravelly, unmistakable), Gardel (rich baritone, dramatic phrasing), Castillo (showman, distinctive mezza voce), Echagüe (raw "reo" voice). The hardest to distinguish from each other: Podestá, Rufino, and Berón share beautiful but similar lyrical baritone qualities. This should influence difficulty calibration — Goyeneche identification questions are "easy" even though he's Later Era.

The Golden Age vs. Later Era distinction is **meaningful for difficulty** because Golden Age recordings have lower fidelity (making voice identification harder), and Golden Age singers sang "within" the orchestra (voice blended with arrangement) rather than as prominent soloists.

---

## 6. The 30 universal tango titles every mode should recognize

Cross-referencing El Recodo's quiz data, DJ community resources, published essential lists, and cultural significance, these are the titles that belong in any "Title Mode" Tier 1 pool. They are grouped by recognition type.

### Global cultural icons (recognizable by non-tango audiences)

**La Cumparsita** stands alone with 2,700+ recorded versions — D'Arienzo alone recorded 8. It closes every milonga worldwide and was declared a cultural anthem of Uruguay by law in 1997. **El Choclo** (1903, known as "Kiss of Fire" in English), **Por Una Cabeza** (the Al Pacino dance scene in *Scent of a Woman*), **El Día Que Me Quieras** (one of the most recorded tangos in history), and **Libertango** (Piazzolla's 1974 bridge between traditional and nuevo) round out the globally famous tier.

### Milonga-essential titles (every dancer knows these)

| Title | Signature association | Why essential |
|---|---|---|
| La Yumba | Pugliese (1946) | Defines Pugliese's sound; onomatopoeic title |
| Malena | Troilo/Fiorentino | Homero Manzi lyrics; appears in virtually every top-10 |
| Bahía Blanca | Di Sarli | Named after Di Sarli's hometown; featured in *The Tango Lesson* |
| Quejas de Bandoneón | D'Arienzo | One of D'Arienzo's signature fast-paced pieces |
| Sur | Troilo/Manzi | Deeply nostalgic Buenos Aires poetry |
| Nostalgias | Fresedo and others | Cobián/Cadícamo composition; deep emotional content |
| Milonga Sentimental | Canaro | Piana composition; the archetypal milonga rhythm |
| A Media Luz | Many versions | Part of tango's "most famous trilogy" |
| Adiós Muchachos | Many versions | 1927 classic that "opened the doors of the world to tango" |
| Recuerdo | Pugliese | Pugliese composition; alongside La Yumba, his most important |
| Poema | Canaro and others | 1932; milonga staple across orchestras |
| Volver | Gardel | Origin of "Veinte años no es nada" |
| Mi Buenos Aires Querido | Gardel | 1934 ode to Buenos Aires |
| Nueve de Julio | D'Arienzo | Iconic instrumental named after Buenos Aires' avenue |
| Caminito | Many versions | Associated with the famous La Boca street |

### Enthusiast-level titles (known to dedicated dancers)

Gallo Ciego (Pugliese), Desde el Alma (Pugliese vals), La Última Curda (Troilo/Goyeneche), Uno (D'Arienzo/Mauré and others), El Flete (D'Arienzo), Tres Esquinas (D'Agostino/Vargas), A Evaristo Carriego (Troilo), La Bruja (D'Arienzo/Echagüe — El Recodo's explicit Level 0 example), Paciencia, and Adiós Nonino (Piazzolla) complete the top 30.

For Title Mode, a critical design principle: **the same title sounds radically different across orchestras.** D'Arienzo's eight versions of La Cumparsita span decades and styles. Difficulty should scale from "iconic orchestra playing iconic title" (easy) to "obscure orchestra playing well-known title" (hard).

---

## 7. Final recommendations

### A. Proposed tier structure

**4 tiers, mapped to El Recodo's validated framework:**

| Tier | Size | Criteria | Game experience |
|---|---|---|---|
| **Tier 1: Universal** | ~100–200 songs | Curated iconic list + Level 1 orchestra "Classics" sub-tier | Every tango dancer should know these |
| **Tier 2: Familiar** | ~300–500 songs | Level 1–2 orchestra "Standards" + Level 2 "Classics" | Regular milonga-goers recognize these |
| **Tier 3: DJ-level** | ~500–1,500 songs | Level 2–3 "Standards" and "Deep Cuts" + Level 3 "Classics" | Working DJs and serious enthusiasts |
| **Tier 4: Expert** | ~1,500–4,733 songs | Everything else: Level 4–5, all deep cuts | Collectors, historians, tango gods |

Within Orchestra Mode, the 15-position grid (5 levels × 3 sub-tiers) provides granular difficulty control. Within each position, songs are sorted by the composite familiarity score described above.

### B. Obscurity dial verdict: drop it

**Use 3 discrete sub-tiers ("Classics" / "Standards" / "Deep Cuts") per orchestra level.** The UX research is unambiguous against continuous sliders for this use case. The data is too sparse (68.6% zero plays) to support meaningful continuous gradation. Discrete levels create shared vocabulary, ensure adequate pool sizes, and align with every successful trivia game's design. Present the three options as a segmented control — visually clean, instantly understandable.

### C. Orchestra Level 1 final list

**D'Arienzo, Di Sarli, Troilo, Pugliese.** Four orchestras, no more. This is the unanimous community consensus across every authoritative source. Biagi and Fresedo move to Level 2; Troilo moves up from Level 2. The "Big 4" is a cultural institution in tango — NTTT should respect it.

### D. Singer Level 1 final list

**14 singers total:** Fiorentino, Echagüe, Mauré, Vargas (corrected to D'Agostino), Podestá, Rufino, Castillo, Campos (added), Ruiz, Berón as Golden Age; Goyeneche, Sosa (Julio, not Mercedes), Rivero as Later Era; Gardel as Soloist. Remove Castaña, Lago, and Mercedes Sosa from any proposed lists due to misidentification or genre mismatch.

### E. Top 30 Tier 1 iconic titles

La Cumparsita, El Choclo, Por Una Cabeza, El Día Que Me Quieras, Libertango, La Yumba, Malena, Bahía Blanca, Quejas de Bandoneón, Sur, Nostalgias, Milonga Sentimental, A Media Luz, Adiós Muchachos, Recuerdo, Poema, Volver, Mi Buenos Aires Querido, Nueve de Julio, Caminito, Gallo Ciego, Desde el Alma, La Última Curda, Uno, El Flete, Tres Esquinas, A Evaristo Carriego, La Bruja, Paciencia, Adiós Nonino.

### F. Data gaps and how to fill them

| Gap | Impact | Solution | Effort |
|---|---|---|---|
| **68.6% songs have 0 plays** | Cannot use play count as primary difficulty signal | Use composite familiarity score with orchestra level as primary axis | Low — algorithmic |
| **SingerMaster needs level + era fields** | Singer Mode cannot launch | Manual assignment for top 50 singers; batch-assign Level 3 to remainder | Medium — ~4 hours |
| **No version-mapping across orchestras** | Title Mode cannot launch | Build title-to-recordings lookup from existing Title field in djSongsWeighted | Medium — semi-automated |
| **El Recodo popularity data (members-only)** | Missing externally-validated difficulty signal | Manual lookup of ~200 key songs' popularity indicators with a contributor account | Medium — ~6 hours |
| **Star ratings may be editorially biased** | Familiarity score could skew | Cross-validate star ratings against the 80 curated iconic songs; calibrate | Low — analytical |

**The single highest-value data enrichment** would be obtaining El Recodo's popularity indicators for the top ~200–300 songs. This would provide externally-validated difficulty labels from 840,000+ quiz plays — a ground-truth signal that no other proxy can match. A contributor account costs €9.95/month and would enable this lookup.

### G. Implementation priority

**Phase 1 (MVP — build first):**
1. **Orchestra Mode** with 5 levels × 3 discrete sub-tiers. Uses all 4,733 songs. Maximum replayability. This is the game.
2. **Iconic Songs Mode** with 80 curated songs. Onboarding gateway. Low development cost.
3. **Fix the orchestra level assignments** — move Troilo to Level 1, Biagi and Fresedo to Level 2, Tanturi to Level 2. This single change dramatically improves the entire difficulty system.

**Phase 2 (post-launch, data-driven):**
4. **Title Mode** — requires version-mapping data construction. Engages expert players with a mechanically distinct challenge.
5. **El Recodo data enrichment** — use popularity indicators to recalibrate the composite familiarity score.

**Phase 3 (later expansion):**
6. **Singer Mode** — requires SingerMaster enrichment (level + era fields). Launch with aggregated categories ("Famous 1940s Singers") rather than individual singer selection.

The critical insight from game design research: **one polished mode beats four half-baked modes.** Get Orchestra Mode right — with proper difficulty calibration so beginners enjoy Level 1 Classics while DJs are challenged by Level 5 Deep Cuts — and you have a game that serves the entire tango community. Everything else is expansion content.

### What makes this system work

The redesigned system solves the original problem (68.6% of songs trapped at zero recognition) by making **orchestra level the primary difficulty axis** rather than play count. A Level 1 orchestra's obscure recording is inherently more recognizable than a Level 4 orchestra's biggest hit — this is how tango dancers actually experience music. The composite familiarity score, validated against El Recodo's crowd-sourced data, handles the rest. The discrete sub-tiers ensure every difficulty position has enough songs for replayability, while the 15-position grid provides sufficient range to challenge everyone from a first-time milonga attendee to a veteran DJ with 2,000 songs memorized.