# External Data POC - Status & Progress

## Last Updated
2026-03-01

## Current State
**TangoLink POC COMPLETE** - 24/65 files matched with ERT IDs

## Master Doc
**See: `NTTT/docs/familiarity-redesign.md`** for full architecture and plan.

## Files

| File | Purpose | Status |
|------|---------|--------|
| `match_tango_info.py` | Match songs against tango.info | ✅ Ready |
| `match_el_recodo.py` | Match against el-recodo.com | ✅ Ready (rate limited) |
| `fetch_tangolink.py` | Fetch TangoLink list | ✅ Ready |
| `trickle_matcher.py` | Background batch matcher | ✅ Ready |
| `ert_extracted.json` | ERT IDs from TangoLink | ✅ 24 songs |
| `ert_matches.txt` | Raw ERT match output | ✅ Complete |
| `tangolink_famous.json` | Template for famous list | ⏳ Needs manual entry |

## TangoLink Results (2026-03-01)

| Metric | Count |
|--------|-------|
| Files processed | 65 |
| Audio matched (ERT) | 24 |
| Skipped (no match) | 41 |
| Credits used | ~65 |
| Credits remaining | ~236 |

## Audio Files

| Location | Files | Description |
|----------|-------|-------------|
| `~/tunes/tango/MusicRips/` | 65 | Original (modified by TangoLink) |
| `../RIP20260301/` | 65 | Working copies with ERT tags |

---

## el-recodo Access

**Paid subscription until 2027-02-28**

Features: Play!, Tango Scan, Tango Quiz, Tango Music (full), Tanda Manager, TangoLink

**Status**: Rate-limited from earlier scraping. Wait before querying.

---

## Next Steps

**Immediate:**
1. [x] TangoLink 65 files → 24 matched
2. [x] Extract ERT IDs
3. [ ] Build familiarity lookup tables (orchestra, singer, title)
4. [ ] Text-match 41 unmatched songs via tango.info
5. [ ] Curate Tier 2 (Essential) list

**Later:**
6. [ ] El-recodo danceability scraper (after rate limit resets)
7. [ ] Backfill djSongsWeighted.json with new fields
8. [ ] Design new import pipeline with TangoLink

---

## Session Log

### 2026-03-01
- Installed TangoLink desktop app
- Created M3U playlist for 65 files
- TangoLink processed: 24 audio matched, 41 skipped
- Extracted ERT IDs to `ert_extracted.json`
- Files copied to `../RIP20260301/`
- Created `../docs/familiarity-redesign.md` master doc

### 2026-02-28
- Created POC folder and scripts
- Rate limited on el-recodo (429 errors)
- Identified TangoLink as better approach than web scraping
