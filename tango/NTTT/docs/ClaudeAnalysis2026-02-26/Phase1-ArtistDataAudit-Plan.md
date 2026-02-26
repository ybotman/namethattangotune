# Phase 1: Artist Data Audit - Master Plan

## Overview

This document defines the phased approach to audit and enrich artist data across ArtistMaster.json and djSongsWeighted.json. Each phase has its own task document for Compás to execute.

---

## Key Concept: Singer-Fronted Albums

**VALIDATED:** Some singers (1945-1960s era) made albums where:
- The singer's name was the title/focus
- The "orchestra" was pickup studio musicians
- These were marketed as the singer's albums

**Example:** Angel Vargas
```
"Orchestra": "Angel Vargas con la Orquesta Armando Lacava"
"Orchestra": "Angel Vargas y Orquesta Eduardo del Piano"
```

**Rule:** These artists should:
- NOT appear in Orchestra game mode
- REMAIN playable in Singer game mode
- Be flagged with `type: "singer"` in ArtistMaster

---

## Schema Enhancement: ArtistMaster.json

Add new fields:
```json
{
  "artist": "Angel Vargas",
  "type": "singer",              // NEW: "orchestra" | "singer" | "ensemble"
  "lastYearInSongDB": 1959,      // NEW: MAX(year) from djSongsWeighted
  "lastRecordingYearKnown": 1959,// NEW: researched actual last recording
  "yearDiscrepancy": 0,          // NEW: difference (flags issues)
  "researchSource": "...",       // NEW: citation
  "active": "true",
  "level": "3",
  "grouped": [...]
}
```

---

## Phase Tasks

| Phase | Task | Status | Document |
|-------|------|--------|----------|
| 1A | Angel Vargas - Reclassify as singer | TODO | `Task-1A-AngelVargas.md` |
| 1B | 17 Missing Artists - Research prompt | TODO | `Task-1B-MissingArtists.md` |
| 1C | Short Recording Windows - DQ check | TODO | `Task-1C-ShortWindows.md` |
| 1D | Dual-Identity Artists - Separate eras | TODO | `Task-1D-DualIdentity.md` |
| 1E | Confirmed Reissue Contamination - Fix | TODO | `Task-1E-ReissueContamination.md` |
| 2A | Do Not Play (DNP) Flag Implementation | TODO | `Task-2A-DoNotPlay.md` |

---

## Workflow for Each Task

1. **Re-read** - Compás reads task document and confirms understanding
2. **Cross-reference** - Check ArtistMaster + djSongsWeighted for actual data
3. **Research** - If online research needed, execute deep analysis prompt
4. **Document** - Log findings in `ChangeLog-Phase1.md`
5. **Update** - Apply changes to JSON files
6. **Log completion** - Record what was changed
7. **User test** - Ask user to verify

---

## Change Log Format

All changes logged to `ChangeLog-Phase1.md`:
```markdown
## [Date] [Artist Name]

**Issue:** Description of problem found
**Source:** Citation/research source
**Action:** What was changed
**Files Modified:** List of files
**Verified:** [ ] User tested
```

---

## Cross-Reference Requirements

For ALL tasks, Compás must:
1. Check ArtistMaster.json for current state
2. Query djSongsWeighted.json for MAX(year) per artist
3. Compare against research document findings
4. Flag any discrepancy > 5 years as potential DQ issue

---

*Created: 2026-02-26*
*Owner: Compás*
