#!/usr/bin/env python3
"""
Vocal Detection using OpenAI Whisper

Uses Whisper's speech recognition to detect vocal segments in tango songs.
If Whisper detects text/singing, we know there are vocals.

Usage:
    python whisper_detect.py --test
    python whisper_detect.py <audio_file_or_url>
"""

import os
import sys
import json
import tempfile
import argparse
from datetime import datetime
from pathlib import Path

import whisper
import requests


AZURE_BASE = "https://nttt.blob.core.windows.net/v20"


def download_audio(url: str, output_path: str) -> bool:
    """Download audio file from URL."""
    try:
        print(f"  Downloading...")
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  Download failed: {e}")
        return False


def analyze_audio(audio_path: str, model) -> dict:
    """
    Analyze audio file for vocals using Whisper.

    Returns dict with vocal analysis results.
    """
    # Transcribe with word-level timestamps
    result = model.transcribe(
        audio_path,
        language='es',  # Spanish for tango
        word_timestamps=True,
        verbose=False
    )

    # Extract vocal segments from Whisper output
    segments = []
    total_vocal_time = 0

    for seg in result.get('segments', []):
        start = seg['start']
        end = seg['end']
        text = seg.get('text', '').strip()

        # Only count segments with actual text/singing
        if text and len(text) > 2:
            duration = end - start
            total_vocal_time += duration
            segments.append({
                'start': round(start, 1),
                'end': round(end, 1),
                'duration': round(duration, 1),
                'text': text[:50]  # First 50 chars of lyrics
            })

    # Get audio duration from last segment or estimate
    total_duration = max(s['end'] for s in segments) if segments else 0
    if not segments and result.get('segments'):
        total_duration = result['segments'][-1]['end'] if result['segments'] else 180

    # Merge adjacent segments
    merged = merge_segments(segments, gap_threshold=5.0)

    # Use 15% threshold to filter false positives from instrumental tracks
    vocal_pct = round((total_vocal_time / total_duration) * 100, 1) if total_duration > 0 else 0
    has_singer = vocal_pct > 15  # 15% threshold

    return {
        'hasSinger': has_singer,
        'vocalSegments': merged,
        'totalVocalTime': round(total_vocal_time, 1),
        'totalDuration': round(total_duration, 1),
        'vocalPercentage': round((total_vocal_time / total_duration) * 100, 1) if total_duration > 0 else 0,
        'segmentCount': len(merged),
        'fullText': result.get('text', '')[:200],
        'analysisVersion': 'whisper-1.0',
        'analyzedAt': datetime.now().isoformat()
    }


def merge_segments(segments: list, gap_threshold: float = 5.0) -> list:
    """Merge vocal segments that are close together."""
    if not segments:
        return []

    sorted_segs = sorted(segments, key=lambda x: x['start'])
    merged = []
    current = sorted_segs[0].copy()

    for seg in sorted_segs[1:]:
        if seg['start'] - current['end'] <= gap_threshold:
            current['end'] = seg['end']
            current['duration'] = round(current['end'] - current['start'], 1)
            current['text'] = current['text'] + '...'
        else:
            merged.append(current)
            current = seg.copy()

    merged.append(current)
    return merged


def test_with_sample_songs():
    """Test vocal detection on sample songs."""
    # Load song data
    songs_path = Path(__file__).parent.parent / 'djSongsFiltered_boris.json'
    with open(songs_path) as f:
        all_songs = json.load(f)

    # Known singer names
    singers = ['Goyaneche', 'Rufino', 'Fiorentino', 'Castillo', 'Podesta', 'Maida', 'Pomar', 'Berón']

    # Find songs with singer names (likely have vocals)
    with_singer = []
    for song in all_songs:
        name = (song.get('artistOriginal', '') + ' ' + song.get('songTitleClean', '')).lower()
        for singer in singers:
            if singer.lower() in name:
                with_singer.append(song)
                break

    # Find likely instrumental songs
    instrumental = [s for s in all_songs if
                    s.get('artistMaster') == 'Carlos Di Sarli' and
                    'Pomar' not in s.get('artistOriginal', '') and
                    'Rufino' not in s.get('artistOriginal', '')]

    # Test samples - 2 with singer, 2 likely instrumental
    test_songs = [
        ('WITH SINGER', with_singer[0]),
        ('WITH SINGER', with_singer[50] if len(with_singer) > 50 else with_singer[1]),
        ('INSTRUMENTAL?', instrumental[0]),
        ('INSTRUMENTAL?', instrumental[1]),
    ]

    print("=" * 70)
    print("VOCAL DETECTION POC (Whisper)")
    print("=" * 70)
    print("Loading Whisper model (base)...")

    model = whisper.load_model("base")
    print("Model loaded.\n")

    results = []

    with tempfile.TemporaryDirectory() as tmpdir:
        for label, song in test_songs:
            song_id = song['songID']
            title = song['songTitleClean'][:40]
            artist = song['artistOriginal'][:40]
            url = f"{AZURE_BASE}/{song_id}.mp3"
            audio_path = os.path.join(tmpdir, f"{song_id}.mp3")

            print(f"\n{label}: {title}")
            print(f"  Artist: {artist}")

            if download_audio(url, audio_path):
                print("  Analyzing with Whisper...")
                result = analyze_audio(audio_path, model)
                result['songID'] = song_id
                result['title'] = title
                result['artist'] = artist
                result['expected'] = label
                results.append(result)

                status = "SINGER DETECTED" if result['hasSinger'] else "INSTRUMENTAL"
                print(f"  Result: {status}")
                print(f"  Vocal: {result['totalVocalTime']}s ({result['vocalPercentage']}%)")
                if result['fullText']:
                    print(f"  Text: {result['fullText'][:80]}...")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    for r in results:
        detected = 'SINGER' if r['hasSinger'] else 'INSTR'
        match = "OK" if (r['expected'] == 'WITH SINGER' and r['hasSinger']) or \
                       (r['expected'] == 'INSTRUMENTAL?' and not r['hasSinger']) else "??"
        print(f"  [{match}] {r['title'][:30]:30} - {r['expected']:15} -> {detected:8} ({r['vocalPercentage']:5.1f}%)")

    # Save results
    output_path = Path(__file__).parent / 'whisper_results.json'
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Detect vocals using Whisper')
    parser.add_argument('audio', nargs='?', help='Audio file or URL')
    parser.add_argument('--test', action='store_true', help='Run test on sample songs')
    args = parser.parse_args()

    if args.test:
        test_with_sample_songs()
    elif args.audio:
        print("Loading Whisper model...")
        model = whisper.load_model("base")

        audio_path = args.audio
        if audio_path.startswith('http'):
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                if download_audio(audio_path, tmp.name):
                    audio_path = tmp.name
                else:
                    sys.exit(1)

        result = analyze_audio(audio_path, model)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
