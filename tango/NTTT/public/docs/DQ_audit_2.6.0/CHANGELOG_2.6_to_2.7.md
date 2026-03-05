# Changelog: v2.6.0 → v2.7.0

**Data Quality Fixes Applied**

---

## ✅ COMPLETED

### 🔴 Critical Issues

| # | Issue | Action | Records | Status |
|---|-------|--------|---------|--------|
| 1 | Non-tango tracks (Turkish) | Deleted | 4 | ✅ Done |
| 3 | Filename-style titles | Cleaned suffixes | 14 | ✅ Done |
| 4 | Orchestra in Singer field | Swapped fields | 15 | ✅ Done |
| 5 | Blank orchestra gating | Marked DNP, filtered in app | 45 | ✅ Done |

### 🟠 High Priority Issues

| # | Issue | Action | Records | Status |
|---|-------|--------|---------|--------|
| 5 | Rufino→Rivero (Desencuentro) | Fixed singer | 1 | ✅ Done |
| 6 | Troilo 1999 year | Changed to 1945 | 1 | ✅ Done |

### 🟡 Medium Issues

| # | Issue | Action | Records | Status |
|---|-------|--------|---------|--------|
| 8 | Duplicate records | Marked DUP, filtered in app | 1,306 | ✅ Flagged |

---

## ⬜ NOT YET DONE

### 🔴 Critical

| # | Issue | Reason | Plan |
|---|-------|--------|------|
| 2 | Blank orchestra (1,305) | Need singer→orchestra mapping | Backfill pass |

### 🟠 High Priority

| # | Issue | Reason | Plan |
|---|-------|--------|------|
| 7 | Missing Laurenz/Biagi | Need source audio files | Add catalogs |

### 🟡 Medium (Design Decisions)

| # | Issue | Status |
|---|-------|--------|
| 9 | Singer/orchestra tier mismatch | Policy decision needed |
| 10 | Iconic song familiarity | Algorithm recalibration |
| 11 | Canaro tier (Core vs Icons) | No change for now |
| 12 | Piazzolla/Gardel as orchestra | Acceptable |

---

## Summary

| Metric | Before (2.6) | After (2.7) |
|--------|--------------|-------------|
| Total songs | 4,733 | 4,729 |
| DNP flagged | 0 | 45 |
| DUP flagged | 0 | 1,306 |
| **Playable** | 4,733 | **3,378** |

---

## Scripts Used

- `scripts/fix-data-quality.js` — Title cleanup, deletions, singer/year fixes
- `scripts/mark-dnp-dup.js` — Flag DNP/DUP records

## Files Modified

- `public/songData/djSongsWeighted.json` — All fixes applied
- `src/app/utils/dataFetching.js` — Added DNP/DUP filter

