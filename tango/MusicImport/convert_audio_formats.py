#!/usr/bin/env python3
"""
Phase 2: Convert mismatched audio files to real MP3.

- Downloads from Azure blob (v20 container)
- Converts FLAC/M4A/AIFF → MP3 using ffmpeg
- Backs up originals to v20-originals container
- Uploads converted MP3 to v20 container
- Comprehensive logging for tracking

Usage:
    source MusicImport/vocal_detection/venv/bin/activate

    # Convert all (with resume support)
    python MusicImport/convert_audio_formats.py

    # Convert in batches
    python MusicImport/convert_audio_formats.py --batch 100
    python MusicImport/convert_audio_formats.py --batch 500

    # Dry run (no actual conversion)
    python MusicImport/convert_audio_formats.py --batch 10 --dry-run

Logs created:
    - converted_files.json     # Full conversion history
    - conversion_errors.json   # Failed conversions
    - conversion_progress.json # Resume checkpoint
    - missing_files.json       # 404s from scan
"""

import json
import argparse
import subprocess
import os
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Config
MISMATCH_REPORT = Path(__file__).parent / "mismatch_report.json"
LOG_DIR = Path(__file__).parent / "conversion_logs"
BLOB_ACCOUNT = "nttt"
BLOB_CONTAINER = "v20"
BACKUP_CONTAINER = "v20-originals"  # Backup originals here
BLOB_BASE_URL = f"https://{BLOB_ACCOUNT}.blob.core.windows.net/{BLOB_CONTAINER}"

# Processing config
CONCURRENT_WORKERS = 5  # Balance CPU vs network
FFMPEG_QUALITY = "2"    # VBR quality (0=best, 9=worst), 2 ≈ 190kbps

# Thread-safe state
lock = threading.Lock()
stats = {
    "processed": 0,
    "converted": 0,
    "backed_up": 0,
    "errors": 0,
    "skipped": 0
}


def setup_logs():
    """Create log directory and files."""
    LOG_DIR.mkdir(exist_ok=True)
    return {
        "converted": LOG_DIR / "converted_files.json",
        "errors": LOG_DIR / "conversion_errors.json",
        "progress": LOG_DIR / "conversion_progress.json",
        "full_log": LOG_DIR / "conversion_full.log",
        "missing": LOG_DIR / "missing_files.json",
    }


def load_progress(logs: dict) -> set:
    """Load already-processed song IDs for resume."""
    processed = set()
    if logs["converted"].exists():
        with open(logs["converted"]) as f:
            data = json.load(f)
            processed.update(item["id"] for item in data)
    if logs["errors"].exists():
        with open(logs["errors"]) as f:
            data = json.load(f)
            processed.update(item["id"] for item in data)
    return processed


def append_json(filepath: Path, item: dict):
    """Append item to JSON array file (thread-safe)."""
    with lock:
        if filepath.exists():
            with open(filepath) as f:
                data = json.load(f)
        else:
            data = []
        data.append(item)
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)


def log_message(logs: dict, msg: str):
    """Append to full log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with lock:
        with open(logs["full_log"], "a") as f:
            f.write(f"[{timestamp}] {msg}\n")


def download_blob(song_id: str, dest_path: str) -> bool:
    """Download blob from Azure."""
    url = f"{BLOB_BASE_URL}/{song_id}.mp3"
    try:
        result = subprocess.run(
            ["curl", "-s", "-f", "-o", dest_path, url],
            capture_output=True,
            timeout=120
        )
        return result.returncode == 0
    except Exception:
        return False


def backup_original(song_id: str, source_path: str) -> tuple:
    """Upload original to backup container. Returns (success, error)."""
    try:
        result = subprocess.run(
            [
                "az", "storage", "blob", "upload",
                "--account-name", BLOB_ACCOUNT,
                "--container-name", BACKUP_CONTAINER,
                "--name", f"{song_id}.original",
                "--file", source_path,
                "--overwrite",
                "--only-show-errors"
            ],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            return True, None
        return False, result.stderr[:200]
    except Exception as e:
        return False, str(e)[:200]


def convert_to_mp3(input_path: str, output_path: str, input_format: str) -> tuple:
    """Convert audio to MP3 using ffmpeg. Returns (success, error)."""
    try:
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-codec:a", "libmp3lame",
            "-q:a", FFMPEG_QUALITY,
            output_path
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        if result.returncode == 0 and os.path.exists(output_path):
            return True, None
        return False, result.stderr[-500:] if result.stderr else "Unknown error"
    except subprocess.TimeoutExpired:
        return False, "ffmpeg timeout"
    except Exception as e:
        return False, str(e)[:200]


def upload_mp3(song_id: str, source_path: str) -> tuple:
    """Upload converted MP3 to main container. Returns (success, error)."""
    try:
        result = subprocess.run(
            [
                "az", "storage", "blob", "upload",
                "--account-name", BLOB_ACCOUNT,
                "--container-name", BLOB_CONTAINER,
                "--name", f"{song_id}.mp3",
                "--file", source_path,
                "--content-type", "audio/mpeg",
                "--overwrite",
                "--only-show-errors"
            ],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            return True, None
        return False, result.stderr[:200]
    except Exception as e:
        return False, str(e)[:200]


def process_song(song: dict, logs: dict, total: int) -> dict:
    """Process a single song: download, backup, convert, upload."""
    song_id = song["id"]
    title = song.get("title", "Unknown")
    artist = song.get("artist", "Unknown")
    original_format = song.get("format", "unknown")

    result = {
        "id": song_id,
        "title": title,
        "artist": artist,
        "original_format": original_format,
        "timestamp": datetime.now().isoformat(),
        "steps": {},
        "success": False,
        "error": None
    }

    with tempfile.TemporaryDirectory() as tmpdir:
        original_path = os.path.join(tmpdir, f"{song_id}.original")
        mp3_path = os.path.join(tmpdir, f"{song_id}.mp3")

        # Step 1: Download
        if not download_blob(song_id, original_path):
            result["error"] = "Download failed (404 or network error)"
            result["steps"]["download"] = False
            with lock:
                stats["errors"] += 1
                stats["processed"] += 1
            append_json(logs["errors"], result)
            log_message(logs, f"ERROR: {song_id} - Download failed")
            return result
        result["steps"]["download"] = True

        original_size = os.path.getsize(original_path)
        result["original_size"] = original_size

        # Step 2: Backup original
        backup_ok, backup_err = backup_original(song_id, original_path)
        result["steps"]["backup"] = backup_ok
        if backup_ok:
            with lock:
                stats["backed_up"] += 1
        else:
            # Continue anyway - backup is nice-to-have
            result["backup_error"] = backup_err
            log_message(logs, f"WARN: {song_id} - Backup failed: {backup_err}")

        # Step 3: Convert to MP3
        convert_ok, convert_err = convert_to_mp3(original_path, mp3_path, original_format)
        result["steps"]["convert"] = convert_ok
        if not convert_ok:
            result["error"] = f"Conversion failed: {convert_err}"
            with lock:
                stats["errors"] += 1
                stats["processed"] += 1
            append_json(logs["errors"], result)
            log_message(logs, f"ERROR: {song_id} - Conversion failed: {convert_err}")
            return result

        mp3_size = os.path.getsize(mp3_path)
        result["mp3_size"] = mp3_size
        result["size_reduction"] = f"{(1 - mp3_size/original_size)*100:.1f}%"

        # Step 4: Upload converted MP3
        upload_ok, upload_err = upload_mp3(song_id, mp3_path)
        result["steps"]["upload"] = upload_ok
        if not upload_ok:
            result["error"] = f"Upload failed: {upload_err}"
            with lock:
                stats["errors"] += 1
                stats["processed"] += 1
            append_json(logs["errors"], result)
            log_message(logs, f"ERROR: {song_id} - Upload failed: {upload_err}")
            return result

        # Success!
        result["success"] = True
        with lock:
            stats["converted"] += 1
            stats["processed"] += 1
        append_json(logs["converted"], result)
        log_message(logs, f"OK: {song_id} | {title} | {original_format} → MP3 | {result['size_reduction']}")

    # Progress update
    with lock:
        if stats["processed"] % 10 == 0 or stats["processed"] == total:
            pct = stats["processed"] / total * 100
            print(f"[{stats['processed']}/{total}] {pct:.1f}% | ✓{stats['converted']} | ✗{stats['errors']} | ⬆{stats['backed_up']} backups")

            # Save progress checkpoint
            with open(logs["progress"], "w") as f:
                json.dump({
                    "last_update": datetime.now().isoformat(),
                    "stats": stats.copy(),
                    "total": total
                }, f, indent=2)

    return result


def main():
    parser = argparse.ArgumentParser(description="Convert mismatched audio files to MP3")
    parser.add_argument("--batch", type=int, default=0, help="Process only N files (0 = all)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done, don't convert")
    parser.add_argument("--workers", type=int, default=CONCURRENT_WORKERS, help="Parallel workers")
    args = parser.parse_args()

    print("="*60)
    print("PHASE 2: Audio Format Conversion")
    print("="*60)

    if args.dry_run:
        print("*** DRY RUN MODE - No actual conversion ***\n")

    # Load mismatch report
    if not MISMATCH_REPORT.exists():
        print(f"ERROR: Run Phase 1 first - {MISMATCH_REPORT} not found")
        return

    with open(MISMATCH_REPORT) as f:
        report = json.load(f)

    # Combine all files needing conversion
    to_convert = []
    to_convert.extend(report["needs_conversion"]["flac"])
    to_convert.extend(report["needs_conversion"]["m4a"])
    to_convert.extend(report["needs_conversion"]["other"])

    total = len(to_convert)
    print(f"Files to convert: {total}")
    print(f"  - FLAC: {len(report['needs_conversion']['flac'])}")
    print(f"  - M4A:  {len(report['needs_conversion']['m4a'])}")
    print(f"  - Other: {len(report['needs_conversion']['other'])}")

    # Setup logs
    logs = setup_logs()
    print(f"\nLogs directory: {LOG_DIR}")

    # Check for resume
    already_processed = load_progress(logs)
    if already_processed:
        print(f"Resuming: {len(already_processed)} already processed")
        to_convert = [s for s in to_convert if s["id"] not in already_processed]
        print(f"Remaining: {len(to_convert)}")

    if not to_convert:
        print("\nNothing to convert!")
        return

    # Apply batch limit
    if args.batch > 0 and len(to_convert) > args.batch:
        print(f"Batch mode: processing {args.batch} of {len(to_convert)}")
        to_convert = to_convert[:args.batch]

    # Dry run - just show what would be done
    if args.dry_run:
        print(f"\nDRY RUN: Would convert {len(to_convert)} files:")
        for i, song in enumerate(to_convert[:20]):
            print(f"  {i+1}. {song['id'][:20]}... | {song.get('format')} | {song.get('title', '')[:30]}")
        if len(to_convert) > 20:
            print(f"  ... and {len(to_convert) - 20} more")
        print("\nRun without --dry-run to actually convert.")
        return

    # Save missing files (404s from Phase 1)
    if report.get("errors"):
        with open(logs["missing"], "w") as f:
            json.dump(report["errors"], f, indent=2)
        print(f"Missing files (404): {len(report['errors'])} - saved to {logs['missing']}")

    # Ensure backup container exists
    print(f"\nCreating backup container: {BACKUP_CONTAINER}")
    subprocess.run(
        ["az", "storage", "container", "create",
         "--account-name", BLOB_ACCOUNT,
         "--name", BACKUP_CONTAINER,
         "--only-show-errors"],
        capture_output=True
    )

    workers = args.workers
    print(f"\nStarting conversion with {workers} workers...")
    print(f"FFmpeg quality: {FFMPEG_QUALITY} (VBR ~190kbps)")
    print("-"*60)

    remaining = len(to_convert)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(process_song, song, logs, remaining): song
            for song in to_convert
        }

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                song = futures[future]
                print(f"EXCEPTION: {song['id']} - {e}")

    # Final summary
    print("\n" + "="*60)
    print("CONVERSION COMPLETE")
    print("="*60)
    print(f"Total processed:  {stats['processed']}")
    print(f"Converted:        {stats['converted']}")
    print(f"Backed up:        {stats['backed_up']}")
    print(f"Errors:           {stats['errors']}")
    print(f"Skipped (resume): {len(already_processed)}")
    print(f"\nLogs saved to: {LOG_DIR}/")
    print(f"  - converted_files.json  ({stats['converted']} successful)")
    print(f"  - conversion_errors.json ({stats['errors']} failed)")
    print(f"  - missing_files.json    (404s from scan)")
    print(f"  - conversion_full.log   (detailed log)")


if __name__ == "__main__":
    main()
