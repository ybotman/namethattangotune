# Task 2A: Implement Do Not Play (DNP) Flag

## Status: TODO

## Objective
Add a `doNotPlay` flag to djSongsWeighted.json that:
1. Excludes flagged songs from all game modes
2. Still shows flagged songs in DQ-analysis page for review
3. Allows easy toggle on/off via DQ-analysis UI

---

## Scope Estimate

| Category | Est. DNP | Reason |
|----------|----------|--------|
| wrong_year (unfixable) | ~20 | Reissue dates, original unknown |
| no_orchestra | ~30 | Can't match to ArtistMaster |
| true_duplicate | 7 | Exact duplicates |
| other (unfixable) | ~20 | Various issues |
| **Total DNP** | **~50-80** | ~1-2% of 4,675 songs |

---

## Schema Change: djSongsWeighted.json

Add new field to song objects:
```json
{
  "SongID": "...",
  "Title": "...",
  "Orchestra": "...",
  "doNotPlay": true,          // NEW: exclude from gameplay
  "dnpReason": "reissue_date", // NEW: optional reason code
  "dnpNotes": "Year 2021 is remaster, original unknown"  // NEW: optional notes
  ...
}
```

**Reason codes:**
- `reissue_date` - Year is reissue/remaster, original unknown
- `no_orchestra` - Can't match to ArtistMaster
- `duplicate` - True duplicate of another song
- `bad_audio` - Audio file corrupt or missing
- `data_quality` - Other unfixable data issue

---

## Code Changes Required

### 1. Data Fetching (filter DNP in gameplay)

**File:** `src/utils/dataFetching.js`

Add filter to exclude DNP songs:
```javascript
// In song filtering function
const playableSongs = songs.filter(song => !song.doNotPlay);
```

### 2. DQ-Analysis Page (show DNP songs)

**File:** `src/app/games/data-quality/page.js`

Add:
- Toggle filter: "Show DNP Only" / "Hide DNP"
- Button to mark song as DNP
- Button to remove DNP flag
- Display DNP reason/notes

### 3. API Endpoint (save DNP status)

**File:** `src/app/api/data-quality/save/route.js`

Update to handle DNP field changes.

---

## Implementation Steps

### Phase 1: Schema + Data
- [ ] Add `doNotPlay`, `dnpReason`, `dnpNotes` fields to schema
- [ ] Create migration script to add fields to all songs (default: false/null)
- [ ] Identify initial DNP candidates from DQ issues

### Phase 2: Backend Filter
- [ ] Update `dataFetching.js` to filter out DNP songs
- [ ] Test that DNP songs don't appear in games

### Phase 3: DQ-Analysis UI
- [ ] Add DNP toggle button per song
- [ ] Add DNP filter (show/hide)
- [ ] Add DNP reason dropdown
- [ ] Add DNP notes field
- [ ] Save DNP changes via API

### Phase 4: Bulk Operations
- [ ] Add "Mark all filtered as DNP" button
- [ ] Add "Clear DNP for all filtered" button

---

## DQ-Analysis UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ Data Quality Review                                          │
├─────────────────────────────────────────────────────────────┤
│ Filters: [Category ▼] [Show Fixed ☐] [Show DNP Only ☐]     │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DQ-0140: "Obsesion" - Alfredo de Angelis (2014)         │ │
│ │ Category: wrong_year                                     │ │
│ │ [▶ Play] [Mark Fixed] [🚫 DNP] [Notes...]               │ │
│ │                                                          │ │
│ │ DNP Reason: [reissue_date ▼]                            │ │
│ │ DNP Notes: [Year is 2014 remaster, original unknown___] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

1. `doNotPlay: true` songs do NOT appear in any game mode
2. `doNotPlay: true` songs DO appear in DQ-analysis page
3. DQ-analysis page can toggle DNP on/off per song
4. DNP changes persist to djSongsWeighted.json
5. DNP reason/notes can be recorded

---

## Questions for User

1. **Default behavior:** Should new songs default to `doNotPlay: false` or require explicit approval to play?

2. **Bulk DNP:** Should we auto-DNP all remaining "not_reviewed" DQ issues initially?

3. **DNP visibility:** Show DNP count in game UI? ("Playing from 4,600 of 4,675 songs")

---

## Prompt for Compás

```
TASK 2A: Implement Do Not Play (DNP) Flag

1. Read Task-2A-DoNotPlay.md (this file)
2. Present questions to user (default behavior, bulk DNP, visibility)
3. After user answers:
   a. Update djSongsWeighted.json schema (add fields)
   b. Update dataFetching.js (add filter)
   c. Update data-quality/page.js (add UI)
   d. Update API route (handle DNP saves)
4. Test that DNP songs don't appear in games
5. Log changes to ChangeLog-Phase1.md
6. Ask user to verify

Get user approval on questions before implementing.
```

---

*Owner: Compás*
*Created: 2026-02-26*
