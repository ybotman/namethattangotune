# Old Guard Rip Instructions

## Task
Rip ~96 Old Guard tango songs from YouTube/Archive.org using yt-dlp.

## Folder Structure
```
~/tunes/tango/MusicRips/
├── oldguard/
│   ├── primitivo/      # 1895-1910 (8 songs)
│   ├── guardia_vieja/  # 1910-1928 (43 songs)
│   ├── gardel/         # 1917-1935 (12 songs)
│   ├── guardia_nueva/  # 1928-1935 (27 songs)
│   └── early_golden/   # 1935-1940 (6 songs)
```

## File Naming Convention
```
Orchestra - Title - Year - Singer.mp3
```
- Use "instrumental" if no singer
- Use full orchestra names (e.g., "Osvaldo Fresedo" not "Fresedo")
- Replace special characters: ñ→n, é→e, etc.

**Examples:**
```
Angel Villoldo - El Choclo - 1913 - instrumental.mp3
Eduardo Arolas - La Cachila - 1914 - instrumental.mp3
Carlos Gardel - Mi Noche Triste - 1917 - Carlos Gardel.mp3
Francisco Canaro - Milonga Sentimental - 1932 - Francisco Amor.mp3
```

## Setup Commands
```bash
mkdir -p ~/tunes/tango/MusicRips/oldguard/{primitivo,guardia_vieja,gardel,guardia_nueva,early_golden}
cd ~/tunes/tango/MusicRips/oldguard
```

## Priority Order
1. **HIGH VALUE** - Fill gaps in our DB
2. **DANCEABLE** - Guardia Nueva era
3. **HISTORICAL** - Primitivo/early recordings

---

## SECTION 1: HIGH PRIORITY - Gap Fillers

These songs are MISSING from our database:

```bash
cd ~/tunes/tango/MusicRips/oldguard/guardia_nueva

# El Espiante - Fresedo 1931 (MISSING from DB)
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Fresedo - El Espiante - 1931 - instrumental.%(ext)s" \
  "ytsearch1:Fresedo El Espiante 1931 78rpm"

# Julian - Donato 1933 (MISSING from DB)
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Edgardo Donato - Julian - 1933 - Romeo Gavioli.%(ext)s" \
  "ytsearch1:Edgardo Donato Julian 1933 Gavioli"
```

---

## SECTION 2: PRIMITIVO (1895-1910)

```bash
cd ~/tunes/tango/MusicRips/oldguard/primitivo

# Villoldo - The Father of Tango
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Angel Villoldo - El Choclo - 1913 - instrumental.%(ext)s" \
  "ytsearch1:Villoldo El Choclo 1913 original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Angel Villoldo - El Pimpolla - 1904 - instrumental.%(ext)s" \
  "ytsearch1:Villoldo El Pimpolla 78rpm"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Angel Villoldo - La Bicicleta - 1905 - instrumental.%(ext)s" \
  "ytsearch1:Villoldo La Bicicleta tango"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Angel Villoldo - Cuerpo de Alambre - 1905 - instrumental.%(ext)s" \
  "ytsearch1:Villoldo Cuerpo de Alambre"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Angel Villoldo - El Negro Alegre - 1907 - instrumental.%(ext)s" \
  "ytsearch1:Villoldo El Negro Alegre"
```

---

## SECTION 3: GUARDIA VIEJA (1910-1928)

```bash
cd ~/tunes/tango/MusicRips/oldguard/guardia_vieja

# Vicente Greco - First Orchestra
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Vicente Greco - Don Juan - 1910 - instrumental.%(ext)s" \
  "ytsearch1:Vicente Greco Don Juan 1910 first tango orchestra"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Vicente Greco - Ojos Negros - 1912 - instrumental.%(ext)s" \
  "ytsearch1:Vicente Greco Ojos Negros tango"

# Juan Maglio Pacho - Bandoneon Pioneer
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Juan Maglio Pacho - Rodriguez Pena - 1912 - instrumental.%(ext)s" \
  "ytsearch1:Pacho Rodriguez Pena tango 78rpm"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Juan Maglio Pacho - Comme Il Faut - 1913 - instrumental.%(ext)s" \
  "ytsearch1:Pacho Comme Il Faut 1913"

# Eduardo Arolas - El Tigre del Bandoneon
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Eduardo Arolas - La Cachila - 1914 - instrumental.%(ext)s" \
  "ytsearch1:Eduardo Arolas La Cachila original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Eduardo Arolas - Comme Il Faut - 1913 - instrumental.%(ext)s" \
  "ytsearch1:Arolas Comme Il Faut composer original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Eduardo Arolas - El Marne - 1914 - instrumental.%(ext)s" \
  "ytsearch1:Arolas El Marne 1914 original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Eduardo Arolas - Una Noche de Garufa - 1914 - instrumental.%(ext)s" \
  "ytsearch1:Arolas Una Noche de Garufa"

# Roberto Firpo - Piano Master
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Roberto Firpo - La Cumparsita - 1916 - instrumental.%(ext)s" \
  "ytsearch1:Firpo La Cumparsita 1916 first recording"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Roberto Firpo - El Amanecer - 1920 - instrumental.%(ext)s" \
  "ytsearch1:Roberto Firpo El Amanecer tango"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Roberto Firpo - Sentimiento Gaucho - 1921 - instrumental.%(ext)s" \
  "ytsearch1:Firpo Sentimiento Gaucho 1921"

# Francisco Canaro - Early Period
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Francisco Canaro - Organito de la Tarde - 1925 - instrumental.%(ext)s" \
  "ytsearch1:Canaro Organito de la Tarde 1925"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Francisco Canaro - El Cachafaz - 1922 - instrumental.%(ext)s" \
  "ytsearch1:Canaro El Cachafaz tango"

# Orquesta Tipica Victor
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Orquesta Tipica Victor - El Choclo - 1926 - instrumental.%(ext)s" \
  "ytsearch1:Orquesta Tipica Victor El Choclo 1926"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Orquesta Tipica Victor - La Cumparsita - 1927 - instrumental.%(ext)s" \
  "ytsearch1:Orquesta Tipica Victor La Cumparsita 1927"

# Julio De Caro
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Julio De Caro - Boedo - 1928 - instrumental.%(ext)s" \
  "ytsearch1:Julio De Caro Boedo 1928"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Julio De Caro - Mala Junta - 1927 - instrumental.%(ext)s" \
  "ytsearch1:Julio De Caro Mala Junta"
```

---

## SECTION 4: GARDEL

```bash
cd ~/tunes/tango/MusicRips/oldguard/gardel

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Mi Noche Triste - 1917 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Mi Noche Triste 1917 original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - El Choclo - 1930 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel El Choclo 1930"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Por Una Cabeza - 1935 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Por Una Cabeza 1935 original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Volver - 1935 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Volver 1935 original"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - El Dia Que Me Quieras - 1935 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel El Dia Que Me Quieras 1935"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Mi Buenos Aires Querido - 1934 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Mi Buenos Aires Querido 1934"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Silencio - 1932 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Silencio 1932"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Sus Ojos Se Cerraron - 1935 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Sus Ojos Se Cerraron"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Melodia de Arrabal - 1933 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Melodia de Arrabal"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Gardel - Cuesta Abajo - 1934 - Carlos Gardel.%(ext)s" \
  "ytsearch1:Gardel Cuesta Abajo"
```

---

## SECTION 5: GUARDIA NUEVA (1928-1935)

```bash
cd ~/tunes/tango/MusicRips/oldguard/guardia_nueva

# Fresedo
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Fresedo - Vida Mia - 1933 - Roberto Ray.%(ext)s" \
  "ytsearch1:Fresedo Vida Mia Roberto Ray 1933"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Fresedo - Sollozos - 1933 - Roberto Ray.%(ext)s" \
  "ytsearch1:Fresedo Sollozos Roberto Ray"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Fresedo - Chau Pinela - 1930 - instrumental.%(ext)s" \
  "ytsearch1:Fresedo Chau Pinela 1930"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Fresedo - Pampero - 1930 - instrumental.%(ext)s" \
  "ytsearch1:Fresedo Pampero 1930"

# Donato
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Edgardo Donato - A Media Luz - 1927 - instrumental.%(ext)s" \
  "ytsearch1:Edgardo Donato A Media Luz 1927 original composer"

yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Edgardo Donato - El Huracan - 1932 - instrumental.%(ext)s" \
  "ytsearch1:Donato El Huracan 1932"

# Canaro Milongas
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Francisco Canaro - Milonga Sentimental - 1932 - Francisco Amor.%(ext)s" \
  "ytsearch1:Canaro Milonga Sentimental Francisco Amor"

# Di Sarli Early
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Di Sarli - Chau Pinela - 1930 - instrumental.%(ext)s" \
  "ytsearch1:Di Sarli Chau Pinela 1930"
```

---

## SECTION 6: EARLY GOLDEN (1935-1940)

```bash
cd ~/tunes/tango/MusicRips/oldguard/early_golden

# Canaro transition
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Francisco Canaro - Poema - 1935 - Roberto Maida.%(ext)s" \
  "ytsearch1:Canaro Poema Roberto Maida 1935"
```

---

## After Ripping

1. Check file sizes (skip anything > 15MB - likely album)
2. Spot-check audio quality
3. Report back with count per folder

**Expected totals:**
- primitivo: ~5-8 files
- guardia_vieja: ~20-25 files
- gardel: ~10-12 files
- guardia_nueva: ~15-20 files
- early_golden: ~3-6 files
