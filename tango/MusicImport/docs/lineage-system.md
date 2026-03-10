# Song Lineage Tracking System

## Overview

Every song in the NTTT database should have lineage fields tracking where the audio file came from. This enables:
- Knowing which DJ contributed songs
- Tracking YouTube rips vs purchased/ripped CDs
- Auditing and quality control
- Future re-imports if needed

---

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Source` | string | Yes | Primary source method/batch |
| `Source2` | string | Yes | Secondary detail (contributor/platform) |

### Source Values

| Value | When to Use |
|-------|-------------|
| `Mixxx` | Original import from Mixxx DJ library |
| `AI-GAP-Analysis-YYYY-MM-DD` | Gap analysis imports (YouTube rips to fill missing songs) |
| `Manual-Import` | Hand-added songs outside normal pipeline |
| `DJ-Import-{Name}-YYYY-MM-DD` | Batch import from another DJ's collection |

### Source2 Values

| Value | Description |
|-------|-------------|
| `TobyLibrary` | Toby's personal tango collection |
| `BorisH` | Boris H's shared collection (Azriel-BorisH folder) |
| `YouTube` | Ripped from YouTube |
| `ToTango-DJ` | ToTango DJ compilation sets |
| `GoldenEar` | Golden Ear Editions (high quality transfers) |
| `TangoTunes` | TangoTunes commercial downloads |
| `BibleTango` | BibleTango collection |
| `TangoDJ` | TangoDJ.com downloads |
| `TickledTangos` | Tickled Tangos collection |
| `TangoCollection` | Generic tango collection folders |
| `Rip` | CD rips (unspecified source) |
| `Cortinas` | Cortina/non-tango music |
| `Unknown` | Source could not be determined |

---

## Adding Lineage to New Imports

### For import_new_songs.py

When importing new songs, set lineage based on how they were acquired:

```python
# Example: YouTube gap analysis import
song['Source'] = f'AI-GAP-Analysis-{datetime.now().strftime("%Y-%m-%d")}'
song['Source2'] = 'YouTube'

# Example: Import from another DJ
song['Source'] = f'DJ-Import-JohnDoe-{datetime.now().strftime("%Y-%m-%d")}'
song['Source2'] = 'JohnDoe'
```

### For merge_to_weighted.py / merge_new_songs.py

When merging new songs into the main database, **preserve lineage fields**:

```python
# Copy lineage from source record
merged_song['Source'] = new_song.get('Source', 'Unknown')
merged_song['Source2'] = new_song.get('Source2', 'Unknown')
```

---

## Backfilling Existing Songs

Use `add_lineage.py` to add lineage to existing songs:

```bash
cd /Users/tobybalsley/MyDocs/AppDev/tunes/tango/MusicImport

# Preview changes
python3 add_lineage.py --dry-run

# Apply changes
python3 add_lineage.py

# Review output
# Creates: djSongs_with_lineage.json
# Updates: new_songs_import.json

# If satisfied, replace production file
cp djSongs_with_lineage.json djSongs.json
```

---

## Detection Logic

The `add_lineage.py` script detects Source2 from file paths using these patterns:

| Pattern | Source2 |
|---------|---------|
| `azriel-boris`, `borish` | BorisH |
| `golden-ear`, `goldear` | GoldenEar |
| `totango` | ToTango-DJ |
| `youtube` | YouTube |
| `rip` | Rip |
| `bibletango` | BibleTango |
| `tango-dj` | TangoDJ |
| `tangotunes` | TangoTunes |
| `tickled-tangos` | TickledTangos |
| `tangos con`, `tangos instrumentales` | TangoCollection |
| `mixxx/cortina` | Cortinas |
| Default (music folder) | TobyLibrary |

---

## Example Records

### Original Mixxx Import
```json
{
  "SongID": "abc123",
  "Title": "La Cumparsita",
  "Orchestra": "Juan D'Arienzo",
  "Source": "Mixxx",
  "Source2": "TobyLibrary"
}
```

### Boris Contribution
```json
{
  "SongID": "def456",
  "Title": "El Marne",
  "Orchestra": "Anibal Troilo",
  "Source": "Mixxx",
  "Source2": "BorisH"
}
```

### YouTube Gap Fill
```json
{
  "SongID": "ghi789",
  "Title": "Gallo Ciego",
  "Orchestra": "Osvaldo Pugliese",
  "Source": "AI-GAP-Analysis-2026-02-27",
  "Source2": "YouTube"
}
```

---

## Maintenance

### Adding New Source2 Values

1. Add pattern to `SOURCE2_PATTERNS` in `add_lineage.py`
2. Document in this file
3. Re-run backfill if needed

### Querying by Source

```python
# Find all Boris songs
boris_songs = [s for s in songs if s.get('Source2') == 'BorisH']

# Find all YouTube rips
youtube_songs = [s for s in songs if s.get('Source2') == 'YouTube']

# Find songs from a specific import batch
gap_songs = [s for s in songs if 'AI-GAP-Analysis' in s.get('Source', '')]
```

---

*Created: 2026-03-10*
*System: NTTT MusicImport*
