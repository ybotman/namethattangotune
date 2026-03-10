# Music Acquisition List

**Date:** 2026-02-27

---

## Part 1: Tango Canción Era (1960s-90s) - YouTube Rips

One iconic song per artist for testing:

| Artist | Song | Search Term |
|--------|------|-------------|
| Roberto Goyeneche | La última curda | `"Goyeneche La ultima curda"` |
| Roberto Goyeneche + Troilo | Sur | `"Troilo Goyeneche Sur 1968"` |
| Julio Sosa | Cambalache | `"Julio Sosa Cambalache"` |
| Edmundo Rivero | Cafetín de Buenos Aires | `"Edmundo Rivero Cafetin de Buenos Aires"` |
| Susana Rinaldi | Balada para un loco | `"Susana Rinaldi Balada para un loco"` |
| Raúl Lavié | Nostalgias | `"Raul Lavie Nostalgias"` |
| Rubén Juárez | Naranjo en flor | `"Ruben Juarez Naranjo en flor"` |
| Amelita Baltar | Chiquilín de Bachín | `"Amelita Baltar Chiquilin de Bachin"` |

### Rip Commands

```bash
# Install if needed
brew install yt-dlp

# Rip each (run from MusicImport folder)
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Goyeneche La ultima curda"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Troilo Goyeneche Sur 1968"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Julio Sosa Cambalache"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Edmundo Rivero Cafetin de Buenos Aires"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Susana Rinaldi Balada para un loco"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Raul Lavie Nostalgias"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Ruben Juarez Naranjo en flor"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "cancion_era/%(title)s.%(ext)s" "ytsearch1:Amelita Baltar Chiquilin de Bachin"
```

---

## Part 2: Public Domain (Pre-1927) - Archive.org

Legal, free downloads:

| Artist | Song | Archive.org Link |
|--------|------|------------------|
| Carlos Gardel | Mi noche triste (1917) | Search: `archive.org/search?query=gardel%20mi%20noche%20triste` |
| Carlos Gardel | Mano a mano (1923) | Search: `archive.org/search?query=gardel%20mano%20a%20mano` |
| Francisco Canaro | Sentimiento gaucho (1924) | Search: `archive.org/search?query=canaro%20sentimiento%20gaucho` |
| Francisco Canaro | La Cumparsita (1927) | Search: `archive.org/search?query=canaro%20cumparsita%201927` |
| Juan D'Arienzo | Early 78s | Search: `archive.org/search?query=d'arienzo%2078` |
| Roberto Firpo | La Cumparsita (1917) | Search: `archive.org/search?query=firpo%20cumparsita` |
| Orquesta Típica Victor | Various | Search: `archive.org/search?query=orquesta%20tipica%20victor` |

### Direct Collection Links

- **78rpm Tango Collection**: https://archive.org/details/78rpm_tango
- **Tango Argentino Collection**: https://archive.org/search?query=tango+argentino+78rpm
- **Gardel Collection**: https://archive.org/search?query=carlos+gardel

### Download Command (after finding URLs)

```bash
# Download from archive.org (get direct MP3 link first)
wget "https://archive.org/download/ITEM_ID/filename.mp3"
```

---

## Part 3: Gap Songs from Iconic Research

Critical missing songs to find:

| Song | Orchestra | Year | Source to Try |
|------|-----------|------|---------------|
| Café Dominguez | D'Agostino | 1955 | YouTube |
| Gallo Ciego | Pugliese | 1959 | YouTube |
| Por una cabeza | Gardel | 1935 | YouTube (famous) |
| El día que me quieras | Gardel | 1935 | YouTube (famous) |
| Volver | Gardel | 1935 | YouTube |
| Cascabelito | De Angelis | 1943 | YouTube |
| Nochero soy | Pugliese | 1962 | YouTube |

```bash
# Rip gap songs
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:D'Agostino Vargas Cafe Dominguez"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:Pugliese Gallo Ciego"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:Gardel Por una cabeza"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:Gardel El dia que me quieras"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:Gardel Volver 1935"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:De Angelis Cascabelito"
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "gaps/%(title)s.%(ext)s" "ytsearch1:Pugliese Nochero soy"
```

---

## Next Steps

1. [ ] Install yt-dlp: `brew install yt-dlp`
2. [ ] Create folders: `mkdir -p MusicImport/cancion_era MusicImport/gaps MusicImport/public_domain`
3. [ ] Run rip commands
4. [ ] Review quality
5. [ ] Run through MusicImport pipeline
6. [ ] Upload to Azure Blob
7. [ ] Update djSongs.json
