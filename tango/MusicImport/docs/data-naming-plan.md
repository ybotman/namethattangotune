# NTTT Data Naming Cleanup Plan

**Status:** Planning
**Builds on:** `NTTT/docs/JIRA-file-rename-cleanup.md`
**Created:** 2026-03-10

---

## Goals

1. Remove "dj" prefix - legacy from DJ app origin
2. Use semantic, self-documenting names
3. Consistent field naming (camelCase)
4. Clear separation: source data vs production data

---

## File Renames

### MusicImport (Source Data)

| Current | New | Purpose |
|---------|-----|---------|
| `djSongs.json` | `songs-source.json` | Raw song data from Mixxx |
| `djSongs_with_lineage.json` | `songs-lineage.json` | Songs with Source/Source2 |
| `djSongsWeighted.json` | *(production only)* | Not in MusicImport |
| `djLibrary.json` | `mixxx-library.json` | Full Mixxx export |
| `djTrack_locations.json` | `mixxx-track-paths.json` | File path mapping |
| `djMatchedSongs.json` | `songs-matched.json` | Successfully matched songs |
| `djUnMatchedSongs.json` | `songs-unmatched.json` | Failed matches |
| `djTangoSongs.json` | `songs-tango-filtered.json` | Tango-only subset |
| `djSongsMetadata.json` | `songs-metadata.json` | Extracted ID3 tags |
| `ArtistMaster.json` | `orchestras.json` | Orchestra tier definitions |
| `ArtistsRaw.json` | `orchestras-raw.json` | Raw artist list |
| `new_songs_import.json` | `import-batch-YYYYMMDD.json` | Per-batch imports |

**Delete (backups/intermediates):**
- `djSongs_boris.json` → Keep as `import-batch-boris.json`
- `djSongs_backup_*.json` → Archive or delete
- `djSongsFiltered_boris.json` → Delete
- `djLibrary_boris.json` → Archive
- `*_boris.json` pattern → Archive to `archive/boris/`

### NTTT Production (public/songData/)

| Current | New | Purpose |
|---------|-----|---------|
| `djSongsWeighted.json` | `songs.json` | **Master song database** |
| `djSongs.json` | *(delete - use songs.json)* | Legacy duplicate |
| `djSongs_enriched.json` | *(delete)* | Legacy |
| `djSongsL1.json` | *(delete)* | Legacy tier subset |
| `djSongsL2.json` | *(delete)* | Legacy tier subset |
| `ArtistMaster.json` | `orchestras.json` | Orchestra tiers |
| `SingerMaster.json` | `singers.json` | Singer tiers/eras |
| `IconicLists.json` | `iconic.json` | Curated iconic lists |
| `StyleMaster.json` | `styles.json` | Style definitions |
| `TangoPeriods.json` | `periods.json` | Era definitions |
| `vocalAnalysis.json` | `vocal-analysis.json` | Whisper results |
| `gridInventory.json` | `grid-orchestra.json` | Orchestra grid counts |
| `singerGridInventory.json` | `grid-singer.json` | Singer grid counts |
| `songGridInventory.json` | `grid-song.json` | Song grid counts |
| `dataQualityIssues.json` | `quality-issues.json` | Data problems |
| `PlayPhrases.json` | `play-phrases.json` | UI phrases |

**Folder rename:** `public/songData/` → `public/data/`

---

## Field Renames (songs.json)

| Current | New | Notes |
|---------|-----|-------|
| `SongID` | `id` | Standard |
| `Title` | `title` | camelCase |
| `Orchestra` | `orchestra` | camelCase |
| `ArtistMaster` | `orchestraNorm` | Normalized name for matching |
| `Singer` | `singer` | camelCase |
| `Year` | `year` | camelCase |
| `Style` | `style` | camelCase |
| `AudioUrl` | `audioUrl` | Already good |
| `Alternative` | `isAlternative` | Boolean prefix |
| `Candombe` | `isCandombe` | Boolean prefix |
| `Cancion` | `isCancion` | Boolean prefix |
| `HasSinger` | `hasSinger` | Already good |
| `TimesPlayed` | `playCount` | Clearer |
| `Rating` | `rating` | camelCase |
| `Weight` | `weight` | camelCase |
| `orchestraLevel` | `orchTier` | Shorter |
| `singerLevel` | `singerTier` | Consistent |
| `singerEra` | `singerEra` | Keep |
| `recognitionScore` | `recogScore` | Shorter |
| `recognitionTier` | `recogTier` | Consistent |
| `songFamiliarity` | `familiarity` | Simpler |
| `PriorityTier` | `priorityTier` | camelCase |
| `DNP` | `doNotPlay` | Explicit |
| `DNP_reason` | `dnpReason` | camelCase |
| `DUP` | `isDuplicate` | Boolean prefix |
| `DUP_reason` | `dupReason` | camelCase |
| `Source` | `source` | camelCase |
| `Source2` | `sourceDetail` | Clearer |
| `Composer` | `composer` | camelCase |
| `Album` | `album` | camelCase |

---

## Field Renames (orchestras.json / ArtistMaster)

| Current | New | Notes |
|---------|-----|-------|
| `artist` | `name` | Standard |
| `level` | `tier` | Consistent with songs |
| `active` | `isActive` | Boolean prefix |
| `grouped` | `groupedAs` | Clearer |

---

## Field Renames (singers.json / SingerMaster)

Keep current structure - already well-named:
- `levelDefinitions`
- `eraDefinitions`
- `singers` (array)

---

## Migration Strategy

### Phase 1: MusicImport Cleanup
```bash
# Create archive folder
mkdir -p archive/boris archive/backups

# Move Boris files
mv *_boris.json archive/boris/

# Move backups
mv *_backup_*.json archive/backups/

# Rename core files
mv djSongs.json songs-source.json
mv djSongs_with_lineage.json songs-lineage.json
mv djLibrary.json mixxx-library.json
mv djTrack_locations.json mixxx-track-paths.json
mv ArtistMaster.json orchestras.json
```

### Phase 2: Update Import Scripts
Update these files to use new names:
- `add_lineage.py`
- `import_new_songs.py`
- `merge_to_weighted.py`
- `build_weighted_songs.py`
- `validate_import.py`

### Phase 3: NTTT Production Rename
1. Create branch: `refactor/data-naming-cleanup`
2. Rename files in `public/songData/` → `public/data/`
3. Update all imports (see JIRA doc for file list)
4. Run field rename script on JSON files
5. Test all games
6. Deploy

### Phase 4: Field Migration (Optional)
Can be done incrementally or all at once:
- Update JSON files with new field names
- Update all code references
- Consider keeping aliases during transition

---

## Code Impact Summary

| Area | Files | Effort |
|------|-------|--------|
| MusicImport scripts | ~15 | Low |
| NTTT dataFetching.js | 1 | Medium |
| NTTT game components | ~20 | Medium |
| NTTT scripts/ | ~15 | Low |
| NTTT hooks/ | ~8 | Medium |

**Total estimate:** 4-6 hours for full migration

---

## Rollback Plan

1. Keep backup branch before changes
2. Keep `*_backup_*.json` files until verified
3. Can revert single commit if atomic

---

## Decision Points

**Q1: Do field renames in one PR or separate?**
- Option A: All at once (cleaner, one breaking change)
- Option B: Files first, fields later (lower risk)
- **Recommendation:** Option A if doing during low-traffic period

**Q2: Aliases during transition?**
- Could add `orchestra` alongside `ArtistMaster` temporarily
- **Recommendation:** No - clean break is better

**Q3: When to execute?**
- After audio import pipeline is stable
- During low-traffic period
- **Recommendation:** After current lineage work is merged

---

*Updated: 2026-03-10*
