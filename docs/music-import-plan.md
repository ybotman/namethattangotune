# Music Import Plan

**Date:** 2026-02-27
**Total Files:** 29 MP3s across 2 folders

---

## Folder Analysis

### ~/tunes/tango/MusicRips/ (18 files)

| File | Size | Orchestra | Title | Year | Singer | Status |
|------|------|-----------|-------|------|--------|--------|
| Canaro - La Cumparsita - 1924 - unk.mp3 | 4.9MB | Francisco Canaro | La Cumparsita | 1924 | instrumental | ✅ Good |
| DArienzo - Rawson - 1936 - unk.mp3 | 6.9MB | Juan D'Arienzo | Rawson | 1936 | instrumental | ✅ Good |
| DAgostino - Cafe Dominguez - 1941 - Angel Vargas.mp3 | 3.9MB | Angel D'Agostino | Cafe Dominguez | 1941 | Angel Vargas | ✅ Good |
| Firpo - El Cencerro - 1949 - unk.mp3 | 4.2MB | Roberto Firpo | El Cencerro | 1949 | instrumental | ✅ Good |
| Piazzolla - Balada Para Un Loco - 1969 - Amelita Baltar.mp3 | 8.6MB | Astor Piazzolla | Balada Para Un Loco | 1969 | Amelita Baltar | ✅ Canción |
| Piazzolla - La Ultima Curda - 1969 - Roberto Goyeneche.mp3 | 5.6MB | Astor Piazzolla | La Ultima Curda | 1969 | Roberto Goyeneche | ✅ Canción |
| Pontier - Cambalache - 1961 - Julio Sosa.mp3 | 6.6MB | Armando Pontier | Cambalache | 1961 | Julio Sosa | ✅ Canción |
| Pugliese - Gallo Ciego - unk - unk.mp3 | 6.5MB | Osvaldo Pugliese | Gallo Ciego | ~1948 | instrumental | ⚠️ Needs year |
| Troilo - Barrio de Tango - unk - Floreal Ruiz.mp3 | 4.0MB | Anibal Troilo | Barrio de Tango | ~1942 | Floreal Ruiz | ⚠️ Needs year |
| Garello - Sin Palabras - unk - Roberto Rufino.mp3 | 5.3MB | Raul Garello | Sin Palabras | ~1970 | Roberto Rufino | ⚠️ Needs year |
| unk - Como Dos Extranos - unk - Raul Lavie.mp3 | 5.4MB | ??? | Como Dos Extraños | ~1980 | Raul Lavie | ⚠️ Needs orchestra |
| unk - Sur - unk - Edmundo Rivero.mp3 | 4.9MB | ??? | Sur | ~1950 | Edmundo Rivero | ⚠️ Needs orchestra |
| unk - La Cumparsita - unk - unk.mp3 | 7.4MB | ??? | La Cumparsita | ??? | ??? | ⚠️ Needs all |
| **Castillo - Grandes Exitos - unk - Alberto Castillo.mp3** | **40MB** | ??? | Grandes Exitos | ??? | Alberto Castillo | ❌ ALBUM - Skip |

**Gardel (concert, not milonga):**
| unk - El Dia Que Me Quieras - 1935 - Carlos Gardel.mp3 | 3.5MB | Carlos Gardel | El Dia Que Me Quieras | 1935 | Carlos Gardel | ⚠️ Concert |
| unk - Mi Noche Triste - 1930 - Carlos Gardel.mp3 | 5.9MB | Carlos Gardel | Mi Noche Triste | 1930 | Carlos Gardel | ⚠️ Concert |
| unk - Pobre Paica - 1920 - Carlos Gardel.mp3 | 4.1MB | Carlos Gardel | Pobre Paica | 1920 | Carlos Gardel | ⚠️ Concert |
| unk - Volver - 1935 - Carlos Gardel.mp3 | 5.3MB | Carlos Gardel | Volver | 1935 | Carlos Gardel | ⚠️ Concert |

### ~/tunes/tango/MusicRips/gaps/ (11 files)

| File | Size | Status |
|------|------|--------|
| Osvaldo Pugliese - Gallo Ciego - 1948 - instrumental.mp3 | 4.2MB | ✅ Perfect |
| Anibal Troilo - El Marne - 1941 - instrumental.mp3 | 4.1MB | ✅ Perfect |
| Osvaldo Pugliese - Nochero Soy - 1962 - Jorge Vidal.mp3 | 3.4MB | ✅ Perfect |
| Osvaldo Pugliese - La Beba - 1947 - instrumental.mp3 | 5.0MB | ✅ Perfect |
| Osvaldo Fresedo - El Espiante - 1947 - instrumental.mp3 | 3.5MB | ✅ Perfect |
| Edgardo Donato - Julian - 1933 - instrumental.mp3 | 3.9MB | ✅ Perfect |
| Angel DAgostino - Cafe Dominguez - 1955 - Angel Vargas.mp3 | 3.9MB | ✅ Perfect |
| Carlos Di Sarli - Paloma - 1954 - instrumental.mp3 | 2.7MB | ✅ Perfect |
| Francisco Canaro - Noche de Reyes - 1941 - instrumental.mp3 | 4.1MB | ✅ Perfect |
| **Anibal Troilo - Una Cancion - 1943 - Francisco Fiorentino.mp3** | **35MB** | ❌ ALBUM? Check |
| **Carlos Di Sarli - A Fuego Lento - 1954 - instrumental.mp3** | **17MB** | ❌ ALBUM? Check |

---

## Issues to Fix

### 1. Oversized Files (likely albums)
- `Castillo - Grandes Exitos - unk - Alberto Castillo.mp3` (40MB) → DELETE
- `Anibal Troilo - Una Cancion - 1943 - Francisco Fiorentino.mp3` (35MB) → RE-RIP
- `Carlos Di Sarli - A Fuego Lento - 1954 - instrumental.mp3` (17MB) → RE-RIP

### 2. Missing Metadata
| File | Fix |
|------|-----|
| Pugliese - Gallo Ciego - unk | Year = 1948 |
| Troilo - Barrio de Tango - unk | Year = 1942 |
| Garello - Sin Palabras - unk | Year = ~1970 |
| unk - Como Dos Extranos | Orchestra = Pedro Laurenz, Year = 1944 |
| unk - Sur | Orchestra = Anibal Troilo, Year = 1948 |
| unk - La Cumparsita | Needs investigation |

### 3. Duplicate
- `DAgostino - Cafe Dominguez` appears in both folders (different years: 1941 vs 1955)

### 4. Gardel Decision
Research says Gardel songs are **not played at milongas**. Options:
- A) Keep for "Concert/Listening" mode (future feature)
- B) Skip for now

---

## Import Pipeline

### Step 1: Clean Up
```bash
# Delete oversized files
rm "~/tunes/tango/MusicRips/Castillo - Grandes Exitos - unk - Alberto Castillo.mp3"

# Check audio length of suspicious files
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "FILE.mp3"
```

### Step 2: Rename Files with Correct Metadata
```bash
# Example fixes
mv "Pugliese - Gallo Ciego - unk - unk.mp3" "Osvaldo Pugliese - Gallo Ciego - 1948 - instrumental.mp3"
mv "unk - Sur - unk - Edmundo Rivero.mp3" "Anibal Troilo - Sur - 1948 - Edmundo Rivero.mp3"
```

### Step 3: Generate SongIDs
```bash
# Use existing MusicImport/tools or create new script
# SongID = UUID based on title+orchestra+year hash
```

### Step 4: Upload to Azure Blob
```bash
# Upload to v20 container
az storage blob upload-batch --source ~/tunes/tango/MusicRips/gaps/ --destination v20
```

### Step 5: Update djSongs.json
- Add new entries with all metadata
- Set recognitionTier = 1 for iconic songs
- Add to IconicLists.json

---

## Priority Order

1. **gaps/ folder first** - These are the critical iconic songs
2. **Canción era** - Goyeneche, Sosa, etc. (separate category)
3. **Public domain** - Old Guard (when ready)
4. **Gardel** - Decide later

---

## Next Steps

1. [ ] Delete/re-rip oversized files
2. [ ] Fix filenames with correct metadata
3. [ ] Create import script to parse filenames → JSON
4. [ ] Generate SongIDs
5. [ ] Upload to Azure
6. [ ] Update djSongs.json
7. [ ] Wire up IconicMaster.json in code
