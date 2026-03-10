#!/usr/bin/env python3
"""
match_el_recodo.py - Match NTTT songs against el-recodo.com database

el-recodo.com is the largest tango database (~26,000 recordings).
Paid membership unlocks danceability ratings and popularity scores.

Note: This script works for basic matching without login.
Full metadata extraction requires session cookies from a logged-in account.
"""

import requests
import time
import re
import json
import sys
from urllib.parse import quote_plus, urlencode
from bs4 import BeautifulSoup

# Rate limiting - el-recodo is stricter
REQUEST_DELAY = 2.0  # seconds between requests

class ElRecodoMatcher:
    BASE_URL = "https://www.el-recodo.com"
    SEARCH_URL = "https://www.el-recodo.com/music"

    def __init__(self, session_cookie=None):
        """
        Initialize matcher.

        Args:
            session_cookie: Optional session cookie for logged-in access
        """
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
        if session_cookie:
            self.session.cookies.set('session', session_cookie)
        self.cache = {}
        self.logged_in = session_cookie is not None

    def normalize_orchestra(self, orchestra):
        """Normalize orchestra name for el-recodo search."""
        if not orchestra:
            return ""
        # el-recodo uses specific orchestra codes/names
        orchestra = orchestra.strip()
        # Handle common variations
        mappings = {
            "Juan D'Arienzo": "Juan D'Arienzo",
            "D'Arienzo": "Juan D'Arienzo",
            "Carlos Di Sarli": "Carlos Di Sarli",
            "Di Sarli": "Carlos Di Sarli",
            "Anibal Troilo": "Anibal Troilo",
            "Troilo": "Anibal Troilo",
            "Osvaldo Pugliese": "Osvaldo Pugliese",
            "Pugliese": "Osvaldo Pugliese",
        }
        return mappings.get(orchestra, orchestra)

    def search(self, title, orchestra=None, year=None, singer=None):
        """
        Search el-recodo for a recording.

        Args:
            title: Song title
            orchestra: Orchestra name
            year: Recording year
            singer: Singer name (optional)

        Returns:
            dict with match results
        """
        cache_key = f"{title}|{orchestra}|{year}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        try:
            # Build search params
            params = {'page': 'search'}
            if title:
                params['title'] = title
            if orchestra:
                params['O'] = self.normalize_orchestra(orchestra)
            if year:
                params['from'] = year
                params['to'] = year

            search_url = f"{self.SEARCH_URL}?{urlencode(params)}"
            print(f"  Searching: {search_url}")

            time.sleep(REQUEST_DELAY)
            response = self.session.get(search_url, timeout=15)

            # Check for rate limiting
            if response.status_code == 429:
                print("  Rate limited - waiting 30 seconds...")
                time.sleep(30)
                response = self.session.get(search_url, timeout=15)

            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            results = self._parse_search_results(soup, title, orchestra, year)

            self.cache[cache_key] = results
            return results

        except requests.RequestException as e:
            print(f"  Error searching el-recodo: {e}")
            return {
                'matched': False,
                'error': str(e)
            }

    def _parse_search_results(self, soup, title, orchestra, year):
        """Parse el-recodo search results page."""
        results = {
            'matched': False,
            'candidates': [],
            'best_match': None,
            'danceability': None,  # Requires login
            'popularity': None,    # Requires login
        }

        # el-recodo uses tables for results
        # Look for recording rows
        tables = soup.find_all('table')

        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) < 3:
                    continue

                # Extract data from cells
                row_text = ' '.join(cell.get_text().strip() for cell in cells)

                # Look for links to recording pages
                links = row.find_all('a')
                for link in links:
                    href = link.get('href', '')

                    # Recording pages typically have pattern like /music?id=XXX or /recording/XXX
                    if 'id=' in href or '/music' in href:
                        candidate = self._extract_candidate(row, cells, link, href)
                        if candidate:
                            # Score the match
                            score = self._score_match(candidate, title, orchestra, year)
                            candidate['score'] = score
                            if score > 0:
                                results['candidates'].append(candidate)

        # Sort by score and pick best
        if results['candidates']:
            results['candidates'].sort(key=lambda x: x['score'], reverse=True)
            best = results['candidates'][0]
            if best['score'] >= 0.5:
                results['matched'] = True
                results['best_match'] = best
                results['recording_id'] = best.get('id')
                results['url'] = best.get('url')

                # If logged in, could extract danceability here
                if self.logged_in:
                    # Would need to fetch individual recording page for full data
                    pass

        return results

    def _extract_candidate(self, row, cells, link, href):
        """Extract recording candidate from table row."""
        try:
            candidate = {
                'text': link.get_text().strip(),
                'url': f"{self.BASE_URL}{href}" if href.startswith('/') else href,
                'id': None,
                'title': None,
                'orchestra': None,
                'year': None,
                'singer': None,
            }

            # Try to extract ID from URL
            if 'id=' in href:
                match = re.search(r'id=(\d+)', href)
                if match:
                    candidate['id'] = match.group(1)

            # Try to parse cell contents
            for i, cell in enumerate(cells):
                text = cell.get_text().strip()
                # Year is usually 4 digits
                if re.match(r'^19\d{2}$', text):
                    candidate['year'] = int(text)
                # Orchestra might be in a link
                cell_links = cell.find_all('a')
                for cl in cell_links:
                    cl_href = cl.get('href', '')
                    if 'O=' in cl_href or 'orchestra' in cl_href.lower():
                        candidate['orchestra'] = cl.get_text().strip()

            return candidate

        except Exception as e:
            print(f"  Error extracting candidate: {e}")
            return None

    def _score_match(self, candidate, title, orchestra, year):
        """Score how well a candidate matches search criteria."""
        score = 0.0

        title_lower = title.lower() if title else ""
        candidate_text = (candidate.get('text', '') + ' ' + str(candidate)).lower()

        # Title match
        if title_lower and title_lower in candidate_text:
            score += 0.5
        elif title_lower:
            words = [w for w in title_lower.split() if len(w) > 3]
            if any(w in candidate_text for w in words):
                score += 0.3

        # Orchestra match
        if orchestra:
            orch_lower = orchestra.lower()
            if orch_lower in candidate_text:
                score += 0.3
            else:
                # Check last name
                parts = orchestra.split()
                if len(parts) > 1 and parts[-1].lower() in candidate_text:
                    score += 0.2

        # Year match
        if year and candidate.get('year') == year:
            score += 0.2
        elif year and str(year) in candidate_text:
            score += 0.1

        return score


def match_single_song(title, orchestra, year=None, session_cookie=None):
    """Match a single song against el-recodo."""
    matcher = ElRecodoMatcher(session_cookie=session_cookie)
    result = matcher.search(title, orchestra, year)
    return result


def main():
    """CLI interface for testing."""
    if len(sys.argv) < 3:
        print("Usage: python match_el_recodo.py <title> <orchestra> [year]")
        print('Example: python match_el_recodo.py "La Cumparsita" "Juan D\'Arienzo" 1951')
        print("\nNote: For full metadata (danceability, popularity), you need a paid account.")
        print("Set EL_RECODO_SESSION environment variable with your session cookie.")
        sys.exit(1)

    title = sys.argv[1]
    orchestra = sys.argv[2]
    year = int(sys.argv[3]) if len(sys.argv) > 3 else None

    # Check for session cookie
    import os
    session_cookie = os.environ.get('EL_RECODO_SESSION')

    print(f"\nSearching el-recodo.com for:")
    print(f"  Title: {title}")
    print(f"  Orchestra: {orchestra}")
    print(f"  Year: {year or 'any'}")
    print(f"  Logged in: {bool(session_cookie)}")
    print()

    result = match_single_song(title, orchestra, year, session_cookie)

    print("\nResult:")
    print(json.dumps(result, indent=2, default=str))

    if result.get('matched'):
        print(f"\n✓ MATCH FOUND: {result.get('url')}")
    else:
        print("\n✗ No match found")


if __name__ == "__main__":
    main()
