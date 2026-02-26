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

---
*Compas - NTTT Data Quality*
