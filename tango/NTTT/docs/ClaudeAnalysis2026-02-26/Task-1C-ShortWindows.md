# Task 1C: Short Recording Windows - DQ Check

## Status: TODO

## Objective
Audit artists with very short recording windows to detect reissue contamination in djSongsWeighted.json.

---

## High-Risk Artists

These artists had brief recording careers but long lives - any year in DB significantly after their recording window is likely a reissue:

| Artist | Recording Window | Died | Risk |
|--------|-----------------|------|------|
| Antonio Rodio | 1943-1944 | 1980 | Any year >1944 = reissue |
| José García y sus Zorros Grises | 1942-1945 | 2000 | Any year >1945 = reissue |
| Rafael Canaro | 1929-1939 | 1972 | Any year >1939 = reissue |
| Quinteto Don Pancho | 1937-1940 | — | Any year >1940 = reissue |

---

## Tasks

### For EACH Artist:

#### Step 1: Query djSongsWeighted
- [ ] Find MAX(year) for artist
- [ ] Find MIN(year) for artist
- [ ] Count total songs
- [ ] List any songs with year > recording window

#### Step 2: Evaluate
- [ ] If MAX(year) within window: PASS - no action
- [ ] If MAX(year) > window by 1-5 years: FLAG for review
- [ ] If MAX(year) > window by 5+ years: LIKELY REISSUE - flag for DQ

#### Step 3: For Each Flagged Song
- [ ] Record song title, current year, artist
- [ ] Research correct year if possible
- [ ] Recommend action:
  - `clearYear` - remove year (unknown original)
  - `correctYear` - replace with researched year
  - `markReissue` - add isReissue flag
  - `doNotPlay` - flag as DQ issue

---

## Output Format

For each artist, document:
```markdown
### [Artist Name]

**DB Range:** [MIN year] - [MAX year]
**Research Range:** [from doc]
**Status:** PASS | FLAG | REISSUE

**Flagged Songs:**
| Title | DB Year | Issue | Recommended Action |
|-------|---------|-------|-------------------|
| ... | ... | ... | ... |
```

---

## Acceptance Criteria

1. All 4 artists queried against djSongsWeighted
2. Any songs outside recording window flagged
3. Each flagged song has recommended action
4. Changes logged to ChangeLog-Phase1.md

---

## Prompt for Compás

```
TASK 1C: Short Recording Window DQ Check

1. Read Task-1C-ShortWindows.md (this file)
2. For each of the 4 artists:
   a. Query djSongsWeighted.json for MIN/MAX year
   b. Compare against known recording window
   c. Flag any songs outside window
3. For flagged songs:
   a. Document title, year, issue
   b. Recommend action (clearYear/correctYear/markReissue/doNotPlay)
4. Log all findings to ChangeLog-Phase1.md
5. Report summary to user

If any song needs online research to determine correct year, STOP and present research prompt to user.
```

---

*Owner: Compás*
