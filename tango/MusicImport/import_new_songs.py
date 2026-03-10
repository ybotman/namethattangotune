#!/usr/bin/env python3
"""
Import new MP3s from MusicRips folder into djSongs.json
Filename format: Orchestra - Title - Year - Singer.mp3

Enhanced with Era, Cancion, Concert fields and special handling for:
- Gardel (solo vocalist, Cancion=true)
- Piazzolla (Concert=true if instrumental)
- Solo vocalists (Lavie, Rivero, Sosa) - Cancion=true
- Old Guard (pre-1935) - Tier 4-5
"""

import json
import uuid
import os
import re
from pathlib import Path
from datetime import datetime

# Configuration
MUSIC_RIPS_DIR = os.path.expanduser("~/tunes/tango/MusicRips")
OUTPUT_JSON = "new_songs_import.json"
AZURE_CONTAINER = "v20"
AZURE_BASE_URL = "https://nttt.blob.core.windows.net/v20"

# Directory configuration for scanning
DIRECTORIES = [
    (MUSIC_RIPS_DIR, "main"),
    (os.path.join(MUSIC_RIPS_DIR, "gaps"), "gaps"),
    (os.path.join(MUSIC_RIPS_DIR, "oldguard/primitivo"), "primitivo"),
    (os.path.join(MUSIC_RIPS_DIR, "oldguard/guardia_vieja"), "guardia_vieja"),
    (os.path.join(MUSIC_RIPS_DIR, "oldguard/guardia_nueva"), "guardia_nueva"),
    (os.path.join(MUSIC_RIPS_DIR, "oldguard/gardel"), "gardel"),
    (os.path.join(MUSIC_RIPS_DIR, "oldguard/early_golden"), "early_golden"),
]

# Solo vocalists (no orchestra, use singer as artist)
SOLO_VOCALISTS = ["carlos gardel", "raul lavie", "edmundo rivero", "julio sosa"]

# Cancion-era artists (post-1960 vocal style)
CANCION_ARTISTS = ["raul garello", "armando pontier", "carlos gardel", "raul lavie"]


def generate_song_id(orchestra, title, year):
    """Generate deterministic UUID5 based on orchestra::title::year"""
    namespace = uuid.NAMESPACE_DNS
    input_string = f"{orchestra}::{title}::{year}"
    return str(uuid.uuid5(namespace, input_string))


def parse_filename(filename):
    """
    Parse filename in format: Orchestra - Title - Year - Singer.mp3
    Returns dict or None if invalid
    """
    # Remove .mp3 extension
    name = filename.replace('.mp3', '').replace('.MP3', '')

    # Split by ' - '
    parts = [p.strip() for p in name.split(' - ')]

    if len(parts) < 3:
        print(f"  Warning: Skipping (not enough parts): {filename}")
        return None

    orchestra = parts[0]
    title = parts[1]
    year = parts[2] if len(parts) > 2 else ""
    singer = parts[3] if len(parts) > 3 else ""

    # Handle "unk" values
    if orchestra.lower() == "unk":
        orchestra = ""
    if year.lower() == "unk":
        year = ""
    if singer.lower() == "unk" or singer.lower() == "instrumental":
        singer = ""

    # Fix common orchestra name issues
    orchestra = fix_orchestra_name(orchestra)

    return {
        "orchestra": orchestra,
        "title": title,
        "year": year,
        "singer": singer,
        "original_filename": filename
    }


def fix_orchestra_name(name):
    """Normalize orchestra names to match ArtistMaster"""
    fixes = {
        "DAgostino": "Angel D'Agostino",
        "DArienzo": "Juan D'Arienzo",
        "Canaro": "Francisco Canaro",
        "Pugliese": "Osvaldo Pugliese",
        "Troilo": "Anibal Troilo",
        "Firpo": "Roberto Firpo",
        "Piazzolla": "Astor Piazzolla",
        "Pontier": "Armando Pontier",
        "Garello": "Raul Garello",
        "Di Sarli": "Carlos Di Sarli",
        "Fresedo": "Osvaldo Fresedo",
        "Donato": "Edgardo Donato",
        "Villoldo": "Angel Villoldo",
        "Greco": "Vicente Greco",
        "Arolas": "Eduardo Arolas",
        "Maglio Pacho": "Juan Maglio",
        "Juan Maglio Pacho": "Juan Maglio",
        "Orquesta Tipica Victor": "Orquesta Típica Victor",
    }

    for short, full in fixes.items():
        if short.lower() in name.lower():
            return full
    return name


def determine_era(year_str, source_dir):
    """
    Determine the tango era based on year and source directory.
    Returns: primitivo, guardia_vieja, guardia_nueva, golden_age, decline, cancion, or unknown
    """
    # Use source directory as hint
    if source_dir == "primitivo":
        return "primitivo"
    elif source_dir == "guardia_vieja":
        return "guardia_vieja"
    elif source_dir == "guardia_nueva":
        return "guardia_nueva"
    elif source_dir == "gardel":
        return "cancion"  # Gardel is cancion, not an era
    elif source_dir == "early_golden":
        return "golden_age"

    # Fall back to year-based detection
    if year_str and year_str.isdigit():
        year = int(year_str)
        if year < 1910:
            return "primitivo"
        elif year < 1920:
            return "guardia_vieja"
        elif year < 1935:
            return "guardia_nueva"
        elif year < 1955:
            return "golden_age"
        elif year < 1980:
            return "decline"
        else:
            return "renaissance"

    return "unknown"


def determine_cancion(orchestra, singer, year_str, source_dir):
    """
    Determine if song is Cancion style (post-Golden Age vocal).
    Returns "true" or "false"
    """
    orch_lower = orchestra.lower() if orchestra else ""
    singer_lower = singer.lower() if singer else ""

    # Gardel is always cancion
    if "gardel" in orch_lower or "gardel" in singer_lower:
        return "true"

    # Solo vocalists are cancion
    for vocalist in SOLO_VOCALISTS:
        if vocalist in orch_lower or vocalist in singer_lower:
            return "true"

    # Cancion-era artists with singers
    if singer and any(artist in orch_lower for artist in CANCION_ARTISTS):
        return "true"

    # Post-1960 with singer
    if year_str and year_str.isdigit():
        year = int(year_str)
        if year >= 1960 and singer:
            return "true"

    return "false"


def determine_concert(orchestra, singer, year_str):
    """
    Determine if song is Concert (not classically danceable).
    Returns "true" or "false"
    """
    orch_lower = orchestra.lower() if orchestra else ""

    # Piazzolla instrumental is concert
    if "piazzolla" in orch_lower and not singer:
        return "true"

    return "false"


def create_song_entry(parsed, source_dir):
    """Create a djSongs.json entry from parsed filename"""
    orchestra = parsed["orchestra"]
    singer = parsed["singer"]
    year = parsed["year"]

    # Special handling for solo vocalists (no orchestra)
    artist_master = orchestra
    if not orchestra:
        # Use singer as artist for solo vocalists
        if singer and singer.lower() in [v.split()[-1] for v in SOLO_VOCALISTS]:
            artist_master = singer

    # For Gardel in oldguard/gardel folder, orchestra IS Gardel
    if source_dir == "gardel":
        orchestra = "Carlos Gardel"
        artist_master = "Carlos Gardel"

    song_id = generate_song_id(
        orchestra or artist_master or "Unknown",
        parsed["title"],
        year or "0000"
    )

    # Determine if instrumental
    has_singer = bool(singer)

    # Determine style (default Tango, could be smarter)
    style = "Tango"
    title_lower = parsed["title"].lower()
    if "vals" in title_lower or "waltz" in title_lower:
        style = "Vals"
    elif "milonga" in title_lower:
        style = "Milonga"

    # Determine flags
    era = determine_era(year, source_dir)
    cancion = determine_cancion(orchestra, singer, year, source_dir)
    concert = determine_concert(orchestra, singer, year)

    # For cancion songs without orchestra, clear ArtistMaster for quiz exclusion
    if cancion == "true" and not orchestra:
        artist_master = ""  # Will be excluded from orchestra quiz (requireOrchestra)

    return {
        "SongID": song_id,
        "Title": parsed["title"],
        "Orchestra": orchestra,
        "ArtistMaster": artist_master,
        "AudioUrl": f"{AZURE_BASE_URL}/{song_id}.mp3",
        "Composer": "",
        "Year": year,
        "Style": style,
        "Alternative": "false",
        "Candombe": "false",
        "Cancion": cancion,
        "Concert": concert,
        "Era": era,
        "Singer": singer,
        "Rating": 4,  # Default to 4 stars for curated songs
        "TimesPlayed": 0,
        "HasSinger": has_singer,
        "doNotPlay": False,
        "dnpReason": None,
        "dnpNotes": None,
        "_source": "MusicRips import",
        "_originalFile": parsed["original_filename"],
        "_sourceDir": source_dir,
        "_importDate": datetime.now().isoformat()
    }


def scan_directory(directory, label):
    """Scan a directory for MP3 files"""
    songs = []
    skipped = []

    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return songs, skipped

    print(f"\n=== Scanning {label}: {directory} ===")

    for filename in sorted(os.listdir(directory)):
        if not filename.endswith('.mp3') and not filename.endswith('.MP3'):
            continue

        filepath = os.path.join(directory, filename)

        # Skip directories
        if os.path.isdir(filepath):
            continue

        filesize = os.path.getsize(filepath) / (1024 * 1024)  # MB

        # Skip oversized files (likely albums)
        if filesize > 15:
            print(f"  Warning: Skipping (too large: {filesize:.1f}MB): {filename}")
            skipped.append({"file": filename, "reason": f"Too large: {filesize:.1f}MB"})
            continue

        parsed = parse_filename(filename)
        if not parsed:
            skipped.append({"file": filename, "reason": "Parse failed"})
            continue

        entry = create_song_entry(parsed, label)
        songs.append(entry)

        # Show flags
        flags = []
        if entry["Cancion"] == "true":
            flags.append("CANCION")
        if entry["Concert"] == "true":
            flags.append("CONCERT")
        flag_str = f" [{', '.join(flags)}]" if flags else ""

        print(f"  OK: {entry['ArtistMaster'] or entry['Singer']} - {parsed['title']} ({parsed['year']}) Era:{entry['Era']}{flag_str}")

    return songs, skipped


def main():
    print("=" * 60)
    print("NTTT Music Import Script (Enhanced)")
    print("=" * 60)

    all_songs = []
    all_skipped = []

    # Scan all configured directories
    for directory, label in DIRECTORIES:
        songs, skipped = scan_directory(directory, label)
        all_songs.extend(songs)
        all_skipped.extend(skipped)

    # Summary by era
    era_counts = {}
    for song in all_songs:
        era = song.get("Era", "unknown")
        era_counts[era] = era_counts.get(era, 0) + 1

    cancion_count = sum(1 for s in all_songs if s.get("Cancion") == "true")
    concert_count = sum(1 for s in all_songs if s.get("Concert") == "true")

    # Save results
    output = {
        "generated": datetime.now().isoformat(),
        "totalSongs": len(all_songs),
        "totalSkipped": len(all_skipped),
        "azureContainer": AZURE_CONTAINER,
        "summary": {
            "byEra": era_counts,
            "cancionCount": cancion_count,
            "concertCount": concert_count
        },
        "songs": all_songs,
        "skipped": all_skipped
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"=== Summary ===")
    print(f"{'=' * 60}")
    print(f"Songs to import: {len(all_songs)}")
    print(f"Skipped: {len(all_skipped)}")
    print(f"\nBy Era:")
    for era, count in sorted(era_counts.items()):
        print(f"  {era}: {count}")
    print(f"\nCancion songs: {cancion_count}")
    print(f"Concert songs: {concert_count}")
    print(f"\nOutput saved to: {OUTPUT_JSON}")

    # Generate upload script
    upload_script = "upload_to_azure.sh"
    with open(upload_script, 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("# Auto-generated Azure upload commands\n\n")
        for song in all_songs:
            src_dir = song["_sourceDir"]
            # Map source dir to actual path
            dir_map = {d[1]: d[0] for d in DIRECTORIES}
            src_path = os.path.join(dir_map.get(src_dir, MUSIC_RIPS_DIR), song["_originalFile"])
            f.write(f'az storage blob upload --account-name nttt --container-name {AZURE_CONTAINER} ')
            f.write(f'--file "{src_path}" --name "{song["SongID"]}.mp3"\n')

    print(f"\nUpload script saved to: {upload_script}")
    print(f"Run: chmod +x {upload_script} && ./{upload_script}")


if __name__ == "__main__":
    main()
