# JIRA Ticket: NTTT Data File Naming Cleanup

**Project:** NTTT
**Type:** Tech Debt / Refactor
**Priority:** Low (post-audio work)
**Sprint:** Backlog

---

## Summary

Rename legacy data files and fields to be self-documenting. Current naming reflects DJ app origin, not current purpose.

---

## File Renames

| Current | New | Purpose |
|---------|-----|---------|
| `public/songData/djSongsWeighted.json` | `public/data/songs.json` | Master song database |
| `public/songData/ArtistMaster.json` | `public/data/orchestras.json` | Orchestra tier definitions |
| `public/songData/SingerMaster.json` | `public/data/singers.json` | Singer tier definitions |
| `docs/IconicMaster.json` | `public/data/iconic.json` | Iconic song overrides |

Also rename folder: `public/songData/` → `public/data/`

---

## Field Renames (inside songs.json)

| Current | New | Notes |
|---------|-----|-------|
| `ArtistMaster` | `orchestra` | Normalized orchestra name |
| `songFamiliarity` | `familiarity` | Simpler |
| `TimesPlayed` | `playCount` | Consistent casing |
| `orchestraLevel` | `orchTier` | Optional - could derive |

---

## Impact Analysis

### Files to Update

**djSongsWeighted → songs.json** (20 files)
- `scripts/audit-songs.js`
- `scripts/build-familiarity.js`
- `scripts/fix-biagi-laurenz.js`
- `src/app/utils/dataFetching.js`
- `scripts/mark-dnp-dup.js`
- `scripts/fix-data-quality.js`
- `scripts/extract-singers.js`
- `scripts/build-singer-master.js`
- `scripts/count-grid.js`
- `scripts/build-iconic.js`
- `scripts/match-iconic.js`
- `src/app/games/orchestra-learn/ConfigTab.js`
- `src/app/games/recognition-validator/page.js`
- `src/app/games/data-quality/page.js`
- `scripts/fix-sextetos.js`
- `scripts/dnp-data-export.js`
- `scripts/fix-antonio-rodio.js`
- `scripts/analyze-dnp.js`
- `src/app/api/data-quality/save-songs/route.js`
- `scripts/add-dnp-fields.js`

**ArtistMaster field** (39 files)
- All PlayTab.js files (7)
- All hooks (useArtistQuiz, useSingerQuiz, etc.)
- DifficultyGrid.js, OrchestraLevelSelector.js
- dataFetching.js
- Various scripts

**SingerMaster** (11 files)
- dataFetching.js
- SingerDifficultyGrid.js
- Singer game components

**IconicMaster** (3 files)
- audit-songs.js
- build-familiarity.js
- build-singer-master.js

---

## Approach

1. **Create migration script** that:
   - Renames files
   - Updates all imports/requires
   - Renames fields in JSON
   - Updates all field references in code

2. **Run script on fresh branch**

3. **Test all games**:
   - Orchestra Quiz
   - Singer Quiz
   - Song Quiz
   - Learn modes
   - Clip modes

4. **Commit as single atomic change**

---

## Acceptance Criteria

- [ ] All files renamed per table above
- [ ] All imports updated
- [ ] All field references updated
- [ ] No "djSongs", "ArtistMaster", "SingerMaster" references remain
- [ ] All games functional
- [ ] Scripts still work (audit-songs, build-familiarity, etc.)
- [ ] AUDITSONGS command updated

---

## Estimate

**Effort:** 2-3 hours (mostly find-replace + testing)
**Risk:** Low (mechanical refactor, no logic changes)

---

## Notes

- Do NOT mix with feature work
- Create dedicated branch: `refactor/file-naming-cleanup`
- Good candidate for after audio import work is stable
