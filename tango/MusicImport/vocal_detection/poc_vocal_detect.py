#!/usr/bin/env python3
"""
POC: Vocal/Singer Detection for NTTT Tango Songs

This script detects vocal segments in tango songs using inaSpeechSegmenter.
It outputs timestamps where singing/speech is detected.

Usage:
    python poc_vocal_detect.py <audio_file_or_url>
    python poc_vocal_detect.py --test  # Run on test songs

Requirements:
    pip install inaSpeechSegmenter requests

Note: First run will download the CNN model (~100MB)
"""

import os
import sys
import json
import tempfile
import argparse
from datetime import datetime
from pathlib import Path

# Check if inaSpeechSegmenter is installed
try:
    from inaSpeechSegmenter import Segmenter
except ImportError:
    print("ERROR: inaSpeechSegmenter not installed")
    print("Run: pip install inaSpeechSegmenter")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests not installed")
    print("Run: pip install requests")
    sys.exit(1)


def download_audio(url: str, output_path: str) -> bool:
    """Download audio file from URL."""
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded to: {output_path}")
        return True
    except Exception as e:
        print(f"Download failed: {e}")
        return False


def analyze_audio(audio_path: str, min_segment_duration: float = 2.0) -> dict:
    """
    Analyze audio file for vocal segments.

    Args:
        audio_path: Path to audio file
        min_segment_duration: Minimum duration to consider a segment (seconds)

    Returns:
        dict with vocal analysis results
    """
    print(f"\nAnalyzing: {audio_path}")

    # Initialize segmenter (downloads model on first run)
    # detect_gender=True gives male/female labels for speech
    seg = Segmenter(vad_engine='smn', detect_gender=True)

    # Run segmentation
    # Returns list of (label, start, end) tuples
    # Labels: 'music', 'speech', 'noise', 'male', 'female'
    segments = seg(audio_path)

    # Process results
    vocal_segments = []
    total_duration = 0
    total_vocal_time = 0

    for label, start, end in segments:
        duration = end - start
        total_duration = max(total_duration, end)

        # Speech/singing labels
        if label in ['speech', 'male', 'female']:
            if duration >= min_segment_duration:
                vocal_segments.append({
                    'start': round(start, 1),
                    'end': round(end, 1),
                    'duration': round(duration, 1),
                    'type': label
                })
                total_vocal_time += duration

    # Merge adjacent segments (within 3 seconds)
    merged_segments = merge_adjacent_segments(vocal_segments, gap_threshold=3.0)

    result = {
        'hasSinger': len(merged_segments) > 0,
        'vocalSegments': merged_segments,
        'totalVocalTime': round(total_vocal_time, 1),
        'totalDuration': round(total_duration, 1),
        'vocalPercentage': round((total_vocal_time / total_duration) * 100, 1) if total_duration > 0 else 0,
        'rawSegmentCount': len(vocal_segments),
        'mergedSegmentCount': len(merged_segments),
        'analysisVersion': '1.0-poc',
        'analyzedAt': datetime.now().isoformat()
    }

    return result


def merge_adjacent_segments(segments: list, gap_threshold: float = 3.0) -> list:
    """Merge vocal segments that are close together."""
    if not segments:
        return []

    # Sort by start time
    sorted_segs = sorted(segments, key=lambda x: x['start'])

    merged = []
    current = sorted_segs[0].copy()

    for seg in sorted_segs[1:]:
        # If this segment starts within gap_threshold of current end, merge
        if seg['start'] - current['end'] <= gap_threshold:
            current['end'] = seg['end']
            current['duration'] = round(current['end'] - current['start'], 1)
        else:
            merged.append(current)
            current = seg.copy()

    merged.append(current)
    return merged


def print_results(result: dict, song_info: str = ""):
    """Print analysis results in a readable format."""
    print("\n" + "=" * 60)
    if song_info:
        print(f"Song: {song_info}")
    print("=" * 60)

    if result['hasSinger']:
        print(f"  SINGER DETECTED")
        print(f"  Vocal time: {result['totalVocalTime']}s / {result['totalDuration']}s ({result['vocalPercentage']}%)")
        print(f"  Segments: {result['mergedSegmentCount']} (merged from {result['rawSegmentCount']})")
        print("\n  Vocal segments:")
        for i, seg in enumerate(result['vocalSegments'], 1):
            print(f"    {i}. {seg['start']}s - {seg['end']}s ({seg['duration']}s)")
    else:
        print(f"  NO SINGER (instrumental)")
        print(f"  Duration: {result['totalDuration']}s")

    print("=" * 60 + "\n")


def test_with_sample_songs():
    """Test with a few sample songs from the BORIS collection."""
    # Load song list
    songs_path = Path(__file__).parent.parent / 'djSongsFiltered_boris.json'
    if not songs_path.exists():
        print(f"Songs file not found: {songs_path}")
        return

    with open(songs_path) as f:
        songs = json.load(f)

    print(f"Loaded {len(songs)} songs")

    # Pick a few test songs (mix of likely vocal and instrumental)
    # Look for songs with "Singer" in the data or known vocal artists
    test_songs = []

    # Get first 3 songs for quick test
    for song in songs[:5]:
        test_songs.append({
            'songID': song['songID'],
            'title': song['songTitleClean'],
            'artist': song['artistMaster'],
            'url': f"https://nttt.blob.core.windows.net/v20/{song['songID']}.mp3"
        })

    print(f"\nTesting {len(test_songs)} songs:")
    for s in test_songs:
        print(f"  - {s['title']} by {s['artist']}")

    results = []

    with tempfile.TemporaryDirectory() as tmpdir:
        for song in test_songs:
            audio_path = os.path.join(tmpdir, f"{song['songID']}.mp3")

            if download_audio(song['url'], audio_path):
                try:
                    result = analyze_audio(audio_path)
                    result['songID'] = song['songID']
                    result['title'] = song['title']
                    result['artist'] = song['artist']
                    results.append(result)
                    print_results(result, f"{song['title']} - {song['artist']}")
                except Exception as e:
                    print(f"Analysis failed for {song['title']}: {e}")
            else:
                print(f"Skipping {song['title']} - download failed")

    # Save results
    output_path = Path(__file__).parent / 'poc_results.json'
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {output_path}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    with_singer = sum(1 for r in results if r['hasSinger'])
    print(f"Songs with singer: {with_singer}/{len(results)}")
    print(f"Songs instrumental: {len(results) - with_singer}/{len(results)}")


def main():
    parser = argparse.ArgumentParser(description='Detect vocals in tango songs')
    parser.add_argument('audio', nargs='?', help='Audio file path or URL')
    parser.add_argument('--test', action='store_true', help='Run test with sample songs')
    args = parser.parse_args()

    if args.test:
        test_with_sample_songs()
    elif args.audio:
        # Single file analysis
        audio_path = args.audio

        # If URL, download first
        if audio_path.startswith('http'):
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                if download_audio(audio_path, tmp.name):
                    audio_path = tmp.name
                else:
                    sys.exit(1)

        if not os.path.exists(audio_path):
            print(f"File not found: {audio_path}")
            sys.exit(1)

        result = analyze_audio(audio_path)
        print_results(result, audio_path)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
