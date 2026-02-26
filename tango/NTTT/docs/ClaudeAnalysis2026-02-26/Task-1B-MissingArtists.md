# Task 1B: 17 Missing Artists - Research Coverage Gap

## Status: TODO

## Objective
Research the 17 artists in ArtistMaster.json that were NOT covered in the initial 37-artist research document.

---

## Background

The research document "OrchestraLeaders-LastRecordingYears.md" covered 37 artists.
ArtistMaster.json contains 54 artists.
**Gap: 17 artists need research.**

---

## Missing Artists (Not in Research Doc)

Cross-reference needed to identify which 17 are missing. Likely candidates from ArtistMaster:
- Modern/Neo-tango: Bajofondo, Bandonegro, Caceres, Chino Laborde, Color Tango, Disarliana, El Cachivache, Gotan Project, Hyperion Ensemble, Orquesta Romantica Milonguera, Orquesta Tipica Andariega, Otros Aires, Pablo Valle Sexteto, Sexteto Cristal, Sexteto Milonguero
- Possible classics: Fulvio Salamanca, Nina Miranda & Donato Racciatti

---

## Tasks

### Step 1: Identify the 17
- [ ] List all 54 artists from ArtistMaster.json
- [ ] List all 37 artists from research doc
- [ ] Diff to find 17 missing

### Step 2: Categorize
- [ ] Separate into: Golden Age vs Modern/Neo-tango
- [ ] Modern artists: May not need deep research (still active)
- [ ] Golden Age gaps: Need research prompt

### Step 3: Generate Research Prompt (if needed)
- [ ] For any Golden Age artists missing, create deep research prompt

---

## Deep Research Prompt Template

```
DEEP RESEARCH REQUEST: Tango Orchestra Last Recording Years

Research the following [N] tango orchestras/artists to determine:
1. Birth/death years (or founding/dissolution for ensembles)
2. Last confirmed recording year as orchestra director/leader
3. Career span (first to last recording)
4. Primary record labels
5. Any notable gaps or ambiguities

Artists to research:
[LIST]

Sources to use:
- todotango.com (discographies)
- el-recodo.com (recording dates)
- tango.info (detailed session data)
- Tango Time Travel
- Wikipedia (artist biographies)
- Discogs (careful: often reissue dates)

Output format: Table with columns:
| Artist | Born | Died | Last Recording Year | Career Span | Primary Labels | Notes |

Include citation for each finding.
```

---

## Acceptance Criteria

1. All 17 missing artists identified
2. Each categorized as Golden Age or Modern
3. Golden Age artists have research prompt ready (or flagged as "needs research")
4. Modern artists marked as "active - no end date"

---

## Prompt for Compás

```
TASK 1B: Missing Artists Coverage

1. Read Task-1B-MissingArtists.md (this file)
2. Extract all 54 artists from ArtistMaster.json
3. Extract all 37 artists from OrchestraLeaders-LastRecordingYears.md
4. Identify the 17 missing
5. Categorize each as Golden Age or Modern
6. For Golden Age gaps: Generate deep research prompt
7. For Modern: Mark as active/no end date
8. Log findings to ChangeLog-Phase1.md
9. If deep research needed: STOP and present prompt to user for approval

Do NOT execute deep research without user approval.
```

---

*Owner: Compás*
