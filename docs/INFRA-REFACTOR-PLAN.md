# NTTT Infrastructure Refactor Plan

**Version:** v2.9.0 (target)
**Baseline:** v2.8.1 (tagged 2026-03-10)
**Status:** Planning

---

## Overview

Modernize data file names and field names to be self-documenting. Remove legacy "dj" prefixes from DJ app origin.

---

## Phase 1: File Renames

### NTTT Production Files (public/songData/ → public/data/)

| Current | New | Impact |
|---------|-----|--------|
| `public/songData/` | `public/data/` | Folder rename |
| `djSongsWeighted.json` | `songs.json` | **20+ file imports** |
| `ArtistMaster.json` | `orchestras.json` | 15+ file imports |
| `SingerMaster.json` | `singers.json` | 11+ file imports |
| `IconicLists.json` | `iconic.json` | 3 file imports |
| `StyleMaster.json` | `styles.json` | 2 file imports |
| `TangoPeriods.json` | `periods.json` | 2 file imports |
| `vocalAnalysis.json` | `vocal-analysis.json` | 5 file imports |
| `gridInventory.json` | `grid-orchestra.json` | 3 file imports |
| `singerGridInventory.json` | `grid-singer.json` | 2 file imports |
| `songGridInventory.json` | `grid-song.json` | 1 file import |
| `dataQualityIssues.json` | `quality-issues.json` | 2 file imports |
| `PlayPhrases.json` | `play-phrases.json` | 1 file import |

**Delete (legacy/unused):**
- `djSongs.json` (duplicate of djSongsWeighted)
- `djSongs_enriched.json` (old format)
- `djSongsL1.json`, `djSongsL2.json` (legacy tier subsets)
- `djSongsWeighted_backup_*.json` (backups - archive first)

### MusicImport Files

| Current | New |
|---------|-----|
| `djSongs.json` | `songs-source.json` |
| `djSongs_with_lineage.json` | `songs-lineage.json` |
| `djLibrary.json` | `mixxx-library.json` |
| `djTrack_locations.json` | `mixxx-paths.json` |
| `ArtistMaster.json` | `orchestras.json` |
| `new_songs_import.json` | `import-YYYYMMDD.json` |

---

## Phase 2: Field Renames (songs.json)

### Core Fields

| Current | New | Type | Notes |
|---------|-----|------|-------|
| `SongID` | `id` | string | Standard |
| `Title` | `title` | string | camelCase |
| `Orchestra` | `orchestra` | string | camelCase |
| `ArtistMaster` | `orchestraNorm` | string | Normalized for matching |
| `Singer` | `singer` | string | camelCase |
| `Year` | `year` | string | camelCase |
| `Style` | `style` | string | camelCase |
| `AudioUrl` | `audioUrl` | string | Keep |
| `Composer` | `composer` | string | camelCase |
| `Album` | `album` | string | camelCase |

### Boolean Fields

| Current | New | Notes |
|---------|-----|-------|
| `Alternative` | `isAlternative` | Boolean prefix |
| `Candombe` | `isCandombe` | Boolean prefix |
| `Cancion` | `isCancion` | Boolean prefix |
| `HasSinger` | `hasSinger` | Keep |
| `DNP` | `doNotPlay` | Explicit name |
| `DUP` | `isDuplicate` | Boolean prefix |

### Scoring/Tier Fields

| Current | New | Notes |
|---------|-----|-------|
| `TimesPlayed` | `playCount` | Clearer |
| `Rating` | `rating` | camelCase |
| `Weight` | `weight` | camelCase |
| `orchestraLevel` | `orchTier` | Consistent with tier naming |
| `singerLevel` | `singerTier` | Consistent |
| `singerEra` | `singerEra` | Keep |
| `recognitionScore` | `recogScore` | Shorter |
| `recognitionTier` | `recogTier` | Consistent |
| `songFamiliarity` | `familiarity` | Simpler |
| `PriorityTier` | `priorityTier` | camelCase |

### Reason Fields

| Current | New |
|---------|-----|
| `DNP_reason` | `dnpReason` |
| `DUP_reason` | `dupReason` |

### Lineage Fields (new)

| Field | Type | Values |
|-------|------|--------|
| `source` | string | `Mixxx`, `AI-GAP-Analysis-YYYY-MM-DD`, etc. |
| `sourceDetail` | string | `BorisH`, `YouTube`, `TobyLibrary`, etc. |

---

## Phase 3: Singer Structure Enhancement

### Add Gender Field

| Field | Values | Notes |
|-------|--------|-------|
| `gender` | `M`, `F`, `U` | Male, Female, Unknown |

**Gender definitions:**
- `M` - Male (most golden age singers)
- `F` - Female (Nelly Omar, Lita Morales, Amelita Baltar, etc.)
- `U` - Unknown (duets, groups, choirs)

### Known Female Singers

```
Nelly Omar, Lita Morales, Mercedes Carné, Amelita Baltar,
Tita Merello, Ada Falcón, Libertad Lamarque, Azucena Maizani,
Mercedes Simone, Dorita Davis
```

### Duet Entries (mark as U)

Entries like "Carlos Dante y Oscar Larroca" represent duet performances.
Future consideration: Normalize to individual singers with `isDuet` flag on songs.

---

## Phase 4: Code Changes

### Files to Update (by category)

#### Data Fetching (Critical Path)
```
src/app/utils/dataFetching.js          # Main data loading
src/app/api/data-quality/save-songs/route.js
```

#### Game Components (PlayTab files)
```
src/app/games/orchestra-quiz/PlayTab.js
src/app/games/singer-quiz/PlayTab.js
src/app/games/song-quiz/PlayTab.js
src/app/games/clip-orchestra/PlayTab.js
src/app/games/clip-singer/PlayTab.js
src/app/games/listen/PlayTab.js
src/app/games/orchestra-learn/PlayTab.js
src/app/games/singer-learn/PlayTab.js
src/app/games/year-learn/PlayTab.js
```

#### Hooks
```
src/app/hooks/useArtistQuizScoring.js
src/app/hooks/useSingerQuizScoring.js
src/app/hooks/useSongQuizScoring.js
src/app/hooks/useWaveSurfer.js
```

#### Config Components
```
src/app/games/*/ConfigTab.js (all games)
src/app/components/DifficultyGrid.js
src/app/components/SingerDifficultyGrid.js
src/app/components/OrchestraLevelSelector.js
```

#### Scripts
```
scripts/audit-songs.js
scripts/build-familiarity.js
scripts/build-singer-master.js
scripts/build-iconic.js
scripts/match-iconic.js
scripts/count-grid.js
scripts/fix-*.js (various)
scripts/dnp-data-export.js
scripts/analyze-dnp.js
scripts/add-dnp-fields.js
scripts/extract-singers.js
```

#### Validator Pages
```
src/app/games/recognition-validator/page.js
src/app/games/data-quality/page.js
```

---

## Migration Script

### Step 1: Rename JSON files
```bash
cd public/songData

# Rename folder
mv ../songData ../data

# Rename files
mv djSongsWeighted.json songs.json
mv ArtistMaster.json orchestras.json
mv SingerMaster.json singers.json
mv IconicLists.json iconic.json
mv StyleMaster.json styles.json
mv TangoPeriods.json periods.json
mv vocalAnalysis.json vocal-analysis.json
mv gridInventory.json grid-orchestra.json
mv singerGridInventory.json grid-singer.json
mv songGridInventory.json grid-song.json
mv dataQualityIssues.json quality-issues.json
mv PlayPhrases.json play-phrases.json

# Archive old files
mkdir -p archive
mv djSongs.json djSongs_enriched.json djSongsL1.json djSongsL2.json archive/
mv djSongsWeighted_backup_*.json archive/
```

### Step 2: Update imports in code
```bash
# Find and replace file references
find src scripts -name "*.js" -exec sed -i '' \
  -e 's/songData\/djSongsWeighted/data\/songs/g' \
  -e 's/songData\/ArtistMaster/data\/orchestras/g' \
  -e 's/songData\/SingerMaster/data\/singers/g' \
  -e 's/songData/data/g' \
  {} \;
```

### Step 3: Rename fields in JSON
```python
# Python script to rename fields
field_map = {
    'SongID': 'id',
    'Title': 'title',
    'Orchestra': 'orchestra',
    'ArtistMaster': 'orchestraNorm',
    # ... etc
}
```

### Step 4: Update field references in code
```bash
# Find and replace field names
find src scripts -name "*.js" -exec sed -i '' \
  -e 's/\.SongID/.id/g' \
  -e 's/\.Title/.title/g' \
  -e 's/\.ArtistMaster/.orchestraNorm/g' \
  # ... etc
  {} \;
```

---

## Test Plan

### Pre-Migration
- [ ] Tag v2.8.1 ✅
- [ ] Verify all games work in production
- [ ] Document current behavior (screenshots/notes)

### Unit Tests (per component)

#### Data Loading
- [ ] `dataFetching.js` loads songs correctly
- [ ] Filter by orchestra works
- [ ] Filter by singer works
- [ ] Filter by tier works
- [ ] Weighted random selection works

#### Game Tests
For each game mode:
- [ ] Config loads correctly
- [ ] Play starts without errors
- [ ] Audio plays
- [ ] Scoring works
- [ ] Results display correctly

| Game | Config | Play | Audio | Score | Results |
|------|--------|------|-------|-------|---------|
| orchestra-quiz | | | | | |
| singer-quiz | | | | | |
| song-quiz | | | | | |
| clip-orchestra | | | | | |
| clip-singer | | | | | |
| listen | | | | | |
| orchestra-learn | | | | | |
| singer-learn | | | | | |
| year-learn | | | | | |

### Integration Tests

- [ ] Game Hub loads all tiles
- [ ] Navigation between games works
- [ ] Settings persist
- [ ] PWA still works (install, offline)

### Regression Tests

- [ ] No console errors
- [ ] No 404s for data files
- [ ] No undefined field errors
- [ ] Mobile responsive still works
- [ ] iOS PWA touch still works

### Scripts Tests

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `node scripts/audit-songs.js` runs
- [ ] `node scripts/count-grid.js` runs

---

## Rollback Plan

1. Git revert to v2.8.1 tag
```bash
git checkout v2.8.1
```

2. Redeploy from tag
```bash
vercel --prod
```

---

## Execution Order

1. **Create branch:** `git checkout -b refactor/data-naming`
2. **Phase 1:** Rename files
3. **Phase 2:** Rename fields in JSON
4. **Phase 3:** Add singer gender
5. **Phase 4:** Update all code references
6. **Test:** Run full test plan
7. **Commit:** Single atomic commit
8. **Deploy:** To staging first
9. **Verify:** Full test on staging
10. **Merge:** To main
11. **Tag:** v2.9.0
12. **Deploy:** To production

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: File renames | 30 min |
| Phase 2: Field renames | 1 hour |
| Phase 3: Singer gender | 30 min |
| Phase 4: Code updates | 2 hours |
| Testing | 2 hours |
| **Total** | **~6 hours** |

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Field case | camelCase | JavaScript standard |
| Boolean prefix | `is*` / `has*` | Self-documenting |
| Duet handling | Mark as `U` gender | Defer normalization |
| Migration | Single PR | Atomic, easy rollback |

---

*Created: 2026-03-10*
*Baseline: v2.8.1*
