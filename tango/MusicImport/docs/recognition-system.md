# NTTT Recognition System

## How Songs Get Scored

### The Formula

```
recognitionScore = (0.35 × normRating) + (0.45 × normPlays) + (0.20 × orchBonus)
```

| Component | Weight | Source | Range |
|-----------|--------|--------|-------|
| **Rating** | 35% | DJ library stars (1-5) | 0.0 - 1.0 |
| **Play Count** | 45% | DJ library plays | 0.0 - 1.0 (log scale) |
| **Orchestra Level** | 20% | ArtistMaster.json | 0.0 - 1.0 |

### Orchestra Level Bonus

| Level | Bonus | Examples |
|-------|-------|----------|
| 1 | 1.0 | D'Arienzo, Di Sarli, Troilo, Pugliese, Biagi, Fresedo |
| 2 | 0.7 | Canaro, Donato, Piazzolla, Gardel |
| 3 | 0.4 | Tanturi, Demare, Firpo, Garello |
| 4 | 0.2 | Villoldo, Greco, Arolas (Old Guard) |
| 5 | 0.1 | Deep cuts, obscure orchestras |

### Tier Assignment (Percentile-Based)

Songs are ranked by score, then assigned tiers:

| Tier | Name | Percentile | Count (~4,733) | Meaning |
|------|------|------------|----------------|---------|
| 1 | **Iconic** | Top 10% | ~474 | Everyone knows it |
| 2 | **Essential** | Next 20% | ~946 | Milonga staples |
| 3 | **Familiar** | Next 30% | ~1,420 | You've heard it |
| 4 | **Challenging** | Next 25% | ~1,184 | Tests your ears |
| 5 | **Deep Cuts** | Bottom 15% | ~709 | DJ-level knowledge |

---

## The Problem with New Songs

New imports start with:
- **Rating**: 4 (default)
- **Plays**: 0
- **Orchestra**: Varies

### Score Calculation Example

**Gallo Ciego (Pugliese 1948)** - Level 1 orchestra:
```
normRating = 4/5 = 0.8
normPlays  = log(0+1)/log(33+1) = 0.0
orchBonus  = 1.0 (level 1)

score = (0.35 × 0.8) + (0.45 × 0.0) + (0.20 × 1.0)
      = 0.28 + 0.0 + 0.20
      = 0.48
```

**Result**: Tier 3 (Familiar) - not enough for Iconic

**Mi Noche Triste (Gardel 1917)** - Level 2:
```
score = (0.35 × 0.8) + (0.45 × 0.0) + (0.20 × 0.7)
      = 0.28 + 0.0 + 0.14
      = 0.42
```

**Result**: Tier 3 (Familiar)

**El Choclo (Villoldo 1913)** - Level 4:
```
score = (0.35 × 0.8) + (0.45 × 0.0) + (0.20 × 0.2)
      = 0.28 + 0.0 + 0.04
      = 0.32
```

**Result**: Tier 4 (Challenging)

---

## How the App Uses This Data

### dataFetching.js

```javascript
// Filter by recognition tier
if (recognitionTiers.length > 0) {
  filtered = filtered.filter(song =>
    recognitionTiers.includes(song.recognitionTier)
  );
}
```

### Game Difficulty Selection

| UI Selection | Tiers Used | Song Pool |
|--------------|------------|-----------|
| "Iconic Only" | [1] | ~474 songs |
| "Essential" | [1, 2] | ~1,420 songs |
| "Familiar" | [1, 2, 3] | ~2,840 songs |
| "Challenge Me" | [3, 4] | ~2,604 songs |
| "Deep Cuts" | [4, 5] | ~1,893 songs |

### Weighted Random Selection

Songs with higher `Weight` appear more often:
```javascript
Weight = baseFromRating + playBonus
// Rating 5 = base 5, Rating 4 = base 3, Rating 3 = base 1
// +1 per 2 plays, max +10
```

---

## Gap Songs Status

### Imported (58 songs)

| Era | Count | Tier |
|-----|-------|------|
| Golden Age gaps | 11 | Tier 3 |
| Canción era | 13 | Tier 3 |
| Old Guard | 34 | Tier 3-4 |

### Key Gap Songs Now in DB

| Song | Orchestra | Year | Current Tier |
|------|-----------|------|--------------|
| Gallo Ciego | Pugliese | 1948 | 3 |
| El Marne | Troilo | 1941 | 3 |
| Nochero Soy | Pugliese | 1962 | 3 |
| La Beba | Pugliese | 1947 | 3 |
| Cafe Dominguez | D'Agostino | 1955 | 3 |

---

## Rethinking Iconic Mode

### Current Issue

The algorithm rewards **DJ play history**, not **cultural significance**.

- A song played 20× in your library beats an unplayed tango classic
- New imports can never be "Iconic" without play history
- Gap songs (Gallo Ciego, El Marne) are universally known but tier 3

### Possible Solutions

#### Option A: Curated Iconic List

Use `IconicMaster.json` for tier 1 instead of algorithm:
```javascript
if (recognitionTiers === [1]) {
  // Use curated IconicMaster.json (65 hand-picked songs)
} else {
  // Use algorithmic tiers
}
```

#### Option B: Seed New Songs with Base Score

Give imported songs a "cultural significance" boost:
```
score += iconicBonus  // 0.3 for IconicMaster matches
```

#### Option C: Separate "Iconic" from "Familiar to You"

- **Iconic Mode**: Curated list (cultural)
- **Familiarity Mode**: Algorithmic (personal DJ history)

---

## Files

| File | Purpose |
|------|---------|
| `djSongsWeighted.json` | All songs with scores/tiers |
| `ArtistMaster.json` | Orchestra levels |
| `IconicMaster.json` | Curated iconic list (65 songs) |
| `add_recognition_scores.py` | Scoring algorithm |
| `dataFetching.js` | App filtering logic |

---

*Created: 2026-02-27*
