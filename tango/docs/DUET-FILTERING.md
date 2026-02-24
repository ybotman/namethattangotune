# Duet Filtering

## Overview

Songs with multiple singers (duets, trios) can now be filtered in quiz/learn modes. This allows users to:
- Practice with all singers (default)
- Practice with solo singers only (exclude duets)
- Practice with duets/trios only

## Data Model

### SingerMaster.json

The `isDuetPlus` field is added to singer entries that represent multiple performers:

```json
{
  "singer": "Carlos Dante y Oscar Larroca",
  "songCount": 33,
  "orchestras": ["Alfredo De Angelis"],
  "isDuetPlus": true
}
```

**Detection patterns:**
- Contains ` y ` (Spanish "and") - e.g., "Carlos Dante y Oscar Larroca"
- Contains ` - ` (dash separator) - e.g., "Alberto Echague - Armando Laborde"
- Contains `,` (comma for trios+) - e.g., "Romeo Gavio, Lita Morales y Horacio Lagos"

**Statistics (as of 2026-02-24):**
- Total singers: 188
- Duets/Trios (isDuetPlus=true): 69

### djSongs.json

No changes needed. The `Singer` field in each song maps to `singer` in SingerMaster.json. Duet status is determined by lookup at filter time.

## API: fetchFilteredSongs

### New Option: `duetFilter`

```js
import { fetchFilteredSongs } from '@/utils/dataFetching';

const { songs } = await fetchFilteredSongs(
  artists,      // string[]
  levels,       // number[]
  composers,    // string[]
  styles,       // string[]
  candombe,     // "" | "true" | "false"
  alternative,  // "" | "true" | "false"
  cancion,      // "" | "true" | "false"
  qty,          // number
  {
    requireSinger: true,
    duetFilter: 'solo',  // 'all' | 'solo' | 'duetsOnly'
  }
);
```

### duetFilter Values

| Value | Description |
|-------|-------------|
| `'solo'` | Exclude duets/trios - only solo singers (default) |
| `'duetsOnly'` | Only include duets/trios |
| `'all'` | Include all singers |

## Implementation Details

1. **SingerMaster.json** is loaded alongside other data in `fetchFilteredSongs`
2. A lookup map is built: `{ singerNameLower: isDuetPlus }`
3. After singer filtering, the `duetFilter` is applied:
   - `'solo'`: excludes songs where `singerDuetMap[song.Singer] === true`
   - `'duetsOnly'`: includes only songs where `singerDuetMap[song.Singer] === true`

## UI Integration (TODO)

Add to ConfigTab for singer-learn mode:

```jsx
<FormControl>
  <FormLabel>Singer Type</FormLabel>
  <RadioGroup value={duetFilter} onChange={handleDuetFilterChange}>
    <FormControlLabel value="all" label="All Singers" />
    <FormControlLabel value="solo" label="Solo Only" />
    <FormControlLabel value="duetsOnly" label="Duets Only" />
  </RadioGroup>
</FormControl>
```

## Files Changed

| File | Change |
|------|--------|
| `public/songData/SingerMaster.json` | Added `isDuetPlus: true` to 69 duet entries |
| `src/app/utils/dataFetching.js` | Added `duetFilter` option, loads SingerMaster, applies filter |

## Maintenance

When adding new singers to SingerMaster.json, check if they match duet patterns:
- Contains ` y `
- Contains ` - `
- Contains `,`

If so, add `"isDuetPlus": true` to the entry.
