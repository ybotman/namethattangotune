# Familiarity/Recognition Tier Redesign

## The Problem

Current recognition tier system uses:
```
recognitionScore = 0.45*playCount + 0.30*starRating + 0.25*orchestraLevel
```

**Issues:**
1. **New songs can't reach Tier 1** - Play count weighted 45%, zero plays = max score ~0.48
2. **Single score conflates multiple dimensions** - Orchestra fame ≠ song fame ≠ singer fame
3. **Algorithm-driven, not curated** - La Cumparsita should ALWAYS be Iconic, regardless of play history
4. **No external validation** - Only uses our DJ data, not community consensus

**Current tiers (percentile-based):**
- Tier 1 (Iconic): Top 10% by score
- Tier 2 (Essential): Next 20%
- Tier 3 (Familiar): Next 30%
- Tier 4 (Challenging): Next 25%
- Tier 5 (Deep Cuts): Bottom 15%

---

## The Goal

Build a recognition/familiarity system that:
1. **Multi-dimensional curation** - Separate iconic lists for orchestra, singer, AND song title
2. **Era-aware** - Goyeneche (1970s) vs Fiorentino (1940s) are both iconic, different contexts
3. **Supports new imports** - New songs inherit familiarity from orchestra/singer/title
4. **Uses external data** - El-recodo danceability/popularity as validation
5. **Keeps DJ data as boost** - Play count affects weight within tier, not tier assignment

---

## Multi-Dimensional Iconic Model

A song can be iconic for **different reasons**:

| Dimension | Example | Impact |
|-----------|---------|--------|
| Iconic Orchestra | D'Arienzo, Di Sarli | Any song by them is recognizable |
| Iconic Singer | Goyeneche, Fiorentino | Any song they sing is notable |
| Iconic Title | La Cumparsita, El Choclo | Any version is recognizable |

### Scoring Matrix

```
iconicScore = (orchestraIconic * 0.4) + (singerIconic * 0.3) + (titleIconic * 0.3)
```

**Examples:**
- D'Arienzo + instrumental + "Paciencia" = 0.4 + 0 + 0 = 0.4 (orchestra carries it)
- Unknown orch + Goyeneche + unknown title = 0 + 0.3 + 0 = 0.3 (singer carries it)
- Any orch + any singer + "La Cumparsita" = varies + varies + 0.3 (title carries it)
- D'Arienzo + Echagüe + "La Cumparsita" = 0.4 + 0.3 + 0.3 = 1.0 (SUPER iconic)

---

## Curated Lists Structure

### IconicOrchestras.json
```json
{
  "level1": ["Juan D'Arienzo", "Carlos Di Sarli", "Anibal Troilo", "Osvaldo Pugliese"],
  "level2": ["Francisco Canaro", "Osvaldo Fresedo", "Angel D'Agostino", "Rodolfo Biagi"],
  "level3": ["Edgardo Donato", "Alfredo De Angelis", "Ricardo Tanturi", "Miguel Calo"]
}
```

### IconicSingers.json
```json
{
  "goldenAge": [
    {"name": "Francisco Fiorentino", "era": "1940-1945", "orchestra": "Troilo"},
    {"name": "Angel Vargas", "era": "1940-1945", "orchestra": "D'Agostino"},
    {"name": "Alberto Podestá", "era": "1940-1950", "orchestra": "Di Sarli/Laurenz"},
    {"name": "Floreal Ruiz", "era": "1940-1950", "orchestra": "Troilo"}
  ],
  "laterEra": [
    {"name": "Roberto Goyeneche", "era": "1960-1980", "note": "Post-golden, still iconic"},
    {"name": "Julio Sosa", "era": "1955-1965", "orchestra": "Pontier/solo"}
  ]
}
```

### IconicTitles.json
```json
{
  "superIconic": ["La Cumparsita", "El Choclo", "Por Una Cabeza", "Bahía Blanca"],
  "iconic": ["Poema", "A Media Luz", "Milonga Sentimental", "Sur", "Gallo Ciego"],
  "wellKnown": ["Desde El Alma", "Recuerdo", "Nostalgias", "La Yumba"]
}
```

---

## The Path (Implementation Roadmap)

### Phase 1: Extract & Curate (Week 1)
**Goal:** Create the three curated lists from existing data + expertise

| Step | Action | Source |
|------|--------|--------|
| 1.1 | Extract iconic orchestras | ArtistMaster.json level 1-2 |
| 1.2 | Extract iconic singers | SingerMaster.json + manual review |
| 1.3 | Extract iconic titles | IconicLists.json (72 songs) → extract unique titles |
| 1.4 | Validate with el-recodo | Cross-reference popularity (when rate limit clears) |
| 1.5 | Manual curation pass | Toby reviews/adjusts lists |

**Output:** `IconicOrchestras.json`, `IconicSingers.json`, `IconicTitles.json`

### Phase 2: Build Familiarity Tables (Week 1-2)
**Goal:** Calculate aggregate familiarity scores from DJ data

| Step | Action | Formula |
|------|--------|---------|
| 2.1 | Orchestra familiarity | avg(star * playCount) per orchestra |
| 2.2 | Singer familiarity | avg(star * playCount) per singer |
| 2.3 | Title familiarity | avg(star * playCount) per title |
| 2.4 | Normalize to 0-1 | percentile ranking |

**Output:** `FamiliarityLookup.json` with orchestraScore, singerScore, titleScore

### Phase 3: Compute Combined Scores (Week 2)
**Goal:** Add new fields to every song

```javascript
// For each song in djSongsWeighted.json:
song.orchestraIconic = isInIconicList(song.ArtistMaster) ? 1 : familiarityLookup[orchestra]
song.singerIconic = isInIconicList(song.Singer) ? 1 : familiarityLookup[singer]
song.titleIconic = isInIconicList(song.Title) ? 1 : familiarityLookup[title]
song.combinedIconicScore = (orch * 0.4) + (singer * 0.3) + (title * 0.3)
```

**Output:** Updated `djSongsWeighted.json` with new fields

### Phase 4: Assign Tiers (Week 2)
**Goal:** Map combined scores to tiers

| Tier | Criteria |
|------|----------|
| 1 (Iconic) | combinedIconicScore >= 0.8 OR in curated IconicLists |
| 2 (Essential) | combinedIconicScore >= 0.6 |
| 3 (Familiar) | combinedIconicScore >= 0.4 |
| 4 (Challenging) | combinedIconicScore >= 0.2 |
| 5 (Deep Cuts) | combinedIconicScore < 0.2 |

### Phase 5: Update Game Logic (Week 3)
**Goal:** Use new multi-dimensional data in games

- Update `dataFetching.js` to use new fields
- Add filters: "Iconic Orchestras only", "Iconic Singers only"
- Display tier info in game UI

### Phase 6: New Import Pipeline (Ongoing)
**Goal:** New songs auto-inherit familiarity

```
New audio
  → TangoLink (get ERT)
  → Lookup orchestra/singer/title familiarity
  → Calculate combinedIconicScore
  → Assign tier
  → Add to djSongsWeighted.json
```

---

## Resources Available

### Internal Data
| Resource | Location | Description |
|----------|----------|-------------|
| djSongsWeighted.json | NTTT/public/songData/ | 4,733 songs with StarRating, PlayCount |
| IconicLists.json | NTTT/public/songData/ | 72 curated iconic songs |
| ArtistMaster.json | NTTT/public/songData/ | Orchestra levels 1-5 |
| SingerMaster.json | NTTT/public/songData/ | Singer metadata |

### External Data Sources
| Source | Access | Data Available |
|--------|--------|----------------|
| TangoLink | Desktop app (paid, ~236 credits) | Audio fingerprint → ERT IDs |
| el-recodo.com | Paid subscription until 2027 | Danceability, popularity, BPM |
| tango.info | Open/free | Cross-reference, ~40k recordings |

### TangoLink Results (2026-03-01)
- 65 files processed from RIP20260301/
- 24 matched via audio fingerprint (ERT IDs captured)
- 41 unmatched (need text-based matching)
- Results: `MusicImport/external_data_poc/ert_extracted.json`

---

## Files & Scripts

| File | Purpose | Status |
|------|---------|--------|
| `MusicImport/external_data_poc/match_tango_info.py` | Match by title/orch/year | Ready |
| `MusicImport/external_data_poc/match_el_recodo.py` | Match against el-recodo | Ready (rate limited) |
| `MusicImport/external_data_poc/trickle_matcher.py` | Background batch matcher | Ready |
| `MusicImport/external_data_poc/ert_extracted.json` | ERT IDs from TangoLink | 24 songs |
| `NTTT/public/songData/IconicLists.json` | Curated iconic songs | 72 songs |

### Scripts Needed
| Script | Purpose | Priority |
|--------|---------|----------|
| `build_iconic_lists.py` | Extract iconic orch/singer/title from data | Phase 1 |
| `build_familiarity_tables.py` | Calculate aggregate familiarity scores | Phase 2 |
| `compute_iconic_scores.py` | Add new fields to all songs | Phase 3 |
| `assign_tiers.py` | Map scores to tiers | Phase 4 |

---

## Open Questions

1. **Thresholds for iconic lists?**
   - How many orchestras in "level 1"? (5? 10?)
   - How many singers per era?
   - How many titles in "superIconic"?

2. **Era handling for singers?**
   - Goyeneche is iconic but 1970s - different difficulty than Golden Age
   - Should era affect tier assignment?

3. **Weight tuning?**
   - Current: orch 40%, singer 30%, title 30%
   - Should instrumental songs weight orchestra higher?

4. **El-recodo validation?**
   - Use their popularity to validate our lists?
   - What if they disagree with our DJ data?

---

## Session History

### 2026-03-01
- Implemented Iconic Mode bypass (Tier 1 → use IconicLists.json)
- Installed TangoLink desktop app
- Processed 65 files: 24 matched (ERT), 41 unmatched
- Extracted ERT IDs to ert_extracted.json
- Created external_data_poc scripts for tango.info and el-recodo
- Designed multi-dimensional iconic model (orchestra + singer + title)
- Created implementation roadmap (6 phases)

---

## Immediate Next Steps

1. [ ] **Phase 1.1** - Extract iconic orchestras from ArtistMaster (level 1-2)
2. [ ] **Phase 1.2** - Extract iconic singers from SingerMaster
3. [ ] **Phase 1.3** - Extract iconic titles from IconicLists.json
4. [ ] Review and adjust lists with Toby
5. [ ] Build familiarity calculation scripts
