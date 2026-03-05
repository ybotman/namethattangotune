# NTTT Song Audit - 20260305

Generated: 2026-03-05T05:50:47.744Z

---

## Orchestra Grid

| Cell | Count | Iconic | Sample Songs |
|------|-------|--------|-------------|
| Core-Deep | 603 | 0 | Ruego, Riachuelo, Mocito Rana |
| Core-Famous | 477 | 9 | Picaflor, Chique!, El chamuyo |
| Core-Known | 302 | 0 | Campo afuera, Mishiadura, Esto Es El Colmo |
| Icons-Deep | 0 | 0 |  |
| Icons-Famous | 312 | 53 | Palomita Blanca, Hasta Siempre Amor, Guapeando |
| Icons-Known | 542 | 0 | Domani  xx, Patotero Sentimental    xxxx, Remembranzas(slow) |
| Niche-Deep | 850 | 0 | Dulce Perdon, Entre Los Ceibos, La Maleva |
| Niche-Famous | 75 | 0 | Telon, Cordobesita, Besos brujos |
| Niche-Known | 217 | 0 | Entre Los Ceibos+, Barreras De Amor, Adios para siempre |

**Total: 3378 songs**

## Singer Grid

| Cell | Count | Iconic | Sample Songs |
|------|-------|--------|-------------|
| Core-Deep | 307 | 0 | El campeon, El Tarta, Que Tragedia Senor |
| Core-Famous | 212 | 4 | Telon, Cordobesita, Besos brujos |
| Core-Known | 170 | 0 | Adios para siempre, Si no me enganas corazon, Angustia |
| Icons-Deep | 7 | 0 | Por Pecadora, Que Nadie Sepa Mi Sufrir, El huerfano |
| Icons-Famous | 174 | 25 | Luna De Arrabal, La pulpera de Santa Lucia, Recuerdo |
| Icons-Known | 220 | 0 | La vieja serenata, Ha pasado, Un tropezon |
| Niche-Deep | 358 | 0 | Falsedad, Desaliento, Desenganao |
| Niche-Famous | 168 | 4 | Fueron tres anos, Picaflor, Noches correntinas |
| Niche-Known | 189 | 0 | Naipe marcado, Caminito, Azucar pimienta y sal |

**Total: 1805 songs**

## Song Grid

| Cell | Count | Iconic | Sample Songs |
|------|-------|--------|-------------|
| High-Deep | 23 | 0 | Telon, Vuelves (restored), Independiente Club |
| High-Famous | 309 | 53 | Palomita Blanca, Hasta Siempre Amor, Guapeando |
| High-Known | 422 | 7 | Chique!, El chamuyo, Papas Calientes |
| Low-Deep | 850 | 0 | Dulce Perdon, Entre Los Ceibos, La Maleva |
| Low-Famous | 0 | 0 |  |
| Low-Known | 603 | 0 | Ruego, Riachuelo, Mocito Rana |
| Medium-Deep | 269 | 0 | Entre Los Ceibos+, Barreras De Amor, Adios para siempre |
| Medium-Famous | 545 | 0 | Domani  xx, Patotero Sentimental    xxxx, Remembranzas(slow) |
| Medium-Known | 357 | 2 | Picaflor, Elegante papirusa, Campo afuera |

**Total: 3378 songs**

---

# NTTT Song Familiarity & Grid Logic

## Overview

NTTT uses a **familiarity scoring system** to place songs into difficulty grids for the three game modes:
1. **Orchestra Quiz** - Identify the orchestra
2. **Singer Quiz** - Identify the singer
3. **Song Quiz** - Identify the song title

---

## Familiarity Score Formula

Each song gets a `songFamiliarity` score (0.0 - 1.0):

```
songFamiliarity =
  (0.35 × orchestra_level_inverted) +   // L1=1.0, L2=0.8, L3=0.6, L4=0.4, L5=0.2
  (0.25 × star_rating / 5) +            // Rating field normalized
  (0.20 × has_plays) +                  // 1 if TimesPlayed > 0
  (0.10 × log(plays) / log(max)) +      // Play count normalized
  (0.10 × singer_level_score) +         // L1=1.0, L2=0.7, L3=0.4, instrumental=0.5
  iconic_bonus                          // +0.2 if in IconicMaster
```

### Iconic Bonus

Songs in `IconicMaster.json` get +0.2 bonus. Matching is on **title + orchestra** (year ignored).

---

## Orchestra Tiers (ArtistMaster.json)

| Level | Tier | Description | Examples |
|-------|------|-------------|----------|
| 1 | Icons | Big 4 - instantly recognizable | D'Arienzo, Di Sarli, Troilo, Pugliese |
| 2 | Core | Essential golden age | Tanturi, D'Agostino, Canaro, Biagi, Fresedo |
| 3 | Niche | Specialists | De Caro, Firpo, Donato |
| 4-5 | Niche | Obscure/modern | Various |

---

## Singer Tiers (SingerMaster.json)

| Level | Tier | Description | Examples |
|-------|------|-------------|----------|
| 1 | Icons | Most famous voices | Fiorentino, Vargas, Castillo, Podesta |
| 2 | Core | Essential singers | Rufino, Echague, Campos |
| 3 | Niche | Specialists | Various |

---

## Grid Cell Definitions

### Orchestra Grid (9 cells)
- **Rows**: Icons (L1), Core (L2), Niche (L3-5)
- **Columns**: Famous (fam ≥0.7), Known (0.5-0.7), Deep (<0.5)

### Singer Grid (9 cells)
- **Rows**: Icons (singer L1), Core (singer L2), Niche (singer L3)
- **Columns**: Famous (fam ≥0.7), Known (0.5-0.7), Deep (<0.5)
- Only includes vocal songs

### Song Grid (9 cells)
- **Rows**: High (fam ≥0.75), Medium (0.5-0.75), Low (<0.5)
- **Columns**: Famous (Icons orch), Known (Core orch), Deep (Niche orch)

---

## Data Files

| File | Purpose |
|------|---------|
| `djSongsWeighted.json` | Master song database with all fields |
| `ArtistMaster.json` | Orchestra tier definitions |
| `SingerMaster.json` | Singer tier definitions |
| `IconicMaster.json` | Iconic song overrides (+0.2 bonus) |

---

## Filtering Flags

| Flag | Meaning |
|------|---------|
| `DNP` | Do Not Play - excluded from all games |
| `DUP` | Duplicate - excluded from games (keep one version) |
| `isIconic` | In IconicMaster, gets familiarity boost |

---

## Key Stats (This Audit)

- **Total songs**: 4729
- **Playable** (not DNP/DUP): 3378
- **Iconic songs**: 156
- **Vocal songs**: 2467
- **Instrumental**: 2262

### Familiarity Distribution
| Range | Count |
|-------|-------|
| 0.8-1.0 (Iconic tier) | 728 |
| 0.6-0.8 (Essential) | 1285 |
| 0.4-0.6 (DJ picks) | 2184 |
| 0.2-0.4 (Deep cuts) | 532 |
| 0.0-0.2 (Obscure) | 0 |

