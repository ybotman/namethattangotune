# Metadata Research Request

I have MP3 files ripped from YouTube for a tango music quiz app. Several files have incomplete metadata (marked "unk"). Please research and provide the correct:
- **Orchestra** (ArtistMaster)
- **Year** (original recording year)
- **Singer** (or "instrumental" if none)
- **Style** (Tango/Vals/Milonga)

## Files Needing Research

### 1. Pugliese - Gallo Ciego - unk - unk
**YouTube search used:** `Pugliese Gallo Ciego 1948 original`
**Need:** Year, Singer (instrumental?)
**Expected:** Osvaldo Pugliese, 1948, instrumental

### 2. Troilo - Barrio de Tango - unk - Floreal Ruiz
**YouTube search used:** `Troilo Barrio de Tango Floreal Ruiz`
**Need:** Year
**Expected:** Anibal Troilo, ???, Floreal Ruiz

### 3. unk - Como Dos Extranos - unk - Raul Lavie
**YouTube search used:** `Raul Lavie Como Dos Extranos`
**Need:** Orchestra, Year
**Note:** "Como Dos Extraños" - famous tango, multiple recordings exist

### 4. unk - Sur - unk - Edmundo Rivero
**YouTube search used:** `Edmundo Rivero Sur tango`
**Need:** Orchestra, Year
**Note:** Sur recorded by multiple orchestras - need the Rivero version

### 5. unk - La Cumparsita - unk - unk
**YouTube search used:** Unknown
**Need:** Orchestra, Year, Singer
**Note:** Most recorded tango ever - need to identify which version this is (likely delete and re-rip with specific version)

### 6. Garello - Sin Palabras - unk - Roberto Rufino
**YouTube search used:** `Garello Sin Palabras Roberto Rufino`
**Need:** Year
**Expected:** Raul Garello, ???, Roberto Rufino

### 7. Canaro - La Cumparsita - 1924 - unk
**Need:** Singer confirmation
**Expected:** Francisco Canaro, 1924, instrumental (confirm)

### 8. DArienzo - Rawson - 1936 - unk
**Need:** Singer confirmation
**Expected:** Juan D'Arienzo, 1936, instrumental (confirm)

### 9. Firpo - El Cencerro - 1949 - unk
**Need:** Singer confirmation
**Expected:** Roberto Firpo, 1949, instrumental (confirm)

---

## Gardel Songs (Separate Decision)

These are Carlos Gardel recordings. Research says Gardel songs are **not typically played at milongas** (social dancing) because they're concert/listening tango. Should we:
- A) Include them in a separate "Concert Tango" category
- B) Skip them for now

| File | Year | Notes |
|------|------|-------|
| unk - El Dia Que Me Quieras - 1935 - Carlos Gardel | 1935 | Movie soundtrack |
| unk - Mi Noche Triste - 1930 - Carlos Gardel | 1930 | Historic first tango canción |
| unk - Pobre Paica - 1920 - Carlos Gardel | 1920 | Early Gardel |
| unk - Volver - 1935 - Carlos Gardel | 1935 | Iconic Gardel |

---

## DELETE (Album file)

- `Castillo - Grandes Exitos - unk - Alberto Castillo.mp3` (40MB) - This is a full album, not a single song. Delete.

---

## Output Format Requested

Please provide a JSON array with corrected metadata:

```json
[
  {
    "originalFile": "Pugliese - Gallo Ciego - unk - unk.mp3",
    "newFile": "Osvaldo Pugliese - Gallo Ciego - 1948 - instrumental.mp3",
    "orchestra": "Osvaldo Pugliese",
    "title": "Gallo Ciego",
    "year": "1948",
    "singer": null,
    "style": "Tango",
    "source": "todotango.com / tango.info"
  }
]
```
