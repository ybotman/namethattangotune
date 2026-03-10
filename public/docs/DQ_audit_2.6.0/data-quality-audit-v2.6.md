# NTTT Data Quality Audit — v2.6.0

**Generated:** 2026-03-05
**Total Songs:** 4,729
**Grids Analyzed:** 3 (Orchestra, Singer, Song)

---

## Executive Summary

| Grid | GPA | Launch Ready? |
|------|-----|---------------|
| **Orchestra** | C+ | Gate Niche tier |
| **Singer** | B− | Gate Niche tier |
| **Song** | D | Needs recalibration |

**Bottom line:** Singer game is closest to launch-ready. Song game needs the most work.

---

## Grid 1 — Orchestra Game

| Cell | Grade | Songs | Issues |
|------|-------|-------|--------|
| Icons-Famous | B+ | 496 | 9% dupes, 1 filename title |
| Icons-Known | B+ | 932 | 13% dupes, 2 filename titles |
| Icons-Obscure | F | 0 | Empty |
| Core-Famous | A+ | 524 | Clean |
| Core-Known | A+ | 1,068 | 7% dupes (minor) |
| Core-Obscure | F | 0 | Empty |
| Niche-Famous | F | 113 | 75% blank orchestra, non-tango tracks |
| Niche-Known | F | 1,587 | 77% blank orchestra, non-tango, 302 post-1975 |
| Niche-Obscure | C+ | 13 | Thin |

**Assessment:** Core is best tier. Icons needs dupe cleanup. Niche is a dumping ground.

---

## Grid 2 — Singer Game

| Cell | Grade | Songs | Issues |
|------|-------|-------|--------|
| Icons-Famous | A+ | 253 | 9% dupes (acceptable) |
| Icons-Known | A+ | 343 | 12% dupes |
| Icons-Obscure | F | 0 | Empty |
| Core-Famous | B+ | 249 | 10% blank orchestra |
| Core-Known | C+ | 608 | 15% blank, 6% dupes |
| Core-Obscure | F | 0 | Empty |
| Niche-Famous | C | 215 | 13% blank, orch-as-singer |
| Niche-Known | D | 792 | 43% blank orchestra — unreliable |
| Niche-Obscure | D | 7 | Way too thin |

**Assessment:** Icons is launch-ready after dupe cleanup. Degrades fast toward Niche.

---

## Grid 3 — Song Game

| Cell | Grade | Songs | Issues |
|------|-------|-------|--------|
| High-Famous | C | 471 | 7% blank, orch-as-singer, calibration miss |
| High-Known | F | 3 | Near-empty — structural failure |
| High-Obscure | F | 0 | Empty |
| Medium-Famous | D | 576 | 8% blank, non-tango tracks |
| Medium-Known | F | 370 | 24% blank, dupes, non-tango |
| Medium-Obscure | F | 0 | Empty |
| Low-Famous | C+ | 86 | Thin but clean |
| Low-Known | F | 3,214 | 35% blank, dupes — garbage pool |
| Low-Obscure | C+ | 13 | Too thin |

**Assessment:** Worst grid. High-Known having only 3 songs is structural failure. Everything collapses into Low-Known.

---

## Critical Issues Fixed (v2.6.0)

| Issue | Records | Status |
|-------|---------|--------|
| Turkish/non-tango tracks deleted | 4 | ✅ Fixed |
| Rufino→Rivero attribution | 1 | ✅ Fixed |
| Filename suffixes cleaned | 14 | ✅ Fixed |
| Troilo 1999→1945 year | 1 | ✅ Fixed |

---

## Records Flagged for Review

### DNP (Do Not Play)
Records that should be filtered out of gameplay:
- Blank orchestra + blank singer (instrumental unknown)
- Non-tango content
- Severely malformed metadata

### DUP (Duplicate)
Records that are duplicates of other entries:
- Same title + orchestra + year
- Need manual review to pick canonical version

---

## Recommended Filters for App

```javascript
// Filter for Orchestra Quiz
const validForOrchestraQuiz = song =>
  song.orchestraLevel &&
  song.orchestraLevel <= 2 && // Icons + Core only
  !song.DNP &&
  !song.DUP;

// Filter for Singer Quiz
const validForSingerQuiz = song =>
  song.singerLevel &&
  song.singerLevel <= 2 && // Icons + Core only
  song.HasSinger &&
  !song.DNP &&
  !song.DUP;

// Filter for Song Quiz
const validForSongQuiz = song =>
  song.recognitionTier &&
  song.recognitionTier <= 2 && // High + Medium only
  !song.DNP &&
  !song.DUP;
```

---

## Action Plan

### Before Public Launch
1. ✅ Delete non-tango tracks (4)
2. ✅ Fix singer attributions (1)
3. ✅ Clean filename titles (14)
4. ✅ Fix year anomalies (1)
5. ⬜ Mark DNP/DUP records
6. ⬜ Gate Niche tier from default gameplay

### Post-Launch
1. Backfill orchestra from singer lookup
2. Add Laurenz & Biagi catalogs
3. Deduplicate 421 records
4. Recalibrate song familiarity scoring

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.6.0 | 2026-03-05 | Initial audit, 20 fixes applied |

