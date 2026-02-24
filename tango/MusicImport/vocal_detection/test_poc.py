#!/usr/bin/env python3
"""Quick POC test with known vocal/instrumental songs."""

import json
import os
import sys
import tempfile
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

import requests
from inaSpeechSegmenter import Segmenter

AZURE_BASE = "https://nttt.blob.core.windows.net/v20"

def download_audio(url: str, output_path: str) -> bool:
    """Download audio file."""
    try:
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"Download failed: {e}")
        return False


def analyze_song(audio_path: str) -> dict:
    """Run vocal detection on audio file."""
    seg = Segmenter(vad_engine='smn', detect_gender=True)
    segments = seg(audio_path)

    vocal_time = 0
    total_time = 0
    vocal_segments = []

    for label, start, end in segments:
        duration = end - start
        total_time = max(total_time, end)

        if label in ['speech', 'male', 'female']:
            vocal_time += duration
            vocal_segments.append({
                'start': round(start, 1),
                'end': round(end, 1),
                'type': label
            })

    return {
        'hasSinger': vocal_time > 5,  # More than 5 seconds of vocals
        'vocalTime': round(vocal_time, 1),
        'totalTime': round(total_time, 1),
        'vocalPct': round((vocal_time / total_time) * 100, 1) if total_time > 0 else 0,
        'segments': len(vocal_segments)
    }


def main():
    # Load songs
    songs_path = Path(__file__).parent.parent / 'djSongsFiltered_boris.json'
    with open(songs_path) as f:
        all_songs = json.load(f)

    # Known singers in metadata
    singers = ['Goyaneche', 'Rufino', 'Fiorentino', 'Castillo', 'Podesta', 'Maida', 'Pomar']

    # Find songs WITH singer in name (likely has vocals)
    with_singer = []
    for song in all_songs:
        name = (song.get('artistOriginal', '') + ' ' + song.get('songTitleClean', '')).lower()
        for singer in singers:
            if singer.lower() in name:
                with_singer.append(song)
                break

    # Find songs likely INSTRUMENTAL (no singer name, Di Sarli instrumental style)
    instrumental = [s for s in all_songs if
                    s.get('artistMaster') == 'Carlos Di Sarli' and
                    'Pomar' not in s.get('artistOriginal', '') and
                    'Rufino' not in s.get('artistOriginal', '')][:5]

    # Test samples
    test_songs = [
        ('WITH SINGER', with_singer[0]),
        ('WITH SINGER', with_singer[100] if len(with_singer) > 100 else with_singer[1]),
        ('INSTRUMENTAL?', instrumental[0]),
        ('INSTRUMENTAL?', instrumental[1]),
    ]

    print("=" * 70)
    print("VOCAL DETECTION POC TEST")
    print("=" * 70)

    results = []

    with tempfile.TemporaryDirectory() as tmpdir:
        for label, song in test_songs:
            song_id = song['songID']
            title = song['songTitleClean']
            artist = song['artistOriginal']
            url = f"{AZURE_BASE}/{song_id}.mp3"
            audio_path = os.path.join(tmpdir, f"{song_id}.mp3")

            print(f"\n{label}: {title}")
            print(f"  Artist: {artist}")

            if download_audio(url, audio_path):
                print("  Analyzing...")
                result = analyze_song(audio_path)
                result['songID'] = song_id
                result['title'] = title
                result['artist'] = artist
                result['expected'] = label
                results.append(result)

                status = "SINGER DETECTED" if result['hasSinger'] else "INSTRUMENTAL"
                print(f"  Result: {status}")
                print(f"  Vocal: {result['vocalTime']}s / {result['totalTime']}s ({result['vocalPct']}%)")
                print(f"  Segments: {result['segments']}")
            else:
                print("  FAILED to download")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    for r in results:
        match = "OK" if (r['expected'] == 'WITH SINGER' and r['hasSinger']) or \
                       (r['expected'] == 'INSTRUMENTAL?' and not r['hasSinger']) else "CHECK"
        print(f"  [{match}] {r['title'][:30]:30} - {r['expected']:15} -> {'SINGER' if r['hasSinger'] else 'INSTR':8} ({r['vocalPct']}%)")

    # Save
    output_path = Path(__file__).parent / 'test_results.json'
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved: {output_path}")


if __name__ == '__main__':
    main()
