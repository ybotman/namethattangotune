# Task 1E: Confirmed Reissue Contamination - Fix 6 Known Issues

## Status: TODO

## Objective
Fix the 6 confirmed cases where reissue/remaster dates are incorrectly stored as original recording years.

---

## Confirmed Issues (from Research)

| Artist | DB Max Year | Actual Last Recording | Artist Died | Gap | Issue |
|--------|------------|----------------------|-------------|-----|-------|
| Alfredo de Angelis | 2014 | 1989 | 1992 | +25 years | Compilation 22 years after death |
| Domingo Federico | 2021 | 1968 | 2000 | +53 years | "Remastered" in title |
| Edgardo Donato | 2016 | 1961 | 1963 | +55 years | Reissue 53 years after death |
| Francisco Lomuto | 2015 | 1950 | 1950 | +65 years | Reissue 65 years after death |
| Miguel Caló | 1999 | 1972 | 1972 | +27 years | Compilation 27 years after death |
| Osvaldo Pugliese | 2011 | 1989 | 1995 | +22 years | Posthumous reissue |

---

## Tasks

### For EACH Artist:

#### Step 1: Find Contaminated Songs
- [ ] Query djSongsWeighted for songs with year > actual last recording
- [ ] List each song: title, current year, Orchestra value

#### Step 2: Determine Correct Action
For each song, choose one:
- `clearYear`: Set year to null (original unknown)
- `correctYear`: Replace with researched original year
- `markReissue`: Add `isReissue: true` + `reissueYear: [current]`, clear year
- `doNotPlay`: Flag as DQ, set `active: false`

#### Step 3: Apply Fixes
- [ ] Update djSongsWeighted.json
- [ ] Log each change with before/after

#### Step 4: Update ArtistMaster
- [ ] Add `lastRecordingYearKnown` field
- [ ] Add `researchSource` field

---

## Detailed Fix Plan

### 1. Alfredo de Angelis (DB: 2014, Actual: 1989)
```
Find songs where year > 1989
Action: markReissue (set isReissue=true, reissueYear=2014, clear year or set to null)
Research needed: Find original year for each flagged song
```

### 2. Domingo Federico (DB: 2021, Actual: 1968)
```
Find songs where year > 1968
Special: Look for "Remastered" in title
Action: markReissue
Note: 1994 university orchestra recordings may be legitimate (research needed)
```

### 3. Edgardo Donato (DB: 2016, Actual: 1961)
```
Find songs where year > 1961
Action: markReissue or clearYear
Artist died 1963, so any year > 1963 is impossible
```

### 4. Francisco Lomuto (DB: 2015, Actual: 1950)
```
Find songs where year > 1950
Action: markReissue
Artist died 1950, so any year > 1950 is impossible
```

### 5. Miguel Caló (DB: 1999, Actual: 1972)
```
Find songs where year > 1972
Action: markReissue
Artist died 1972, so any year > 1972 is impossible
```

### 6. Osvaldo Pugliese (DB: 2011, Actual: 1989)
```
Find songs where year > 1989
Note: Live recordings through 1994 may be legitimate
Action for 1990-1994: keep if live recording
Action for 1995+: markReissue (died 1995)
```

---

## Song-Level Research Prompt

If original year unknown, use this prompt for deep research:

```
SONG RESEARCH: [Title] by [Artist]

The database has year [DB year] but the artist's last recording was [actual].
Research the original recording date for this song.

Sources:
- el-recodo.com (search by title + artist)
- tango.info (discography)
- todotango.com

Return: Original year OR "unknown - clear year"
```

---

## Acceptance Criteria

1. All 6 artists queried for contaminated songs
2. Each contaminated song has action assigned
3. Changes applied to djSongsWeighted.json
4. ArtistMaster.json updated with lastRecordingYearKnown
5. All changes logged to ChangeLog-Phase1.md
6. User verification requested

---

## Prompt for Compás

```
TASK 1E: Reissue Contamination Fixes

1. Read Task-1E-ReissueContamination.md (this file)
2. For each of the 6 artists:
   a. Query djSongsWeighted for songs with year > actual last recording
   b. List each contaminated song
   c. Assign action (clearYear/correctYear/markReissue/doNotPlay)
3. Present full list to user for approval BEFORE making changes
4. If user approves:
   a. Apply changes to djSongsWeighted.json
   b. Update ArtistMaster.json
   c. Log to ChangeLog-Phase1.md
5. Ask user to test

CRITICAL: Get user approval before modifying JSON files.
```

---

*Owner: Compás*
