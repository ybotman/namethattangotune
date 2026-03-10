# Music Import - Resolved Metadata

**Date:** 2026-02-27
**Status:** Ready for rename + import

---

## RESOLVED FILES

### File Renames (copy/paste to terminal)

```bash
cd ~/tunes/tango/MusicRips

# #1 - Gallo Ciego (HIGH confidence)
mv "Pugliese - Gallo Ciego - unk - unk.mp3" "Osvaldo Pugliese - Gallo Ciego - 1948 - instrumental.mp3"

# #2 - Barrio de Tango (MEDIUM confidence - 1944)
mv "Troilo - Barrio de Tango - unk - Floreal Ruiz.mp3" "Anibal Troilo - Barrio de Tango - 1944 - Floreal Ruiz.mp3"

# #4 - Sur (HIGH confidence)
mv "unk - Sur - unk - Edmundo Rivero.mp3" "Anibal Troilo - Sur - 1948 - Edmundo Rivero.mp3"

# #6 - Sin Palabras (MEDIUM confidence - ~1970)
mv "Garello - Sin Palabras - unk - Roberto Rufino.mp3" "Raul Garello - Sin Palabras - 1970 - Roberto Rufino.mp3"

# Gardel songs - mark as Cancion (keep for concert/listening mode)
# No rename needed, but tag as Cancion in JSON

# Already correct - just confirm:
# Canaro - La Cumparsita - 1924 - instrumental (confirm singer=null)
# DArienzo - Rawson - 1936 - instrumental (confirm singer=null)
# Firpo - El Cencerro - 1949 - instrumental (confirm singer=null)
```

---

## ACTION ITEMS

### DELETE
```bash
rm "~/tunes/tango/MusicRips/Castillo - Grandes Exitos - unk - Alberto Castillo.mp3"
rm "~/tunes/tango/MusicRips/unk - La Cumparsita - unk - unk.mp3"
```

### RE-RIP: La Cumparsita
Choose one:
- **D'Arienzo 1951** (recommended - definitive milonga closer)
- Rodriguez 1917 (original composer)
- Firpo 1916 (first recording)

```bash
# D'Arienzo 1951 version:
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Juan DArienzo - La Cumparsita - 1951 - instrumental.%(ext)s" \
  "ytsearch1:D'Arienzo La Cumparsita 1951"
```

### DECISION: Como Dos Extraños / Lavié
**Current:** Soloist recording (Raúl Lavié, post-Golden Age concert)
**Options:**
- A) **Keep as soloist** - tag orchestra=null, Cancion=true
- B) **Re-rip canonical dance version:** Pedro Laurenz / Juan Carlos Casas / 1940

```bash
# Option B - re-rip Laurenz version:
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Pedro Laurenz - Como Dos Extranos - 1940 - Juan Carlos Casas.%(ext)s" \
  "ytsearch1:Pedro Laurenz Como Dos Extranos 1940"
```

---

## FINAL METADATA (for djSongs.json import)

```json
[
  {
    "file": "Osvaldo Pugliese - Gallo Ciego - 1948 - instrumental.mp3",
    "orchestra": "Osvaldo Pugliese",
    "title": "Gallo Ciego",
    "year": "1948",
    "singer": null,
    "style": "Tango",
    "cancion": false,
    "notes": "Instrumental. Pugliese signature. Composer: Agustín Bardi."
  },
  {
    "file": "Anibal Troilo - Barrio de Tango - 1944 - Floreal Ruiz.mp3",
    "orchestra": "Anibal Troilo",
    "title": "Barrio de Tango",
    "year": "1944",
    "singer": "Floreal Ruiz",
    "style": "Tango",
    "cancion": false,
    "notes": "Composed 1942 (Manzi lyrics). Ruiz with Troilo 1944-45."
  },
  {
    "file": "Anibal Troilo - Sur - 1948 - Edmundo Rivero.mp3",
    "orchestra": "Anibal Troilo",
    "title": "Sur",
    "year": "1948",
    "singer": "Edmundo Rivero",
    "style": "Tango",
    "cancion": false,
    "notes": "Definitive canonical version. Composed 1948 (Homero Manzi)."
  },
  {
    "file": "Raul Garello - Sin Palabras - 1970 - Roberto Rufino.mp3",
    "orchestra": "Raul Garello",
    "title": "Sin Palabras",
    "year": "1970",
    "singer": "Roberto Rufino",
    "style": "Tango",
    "cancion": true,
    "notes": "Post-Golden Age. Composed by Mariano Mores."
  },
  {
    "file": "Francisco Canaro - La Cumparsita - 1924 - instrumental.mp3",
    "orchestra": "Francisco Canaro",
    "title": "La Cumparsita",
    "year": "1924",
    "singer": null,
    "style": "Tango",
    "cancion": false,
    "notes": "Early Canaro recording."
  },
  {
    "file": "Juan DArienzo - Rawson - 1936 - instrumental.mp3",
    "orchestra": "Juan D'Arienzo",
    "title": "Rawson",
    "year": "1936",
    "singer": null,
    "style": "Tango",
    "cancion": false,
    "notes": "Early D'Arienzo."
  },
  {
    "file": "Roberto Firpo - El Cencerro - 1949 - instrumental.mp3",
    "orchestra": "Roberto Firpo",
    "title": "El Cencerro",
    "year": "1949",
    "singer": null,
    "style": "Tango",
    "cancion": false,
    "notes": "Late Firpo recording."
  },
  {
    "file": "Astor Piazzolla - Balada Para Un Loco - 1969 - Amelita Baltar.mp3",
    "orchestra": "Astor Piazzolla",
    "title": "Balada Para Un Loco",
    "year": "1969",
    "singer": "Amelita Baltar",
    "style": "Tango",
    "cancion": true,
    "notes": "Nuevo tango. Concert/listening."
  },
  {
    "file": "Astor Piazzolla - La Ultima Curda - 1969 - Roberto Goyeneche.mp3",
    "orchestra": "Astor Piazzolla",
    "title": "La Ultima Curda",
    "year": "1969",
    "singer": "Roberto Goyeneche",
    "style": "Tango",
    "cancion": true,
    "notes": "Nuevo tango. Concert/listening."
  },
  {
    "file": "Armando Pontier - Cambalache - 1961 - Julio Sosa.mp3",
    "orchestra": "Armando Pontier",
    "title": "Cambalache",
    "year": "1961",
    "singer": "Julio Sosa",
    "style": "Tango",
    "cancion": true,
    "notes": "El Varón del Tango. Concert era."
  },
  {
    "file": "Angel DAgostino - Cafe Dominguez - 1941 - Angel Vargas.mp3",
    "orchestra": "Angel D'Agostino",
    "title": "Cafe Dominguez",
    "year": "1941",
    "singer": "Angel Vargas",
    "style": "Tango",
    "cancion": false,
    "notes": "D'Agostino/Vargas classic."
  }
]
```

---

## GARDEL SONGS (Mark as Cancion)

```json
[
  {
    "file": "Carlos Gardel - El Dia Que Me Quieras - 1935.mp3",
    "orchestra": "Carlos Gardel",
    "title": "El Dia Que Me Quieras",
    "year": "1935",
    "singer": "Carlos Gardel",
    "style": "Tango",
    "cancion": true,
    "notes": "Movie soundtrack. Concert, not milonga."
  },
  {
    "file": "Carlos Gardel - Mi Noche Triste - 1930.mp3",
    "orchestra": "Carlos Gardel",
    "title": "Mi Noche Triste",
    "year": "1930",
    "singer": "Carlos Gardel",
    "style": "Tango",
    "cancion": true,
    "notes": "Historic first tango canción."
  },
  {
    "file": "Carlos Gardel - Pobre Paica - 1920.mp3",
    "orchestra": "Carlos Gardel",
    "title": "Pobre Paica",
    "year": "1920",
    "singer": "Carlos Gardel",
    "style": "Tango",
    "cancion": true,
    "notes": "Early Gardel."
  },
  {
    "file": "Carlos Gardel - Volver - 1935.mp3",
    "orchestra": "Carlos Gardel",
    "title": "Volver",
    "year": "1935",
    "singer": "Carlos Gardel",
    "style": "Tango",
    "cancion": true,
    "notes": "Iconic Gardel. Concert, not milonga."
  }
]
```

---

## SUMMARY

| Status | Count |
|--------|-------|
| Ready to import | 11 |
| Need rename first | 4 |
| Delete | 2 |
| Re-rip (La Cumparsita) | 1 |
| Decision needed (Lavié) | 1 |
| Gardel (Cancion) | 4 |

**gaps/ folder:** 11 files already correctly named ✅
