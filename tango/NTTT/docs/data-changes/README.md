# Data Changes Log

This directory contains a record of all data corrections and updates made to the NTTT song database.

## Standard Format

Each change is logged as a JSON file with the naming convention:
```
YYYY-MM-DD_description.json
```

## JSON Structure

```json
{
  "date": "2026-02-26",
  "timestamp": "2026-02-26 14:30:00",
  "description": "Brief description of what was changed",
  "changes": [
    {
      "file": "djSongsWeighted.json",
      "action": "update|add|delete",
      "count": 9,
      "songs": [
        {
          "songId": "uuid",
          "oldTitle": "original value",
          "newTitle": "new value",
          "orchestra": "value set"
        }
      ]
    },
    {
      "file": "ArtistMaster.json",
      "action": "add",
      "record": { ... }
    }
  ]
}
```

## Change Types

| Action | Description |
|--------|-------------|
| `add` | New record added |
| `update` | Existing record modified |
| `delete` | Record removed (marked DNU) |
| `merge` | Multiple records consolidated |

## Files That Can Be Changed

| File | Description |
|------|-------------|
| `djSongsWeighted.json` | Main song database (production) |
| `ArtistMaster.json` | Orchestra/artist mappings |
| `SingerMaster.json` | Singer mappings |
| `dataQualityIssues.json` | Issue tracker (status updates) |

## Log History

| Date | Description | Songs Affected |
|------|-------------|----------------|
| 2026-02-26 | Add Orquesta Romantica Milonguera | 9 |
| 2026-02-26 | Fix Romantica year format | 9 |
| 2026-02-26 | Remove accents from ArtistMaster | 5 |
| 2026-02-26 | Normalize Hyperion variations | 17 |
| 2026-02-26 | Fix Nina Miranda & Racciatti | 12 |
| 2026-02-26 | Mark reissues (7 true duplicates) | 7 |
| 2026-02-26 | Fix El Cachivache quinteto | 9 |
| 2026-02-26 | Fix Andariega variations | 35 |
| 2026-02-26 | Fix Zorros Grises | 19 |
| 2026-02-26 | Mark Bandonegro valid modern | 25 |
| 2026-02-26 | Mark Pablo Valle valid modern | 26 |
| 2026-02-26 | Add Otros Aires | 7 |
| 2026-02-26 | Mark Caceres valid modern | 3 |
| 2026-02-26 | Fix Chino Laborde / Solo Tango | 10 |
| 2026-02-26 | Fix Florindo Sassone years | 17 |
| 2026-02-26 | Fix Horacio Salgan | 14 |
| 2026-02-26 | **Sexteto Milonguero + Cristal valid** | **49** |
| 2026-02-26 | **Antonio Rodio: fix years 1943-44, add singers** | **15** |

---
*Compas - NTTT Data Quality*
