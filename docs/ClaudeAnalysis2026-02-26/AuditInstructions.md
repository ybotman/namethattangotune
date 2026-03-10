# Artist Recording Year Audit Instructions

## Objective
Validate and enrich ArtistMaster.json with accurate "last recording year" data by cross-referencing internet research against djSongsWeighted.json.

---

## Phase 1: Research Each Artist

For each artist in ArtistMaster:
1. **Internet research** to find their last recording year
2. Focus on recordings as **maestro/orchestra leader** (not as a singer with another orchestra)
3. Document sources (todotango.com, el-recodo.com, tango.info, Wikipedia, etc.)

---

## Phase 2: Cross-Reference with Song Database

Compare your researched "last recording year" against:
- `djSongsWeighted.json` MAX(year) for that artist

Flag discrepancies:
- **DB year > Research year**: Likely reissue/remaster incorrectly labeled
- **DB year < Research year**: Missing late catalog in database

---

## Phase 3: Update ArtistMaster

Add new fields to each artist entry:
- `lastYearInSongDB`: MAX(year) found in djSongsWeighted for this artist
- `lastRecordingYearKnown`: Your researched actual last recording year
- `yearDiscrepancy`: Difference between the two (if any)
- `researchSource`: Citation for your finding

---

## Phase 4: DQ Check Log

Build a change log with:
- Artist name
- Issue found
- Reason for change
- Source/citation
- Recommended action

---

## Phase 5: Second Pass - Mismatched Years

For any song records with suspicious years:
1. Research the specific recording
2. Determine if year is original or reissue
3. Append findings with:
   - Song title
   - Current year in DB
   - Corrected year (if applicable)
   - Reason and source citation

---

## Output Files

| File | Purpose |
|------|---------|
| `ArtistMaster-Enriched.json` | Updated with lastRecordingYearKnown |
| `YearDiscrepancies.json` | All mismatches found |
| `ChangeLog.md` | Detailed log with reasons and sources |
| `SongsToReview.json` | Individual songs needing year correction |

---

## Sources to Use

- todotango.com (discographies)
- el-recodo.com (recording dates)
- tango.info (detailed session data)
- Tango Time Travel
- Wikipedia (artist biographies)
- Discogs (release dates - careful: often reissue dates)

---

*Created: 2026-02-26*
