#!/usr/bin/env python3
"""
Phase 1: Scan all audio files to detect format mismatches.
Uses magic bytes (first 12 bytes) - very fast!

Usage:
    python scan_audio_formats.py

Output:
    - mismatch_report.json: Full report of all mismatched files
"""

import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
import threading

# Config
SONGS_FILE = Path(__file__).parent.parent / "NTTT-app/public/songData/djSongs.json"
BLOB_BASE_URL = "https://nttt.blob.core.windows.net/v20"
OUTPUT_FILE = Path(__file__).parent / "mismatch_report.json"
CONCURRENT_REQUESTS = 50  # Parallel downloads

# Thread-safe counters
lock = threading.Lock()
progress = {"done": 0, "mp3": 0, "mismatch": 0, "error": 0}


def detect_format(header_bytes: bytes) -> str:
    """Detect audio format from first 12 bytes."""
    if len(header_bytes) < 12:
        return "unknown"

    # FLAC: starts with "fLaC"
    if header_bytes[:4] == b'fLaC':
        return "flac"

    # MP3: starts with ID3 tag or sync word
    if header_bytes[:3] == b'ID3':
        return "mp3"
    if header_bytes[0] == 0xFF and (header_bytes[1] & 0xE0) == 0xE0:
        return "mp3"

    # M4A/AAC/MP4: has "ftyp" at offset 4
    if header_bytes[4:8] == b'ftyp':
        return "m4a"

    # WAV: starts with "RIFF"
    if header_bytes[:4] == b'RIFF':
        return "wav"

    # OGG: starts with "OggS"
    if header_bytes[:4] == b'OggS':
        return "ogg"

    return f"unknown({header_bytes[:8].hex()})"


def check_song(song: dict, total: int) -> dict:
    """Fetch first 12 bytes and detect format."""
    song_id = song["SongID"]
    url = f"{BLOB_BASE_URL}/{song_id}.mp3"

    try:
        headers = {"Range": "bytes=0-11"}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code in (200, 206):
            fmt = detect_format(resp.content[:12])
            result = {
                "id": song_id,
                "title": song.get("Title", "")[:40],
                "artist": song.get("ArtistMaster", "")[:30],
                "format": fmt,
                "error": None
            }
        else:
            fmt = "error"
            result = {
                "id": song_id,
                "title": song.get("Title", ""),
                "format": "error",
                "error": f"HTTP {resp.status_code}"
            }
    except requests.Timeout:
        fmt = "error"
        result = {"id": song_id, "format": "error", "error": "timeout"}
    except Exception as e:
        fmt = "error"
        result = {"id": song_id, "format": "error", "error": str(e)[:100]}

    # Update progress
    with lock:
        progress["done"] += 1
        if fmt == "mp3":
            progress["mp3"] += 1
        elif fmt == "error":
            progress["error"] += 1
        else:
            progress["mismatch"] += 1

        # Print every 100
        if progress["done"] % 100 == 0 or progress["done"] == total:
            pct = progress["done"] / total * 100
            print(f"[{progress['done']}/{total}] {pct:.1f}% | {progress['mp3']} OK | {progress['mismatch']} mismatch | {progress['error']} err")

    return result


def main():
    print(f"Loading songs from {SONGS_FILE}...")
    with open(SONGS_FILE) as f:
        data = json.load(f)

    songs = data["songs"]
    total = len(songs)
    print(f"Found {total} songs to scan")
    print(f"Using {CONCURRENT_REQUESTS} concurrent requests")
    print(f"Fetching only first 12 bytes per file (magic bytes)\n")

    results = {"mp3": [], "flac": [], "m4a": [], "other": [], "error": []}

    with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
        futures = {executor.submit(check_song, song, total): song for song in songs}

        for future in as_completed(futures):
            r = future.result()
            fmt = r["format"]
            if fmt == "mp3":
                results["mp3"].append(r["id"])
            elif fmt == "flac":
                results["flac"].append(r)
            elif fmt == "m4a":
                results["m4a"].append(r)
            elif fmt == "error":
                results["error"].append(r)
            else:
                results["other"].append(r)

    # Final report
    report = {
        "scanned_at": datetime.now().isoformat(),
        "total_songs": total,
        "summary": {
            "mp3_ok": len(results["mp3"]),
            "flac_mismatch": len(results["flac"]),
            "m4a_mismatch": len(results["m4a"]),
            "other_mismatch": len(results["other"]),
            "errors": len(results["error"]),
        },
        "needs_conversion": {
            "flac": results["flac"],
            "m4a": results["m4a"],
            "other": results["other"],
        },
        "errors": results["error"],
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(report, f, indent=2)

    # Summary
    print("\n" + "="*60)
    print("SCAN COMPLETE")
    print("="*60)
    print(f"Total scanned:    {total}")
    print(f"MP3 (OK):         {report['summary']['mp3_ok']}")
    print(f"FLAC mismatch:    {report['summary']['flac_mismatch']}")
    print(f"M4A mismatch:     {report['summary']['m4a_mismatch']}")
    print(f"Other mismatch:   {report['summary']['other_mismatch']}")
    print(f"Errors:           {report['summary']['errors']}")
    print(f"\nReport saved to: {OUTPUT_FILE}")

    total_fix = report['summary']['flac_mismatch'] + report['summary']['m4a_mismatch'] + report['summary']['other_mismatch']
    print(f"\nTOTAL NEEDING CONVERSION: {total_fix}")


if __name__ == "__main__":
    main()
