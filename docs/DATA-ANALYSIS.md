# NTTT Data Analysis

**Generated:** 2026-02-24

---

## Data Sources

| Source | File | Songs | Description |
|--------|------|-------|-------------|
| BORIS Raw | `djSongsFiltered_boris.json` | 5,488 | Full DJ library with ratings |
| Weighted | `djSongsWeighted.json` | 4,675 | Filtered (score >= 60) |

---

# BORIS Source Data

Source: `MusicImport/djSongsFiltered_boris.json` (5,488 songs)

## Star Rating (BORIS)

| Stars | Count | % |
|-------|-------|---|
| 5-star | 527 | 10% |
| 4-star | 2,012 | 37% |
| 3-star | 2,136 | 39% |
| 2-star | 692 | 13% |
| 1-star | 121 | 2% |

## Priority Tier (BORIS)

| Tier | Count | Description |
|------|-------|-------------|
| A | 464 | Top tier (5-star OR 4-star + high plays) |
| B | 4,211 | Mid tier (3-4 star) |
| C | 813 | Low tier (1-2 star) - **filtered out** |

## Priority Tier x Star Rating (BORIS)

| Tier | 5-star | 4-star | 3-star | 2-star | 1-star | TOTAL |
|------|--------|--------|--------|--------|--------|-------|
| A | 206 | 258 | 0 | 0 | 0 | 464 |
| B | 321 | 1,754 | 2,136 | 0 | 0 | 4,211 |
| C | 0 | 0 | 0 | 692 | 121 | 813 |

## Priority Score (BORIS)

| Metric | Value |
|--------|-------|
| Min | 20 |
| Max | 200 |
| Score >= 100 | 852 songs |
| Score >= 80 | 2,540 songs |
| Score >= 60 | 4,675 songs |

**Cutoff:** Songs with `priorityScore >= 60` go into weighted dataset (Tier A + B only).

## Play Count (BORIS)

| Plays | Count | % |
|-------|-------|---|
| 20+ | 11 | 0.2% |
| 10-19 | 153 | 3% |
| 5-9 | 300 | 5% |
| 1-4 | 1,040 | 19% |
| 0 (never) | 3,984 | 73% |

---

# Weighted Dataset

Source: `NTTT/public/songData/djSongsWeighted.json` (4,675 songs)

## Summary

| Metric | Count | % |
|--------|-------|---|
| Total Songs | 4,675 | 100% |
| With Orchestra (ArtistMaster) | 3,370 | 72% |
| With Singer | 2,444 | 52% |
| With Both (Orch+Singer) | 1,940 | 41% |

## Category Breakdown

| Category | Count | % |
|----------|-------|---|
| Orch+Singer | 1,940 | 41% |
| Orch Only | 1,430 | 31% |
| Singer Only | 504 | 11% |
| Neither | 801 | 17% |

---

## Star Rating x Category

| Stars | Orch+Singer | Orch Only | Singer Only | Neither | TOTAL |
|-------|-------------|-----------|-------------|---------|-------|
| 5 | 228 | 178 | 65 | 56 | 527 |
| 4 | 760 | 643 | 227 | 382 | 2,012 |
| 3 | 952 | 609 | 212 | 363 | 2,136 |

*Note: All songs are 3-5 stars (Tier C filtered out)*

---

## Priority Tier (A/B) x Category

| Priority | Orch+Singer | Orch Only | Singer Only | Neither | TOTAL |
|----------|-------------|-----------|-------------|---------|-------|
| A | 241 | 95 | 84 | 44 | 464 |
| B | 1,699 | 1,335 | 420 | 757 | 4,211 |

---

## Recognition Tier x Category

| Tier | Name | Orch+Singer | Orch Only | Singer Only | Neither | TOTAL |
|------|------|-------------|-----------|-------------|---------|-------|
| 1 | Iconic | 304 | 134 | 24 | 6 | 468 |
| 2 | Essential | 423 | 375 | 76 | 61 | 935 |
| 3 | Familiar | 740 | 558 | 49 | 55 | 1,402 |
| 4 | Challenging | 440 | 337 | 137 | 255 | 1,169 |
| 5 | Deep Cuts | 33 | 26 | 218 | 424 | 701 |

---

## Play Count x Category

| Plays | Orch+Singer | Orch Only | Singer Only | Neither | TOTAL |
|-------|-------------|-----------|-------------|---------|-------|
| 20+ | 4 | 3 | 4 | 0 | 11 |
| 10-19 | 79 | 25 | 38 | 11 | 153 |
| 5-9 | 158 | 67 | 42 | 33 | 300 |
| 1-4 | 421 | 325 | 106 | 170 | 1,022 |
| 0 | 1,278 | 1,010 | 314 | 587 | 3,189 |

---

## Priority Tier x Recognition Tier

| Priority | Iconic | Essential | Familiar | Challenging | Deep Cuts | TOTAL |
|----------|--------|-----------|----------|-------------|-----------|-------|
| A | 341 | 123 | 0 | 0 | 0 | 464 |
| B | 127 | 812 | 1,402 | 1,169 | 701 | 4,211 |

**Key:** Priority A maps mostly to Recognition Tier 1-2 (Iconic + Essential).

---

# Tier Definitions

## Recognition Tiers (1-5)

| Tier | Name | Description | Score Range |
|------|------|-------------|-------------|
| 1 | Iconic | Everyone knows it | > 0.80 |
| 2 | Essential | Milonga staples | 0.60-0.80 |
| 3 | Familiar | You've heard it | 0.40-0.60 |
| 4 | Challenging | Tests your ears | 0.20-0.40 |
| 5 | Deep Cuts | DJ-level knowledge | < 0.20 |

**Formula:** `score = (0.35 * normStars) + (0.45 * normPlays) + (0.20 * orchBonus)`

## Priority Tiers (A/B/C) - BORIS

| Tier | Criteria | In Weighted? |
|------|----------|--------------|
| A | 5-star OR (4-star + 10+ plays) | Yes |
| B | 3-4 star, priorityScore >= 60 | Yes |
| C | 1-2 star, priorityScore < 60 | **No** |

---

# Game Availability

## Default: Iconic Only (Tier 1)

| Game Type | Requirement | Available |
|-----------|-------------|-----------|
| Orchestra Quiz | hasOrch | 438 |
| Singer Quiz | hasSinger | 328 |
| Clip Orchestra | hasOrch | 438 |
| Clip Singer | hasSinger | 328 |

## All Tiers (1-5)

| Game Type | Requirement | Available |
|-----------|-------------|-----------|
| Orchestra Games | hasOrch | 3,370 |
| Singer Games | hasSinger | 2,444 |

---

# Data Quality Notes

1. **Tier C filtered out:** 813 songs with 1-2 stars not in weighted dataset
2. **Missing Orchestra:** 1,305 songs (28%) lack ArtistMaster
3. **Missing Singer:** 2,231 songs (48%) lack Singer field
4. **Never Played:** 73% of BORIS songs have 0 play count

---

*Last updated: 2026-02-24*
