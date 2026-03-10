#!/bin/bash
# Gap Songs Download Script
# Run from: ~/tunes/tango/MusicRips/gaps/
#
# File naming: Orchestra - Title - Year - Singer.mp3
# Singer = "instrumental" if no vocalist

mkdir -p ~/tunes/tango/MusicRips/gaps
cd ~/tunes/tango/MusicRips/gaps

echo "=== CRITICAL PRIORITY ==="

# Gallo Ciego - Pugliese 1948 (CRITICAL)
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Pugliese - Gallo Ciego - 1948 - instrumental.%(ext)s" \
  "ytsearch1:Pugliese Gallo Ciego 1948 original"

echo "=== HIGH PRIORITY ==="

# El Marne - Troilo 1941
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Anibal Troilo - El Marne - 1941 - instrumental.%(ext)s" \
  "ytsearch1:Troilo El Marne 1941"

# Nochero Soy - Pugliese 1962 (Jorge Vidal)
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Pugliese - Nochero Soy - 1962 - Jorge Vidal.%(ext)s" \
  "ytsearch1:Pugliese Nochero Soy Jorge Vidal"

echo "=== MEDIUM PRIORITY ==="

# La Beba - Pugliese 1947
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Pugliese - La Beba - 1947 - instrumental.%(ext)s" \
  "ytsearch1:Pugliese La Beba 1947"

# Una Cancion - Troilo 1943 (Fiorentino)
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Anibal Troilo - Una Cancion - 1943 - Francisco Fiorentino.%(ext)s" \
  "ytsearch1:Troilo Una Cancion Fiorentino 1943"

# El Espiante - Fresedo 1947
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Fresedo - El Espiante - 1947 - instrumental.%(ext)s" \
  "ytsearch1:Fresedo El Espiante 1947"

# Julian - Donato 1933
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Edgardo Donato - Julian - 1933 - instrumental.%(ext)s" \
  "ytsearch1:Edgardo Donato Julian 1933 tango"

# Cafe Dominguez - D'Agostino 1955 (Vargas)
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Angel DAgostino - Cafe Dominguez - 1955 - Angel Vargas.%(ext)s" \
  "ytsearch1:D'Agostino Vargas Cafe Dominguez"

echo "=== LOW PRIORITY ==="

# Perpetuum Mobile - Pugliese 1961
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Osvaldo Pugliese - Perpetuum Mobile - 1961 - instrumental.%(ext)s" \
  "ytsearch1:Pugliese Perpetuum Mobile 1961"

# Paloma - Di Sarli 1954
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Di Sarli - Paloma - 1954 - instrumental.%(ext)s" \
  "ytsearch1:Di Sarli Paloma 1954 instrumental"

# A Fuego Lento - Di Sarli 1954
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Carlos Di Sarli - A Fuego Lento - 1954 - instrumental.%(ext)s" \
  "ytsearch1:Di Sarli A Fuego Lento instrumental"

# Noche de Reyes - Canaro
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "Francisco Canaro - Noche de Reyes - 1941 - instrumental.%(ext)s" \
  "ytsearch1:Canaro Noche de Reyes tango"

echo "=== DONE ==="
echo "Files saved to: ~/tunes/tango/MusicRips/gaps/"
ls -la
