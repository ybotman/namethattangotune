# Game Design Guidelines

## Dropdown/Selector Rules

### No Count Filters on Dropdowns

**Rule:** Never filter dropdown options by song count, play count, or similar metrics.

**Why:** Users should see all available options. Filtering happens at play time when songs are fetched, not at configuration time.

**Applies to:**
- Orchestra selectors
- Artist selectors
- Singer selectors
- Level selectors
- Style selectors
- Composer selectors

**Example - Wrong:**
```js
// DON'T filter by count in dropdown
const singersWithCount = singerData.filter((s) => s.songCount >= 5);
```

**Example - Correct:**
```js
// Show all singers in dropdown
setAllSingers(singerData);
```

### Filter Context Matters

When a toggle/filter affects a dropdown, place the toggle **above** the dropdown it controls.

**Example:** Singer Type toggle (Solo/Duets+/Both) appears above the Singers dropdown because it filters which singers appear in that dropdown.

## Data Model

### Master Files (source of truth)

| File | Purpose | Key Fields |
|------|---------|------------|
| `ArtistMaster.json` | Orchestra metadata | artist, level, active |
| `SingerMaster.json` | Singer metadata | singer, songCount, isDuetPlus |
| `StyleMaster.json` | Style categories | primaryStyles |
| `djSongsWeighted.json` | Song catalog | All song fields + Weight |

### Derived Fields

Some fields are computed at runtime via lookup:
- `isDuetPlus` - looked up from SingerMaster by song.Singer
- `level` - looked up from ArtistMaster by song.ArtistMaster

## Filtering Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Config UI     │────▶│ fetchFilteredSongs│────▶│  Game/Quiz      │
│  (all options)  │     │  (apply filters)  │     │ (filtered songs)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **Config UI** - Shows all options (no pre-filtering)
2. **fetchFilteredSongs** - Applies user's selected filters
3. **Game/Quiz** - Receives only matching songs

## UI Patterns

### Toggle Groups

Use MUI `ToggleButtonGroup` for mutually exclusive options:

```jsx
<ToggleButtonGroup
  value={config.duetFilter || "solo"}
  exclusive
  onChange={(e, val) => val && updateConfig("duetFilter", val)}
  size="small"
>
  <ToggleButton value="solo">Solo</ToggleButton>
  <ToggleButton value="duetsOnly">Duets+</ToggleButton>
  <ToggleButton value="all">Both</ToggleButton>
</ToggleButtonGroup>
```

### Selector Components

Reusable selector components in `src/app/components/ui/`:
- `SingersSelector` - Multi-select autocomplete for singers
- `LevelsSelector` - Checkbox group for levels 1-5
- `StylesSelector` - Checkbox group for Tango/Vals/Milonga
- `YearRangeSelector` - Dual-thumb slider for year range
- `SongsSlider` - Single slider for song count
- `SecondsSlider` - Single slider for time limit
