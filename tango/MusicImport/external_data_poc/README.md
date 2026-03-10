# External Data POC

Proof of concept scripts for matching NTTT songs against external tango databases.

**See STATUS.md for current progress and next steps.**

## Scripts

| Script | Purpose |
|--------|---------|
| `match_tango_info.py` | Match songs against tango.info (open database) |
| `match_el_recodo.py` | Match songs against el-recodo.com (requires login for full data) |
| `fetch_tangolink.py` | Fetch TangoLink "Most Famous Tangos" curated list |
| `trickle_matcher.py` | **Main runner** - rate-limited background processing |

## Data Sources

### tango.info
- Open database, ~40,000 performances
- URL pattern: `https://tango.info/eng/search?q={query}`
- IDs: TINP (track identifier), Work ID
- No login required for basic data

### el-recodo.com
- Largest tango database, ~26,000 recordings
- URL pattern: `https://www.el-recodo.com/music?title={title}&O={orchestra}`
- Paid membership unlocks: danceability, popularity, BPM
- May need session cookies for full access

## Usage

```bash
# Test with sample songs
python run_matching.py --sample 10

# Full run (outputs to match_results.json)
python run_matching.py --all

# Single song test
python match_tango_info.py "La Cumparsita" "Juan D'Arienzo" 1951
```

## Output

```json
{
  "songId": "abc123",
  "title": "La Cumparsita",
  "orchestra": "Juan D'Arienzo",
  "year": 1951,
  "matches": {
    "tango_info": {
      "matched": true,
      "tinp": "T0370000024",
      "url": "https://tango.info/eng/T0370000024"
    },
    "el_recodo": {
      "matched": true,
      "recording_id": "12345",
      "danceability": null,
      "url": "https://el-recodo.com/music?id=12345"
    }
  }
}
```

## Rate Limiting

Both sites may rate-limit aggressive scraping. Scripts include:
- 1-2 second delays between requests
- Retry with exponential backoff
- Caching of results to avoid repeat lookups
