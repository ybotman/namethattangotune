#!/usr/bin/env python3
"""
Batch Vocal Detection for NTTT Songs

Processes songs in batches and saves results to JSON.
Designed to run overnight for full 5,731 song collection.

Usage:
    python batch_process.py --start 0 --count 100  # Process songs 0-99
    python batch_process.py --resume                # Resume from last position
    python batch_process.py --all                   # Process all songs

Estimated time: ~20 seconds per song = ~32 hours for 5,731 songs
"""

import os
import sys
import json
import tempfile
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

import whisper
import requests


AZURE_BASE = "https://nttt.blob.core.windows.net/v20"
SONGS_FILE = Path(__file__).parent.parent / 'djSongsFiltered_boris.json'
OUTPUT_FILE = Path(__file__).parent / 'vocalAnalysis.json'
PROGRESS_FILE = Path(__file__).parent / 'batch_progress.json'

# Threshold for singer detection (percentage of vocal time)
SINGER_THRESHOLD = 15.0


def download_audio(url: str, output_path: str, timeout: int = 60) -> bool:
    """Download audio file from URL."""
    try:
        response = requests.get(url, stream=True, timeout=timeout)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    Download failed: {e}")
        return False


def analyze_audio(audio_path: str, model) -> dict:
    """Analyze audio file for vocals using Whisper."""
    result = model.transcribe(
        audio_path,
        language='es',
        word_timestamps=True,
        verbose=False
    )

    segments = []
    total_vocal_time = 0

    for seg in result.get('segments', []):
        start = seg['start']
        end = seg['end']
        text = seg.get('text', '').strip()

        if text and len(text) > 2:
            duration = end - start
            total_vocal_time += duration
            segments.append({
                'start': round(start, 1),
                'end': round(end, 1),
                'duration': round(duration, 1),
                'text': text[:50]
            })

    total_duration = max(s['end'] for s in segments) if segments else 0
    if not segments and result.get('segments'):
        total_duration = result['segments'][-1]['end'] if result['segments'] else 180

    merged = merge_segments(segments)
    vocal_pct = float(round((total_vocal_time / total_duration) * 100, 1)) if total_duration > 0 else 0.0

    return {
        'hasSinger': bool(vocal_pct > SINGER_THRESHOLD),  # Ensure Python bool, not numpy
        'vocalSegments': merged,
        'totalVocalTime': float(round(total_vocal_time, 1)),
        'totalDuration': float(round(total_duration, 1)),
        'vocalPercentage': float(vocal_pct),
        'segmentCount': int(len(merged)),
        'lyricsPreview': str(result.get('text', '')[:100]),
        'analysisVersion': 'whisper-1.0',
        'analyzedAt': datetime.now().isoformat()
    }


def merge_segments(segments: list, gap_threshold: float = 5.0) -> list:
    """Merge adjacent vocal segments."""
    if not segments:
        return []

    sorted_segs = sorted(segments, key=lambda x: x['start'])
    merged = []
    current = sorted_segs[0].copy()

    for seg in sorted_segs[1:]:
        if seg['start'] - current['end'] <= gap_threshold:
            current['end'] = seg['end']
            current['duration'] = round(current['end'] - current['start'], 1)
        else:
            merged.append(current)
            current = seg.copy()

    merged.append(current)
    return merged


def load_progress() -> dict:
    """Load batch progress."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {'lastIndex': 0, 'processed': 0, 'errors': 0}


def save_progress(progress: dict):
    """Save batch progress."""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)


def load_results() -> dict:
    """Load existing results."""
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE) as f:
            return json.load(f)
    return {}


def save_results(results: dict):
    """Save results to file."""
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(results, f, indent=2)


def process_batch(start_idx: int, count: int, model):
    """Process a batch of songs."""
    # Load songs
    with open(SONGS_FILE) as f:
        all_songs = json.load(f)

    total_songs = len(all_songs)
    end_idx = min(start_idx + count, total_songs)

    print(f"\n{'='*60}")
    print(f"Processing songs {start_idx} to {end_idx-1} of {total_songs}")
    print(f"{'='*60}\n")

    # Load existing results
    results = load_results()
    progress = load_progress()

    processed = 0
    errors = 0

    with tempfile.TemporaryDirectory() as tmpdir:
        for i, song in enumerate(all_songs[start_idx:end_idx], start=start_idx):
            song_id = song['songID']
            title = song.get('songTitleClean', '')[:40]
            artist = song.get('artistMaster', '')

            # Skip if already processed
            if song_id in results:
                print(f"[{i}/{total_songs}] SKIP: {title} (already done)")
                continue

            print(f"[{i}/{total_songs}] {title} - {artist}")

            url = f"{AZURE_BASE}/{song_id}.mp3"
            audio_path = os.path.join(tmpdir, f"{song_id}.mp3")

            try:
                if download_audio(url, audio_path):
                    result = analyze_audio(audio_path, model)
                    result['songID'] = song_id
                    results[song_id] = result

                    status = "SINGER" if result['hasSinger'] else "INSTR"
                    print(f"    {status} ({result['vocalPercentage']}%)")
                    processed += 1

                    # Save periodically
                    if processed % 10 == 0:
                        save_results(results)
                        progress['lastIndex'] = i
                        progress['processed'] += 10
                        save_progress(progress)

                    # Cleanup
                    os.remove(audio_path)
                else:
                    errors += 1

            except Exception as e:
                print(f"    ERROR: {e}")
                errors += 1

    # Final save
    save_results(results)
    progress['lastIndex'] = end_idx - 1
    progress['processed'] = len(results)
    progress['errors'] = errors
    save_progress(progress)

    # Summary
    with_singer = sum(1 for r in results.values() if r.get('hasSinger'))
    instrumental = len(results) - with_singer

    print(f"\n{'='*60}")
    print("BATCH COMPLETE")
    print(f"{'='*60}")
    print(f"Processed: {processed}")
    print(f"Errors: {errors}")
    print(f"Total analyzed: {len(results)}")
    print(f"With singer: {with_singer}")
    print(f"Instrumental: {instrumental}")


def main():
    parser = argparse.ArgumentParser(description='Batch vocal detection')
    parser.add_argument('--start', type=int, default=0, help='Start index')
    parser.add_argument('--count', type=int, default=100, help='Number to process')
    parser.add_argument('--resume', action='store_true', help='Resume from last position')
    parser.add_argument('--all', action='store_true', help='Process all songs')
    args = parser.parse_args()

    print("Loading Whisper model (base)...")
    model = whisper.load_model("base")
    print("Model loaded.\n")

    if args.resume:
        progress = load_progress()
        start_idx = progress['lastIndex'] + 1
        process_batch(start_idx, args.count, model)
    elif args.all:
        with open(SONGS_FILE) as f:
            total = len(json.load(f))
        process_batch(0, total, model)
    else:
        process_batch(args.start, args.count, model)


if __name__ == '__main__':
    main()
