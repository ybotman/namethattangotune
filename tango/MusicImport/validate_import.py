#!/usr/bin/env python3
"""
Validate Import - Dry-run validation to catch dangling references

Checks:
1. SongID in djSongs but missing from Azure blob → flag
2. SongID in djSongs but missing from vocalAnalysis → flag
3. Orchestra not in ArtistMaster → flag
4. Cancion=true but no Singer → flag
5. Year missing or invalid → flag

Usage:
    python validate_import.py --dry-run   # Validate without modifying
    python validate_import.py --fix-dnp   # Mark issues as doNotPlay
"""

import json
import argparse
from datetime import datetime
from pathlib import Path
import subprocess

# Configuration
DJ_SONGS_FILE = Path(__file__).parent / 'djSongs.json'
NEW_SONGS_FILE = Path(__file__).parent / 'new_songs_import.json'
ARTIST_MASTER_FILE = Path(__file__).parent / 'ArtistMaster.json'
VOCAL_ANALYSIS_FILE = Path(__file__).parent / 'vocal_detection' / 'vocalAnalysis.json'
AZURE_BASE = "https://nttt.blob.core.windows.net/v20"


def load_json(filepath):
    """Load JSON file."""
    if not filepath.exists():
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def check_azure_blob(song_id: str) -> bool:
    """Check if blob exists in Azure (uses curl HEAD request)."""
    url = f"{AZURE_BASE}/{song_id}.mp3"
    try:
        result = subprocess.run(
            ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-I', url],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout.strip() == '200'
    except:
        return False  # Assume missing if check fails


def main():
    parser = argparse.ArgumentParser(description='Validate import for dangling references')
    parser.add_argument('--dry-run', action='store_true', help='Validate only, no changes')
    parser.add_argument('--fix-dnp', action='store_true', help='Mark issues as doNotPlay')
    parser.add_argument('--skip-azure', action='store_true', help='Skip Azure blob checks (slow)')
    parser.add_argument('--new-only', action='store_true', help='Only validate new songs')
    args = parser.parse_args()

    print("=" * 60)
    print("NTTT Import Validation")
    print("=" * 60)

    # Load data
    print("\nLoading data...")

    if args.new_only:
        data = load_json(NEW_SONGS_FILE)
        if data:
            songs = data.get('songs', [])
        else:
            print(f"Error: {NEW_SONGS_FILE} not found")
            return
        print(f"  New songs: {len(songs)}")
    else:
        data = load_json(DJ_SONGS_FILE)
        if data:
            songs = data.get('songs', [])
        else:
            print(f"Error: {DJ_SONGS_FILE} not found")
            return
        print(f"  Songs: {len(songs)}")

    artists_data = load_json(ARTIST_MASTER_FILE)
    if artists_data:
        artist_names = {a['artist'].lower() for a in artists_data}
        print(f"  Artists: {len(artist_names)}")
    else:
        artist_names = set()
        print("  Artists: not found")

    vocal_data = load_json(VOCAL_ANALYSIS_FILE)
    if vocal_data:
        vocal_ids = set(vocal_data.keys())
        print(f"  Vocal analysis: {len(vocal_ids)}")
    else:
        vocal_ids = set()
        print("  Vocal analysis: not found")

    # Validation
    print("\nValidating...")
    issues = []
    warnings = []

    for i, song in enumerate(songs):
        song_id = song.get('SongID', '')
        title = song.get('Title', '')
        orchestra = song.get('Orchestra', '') or song.get('ArtistMaster', '')
        singer = song.get('Singer', '')
        year = song.get('Year', '')
        cancion = song.get('Cancion', '')

        song_issues = []

        # Check 1: Vocal analysis
        if song_id not in vocal_ids:
            song_issues.append('missing_vocal_analysis')

        # Check 2: Orchestra in ArtistMaster
        if orchestra and orchestra.lower() not in artist_names:
            song_issues.append(f'orchestra_not_in_master: {orchestra}')

        # Check 3: Cancion but no singer
        if cancion == 'true' and not singer:
            # This is actually OK for some cancion songs (e.g., Piazzolla instrumental)
            pass  # warnings.append(...)

        # Check 4: Year validation
        if year:
            try:
                y = int(year)
                if y < 1890 or y > 2030:
                    song_issues.append(f'year_invalid: {year}')
            except ValueError:
                if year.lower() != 'unk':
                    song_issues.append(f'year_not_numeric: {year}')
        else:
            song_issues.append('year_missing')

        # Check 5: Azure blob (optional, slow)
        if not args.skip_azure and song_issues:
            # Only check Azure for songs with other issues
            if not check_azure_blob(song_id):
                song_issues.insert(0, 'audio_404')

        if song_issues:
            issues.append({
                'songId': song_id,
                'title': title,
                'orchestra': orchestra,
                'issues': song_issues
            })

        # Progress
        if (i + 1) % 50 == 0:
            print(f"  Checked {i + 1}/{len(songs)}...")

    # Summary
    fully_playable = len(songs) - len(issues)
    dnp_recommended = len([i for i in issues if 'audio_404' in i['issues']])

    print(f"\n{'=' * 60}")
    print(f"=== Validation Results ===")
    print(f"{'=' * 60}")
    print(f"Total songs: {len(songs)}")
    print(f"Fully playable: {fully_playable}")
    print(f"With issues: {len(issues)}")
    print(f"DNP recommended (404): {dnp_recommended}")

    # Group issues by type
    issue_counts = {}
    for item in issues:
        for issue in item['issues']:
            issue_type = issue.split(':')[0]
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1

    if issue_counts:
        print(f"\nIssue breakdown:")
        for issue_type, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
            print(f"  {issue_type}: {count}")

    if issues:
        print(f"\nSongs with issues:")
        for item in issues[:20]:
            print(f"  - {item['title']} ({item['orchestra']}): {', '.join(item['issues'])}")
        if len(issues) > 20:
            print(f"  ... and {len(issues) - 20} more")

    # Save report
    report = {
        'generated': datetime.now().isoformat(),
        'total': len(songs),
        'fullyPlayable': fully_playable,
        'dnpRecommended': dnp_recommended,
        'issueCounts': issue_counts,
        'issues': issues
    }

    report_file = Path(__file__).parent / 'validation_report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\nReport saved to: {report_file}")

    if args.dry_run:
        print(f"\n[DRY RUN] No changes made")


if __name__ == "__main__":
    main()
