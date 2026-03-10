# Task 1A: Angel Vargas - Reclassify as Singer

## Status: TODO

## Objective
Reclassify Angel Vargas from implicit "orchestra" to explicit `type: "singer"` in ArtistMaster.json.

---

## Background

Angel Vargas was never an orchestra director. He was a featured vocalist who:
- Sang with Angel D'Agostino's orchestra (1940-1946)
- Made solo recordings with pickup studio orchestras (Armando Lacava, Eduardo del Piano)
- Last recording: June 16, 1959 (with José Libertella's orchestra)
- Died: July 7, 1959

---

## Current State in ArtistMaster.json

```json
{
  "artist": "Angel Vargas",
  "active": "true",
  "level": "3",
  "grouped": [
    "Angel Vargas y Orquesta Armando Lacava",
    "Angel Vargas con la Orquesta Armando Lacava",
    "Angel Vargas con la Orquesta de Armando Lacava",
    "Angel Vargas y Orquesta Eduardo del Piano",
    "Angel Vargas con la Orquesta Eduardo del Piano"
  ]
}
```

**Note:** No accent on "Angel" - matches djSongsWeighted (no accent issues).

---

## Tasks

### Step 1: Cross-Reference
- [ ] Query djSongsWeighted for all Angel Vargas entries
- [ ] Confirm MAX(year) in database
- [ ] Count songs by Orchestra value

### Step 2: Update ArtistMaster
- [ ] Add `"type": "singer"`
- [ ] Add `"lastYearInSongDB": [from step 1]`
- [ ] Add `"lastRecordingYearKnown": 1959`
- [ ] Add `"researchSource": "Research doc: died July 7, 1959; last recording June 16, 1959"`

### Step 3: Document
- [ ] Log changes to ChangeLog-Phase1.md

### Step 4: Verify
- [ ] Ask user to test singer mode vs orchestra mode

---

## Acceptance Criteria

1. Angel Vargas has `type: "singer"` in ArtistMaster
2. Angel Vargas does NOT appear as selectable orchestra in orchestra game
3. Angel Vargas DOES appear in singer game mode
4. Songs credited to "Angel Vargas y Orquesta..." are still playable

---

## Prompt for Compás

```
TASK 1A: Angel Vargas Reclassification

1. Read Task-1A-AngelVargas.md (this file)
2. Run cross-reference query on djSongsWeighted.json for Angel Vargas
3. Update ArtistMaster.json with new fields
4. Log changes to ChangeLog-Phase1.md
5. Report completion and ask user to test

Do NOT proceed to other tasks until user confirms this one is complete.
```

---

*Owner: Compás*
