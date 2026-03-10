#!/usr/bin/env python3
"""
match_tango_info.py - Match NTTT songs against tango.info database

tango.info is an open tango music database with ~40,000 performances.
This script searches for matches by title + orchestra + year.
"""

import requests
import time
import re
import json
import sys
from urllib.parse import quote_plus
from bs4 import BeautifulSoup

# Rate limiting
REQUEST_DELAY = 1.5  # seconds between requests

class TangoInfoMatcher:
    BASE_URL = "https://tango.info"
    SEARCH_URL = "https://tango.info/eng/search"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
        self.cache = {}

    def normalize_title(self, title):
        """Normalize title for comparison."""
        if not title:
            return ""
        # Remove accents, lowercase, strip punctuation
        title = title.lower().strip()
        # Remove common prefixes/suffixes
        title = re.sub(r'^(el|la|los|las)\s+', '', title)
        # Remove punctuation
        title = re.sub(r'[^\w\s]', '', title)
        return title.strip()

    def normalize_orchestra(self, orchestra):
        """Normalize orchestra name for comparison."""
        if not orchestra:
            return ""
        orchestra = orchestra.lower().strip()
        # Common variations
        orchestra = orchestra.replace("'", "'").replace("'", "'")
        orchestra = re.sub(r'\s+', ' ', orchestra)
        return orchestra

    def search(self, title, orchestra=None, year=None):
        """
        Search tango.info for a recording.

        Args:
            title: Song title
            orchestra: Orchestra name (optional but recommended)
            year: Recording year (optional)

        Returns:
            dict with match results
        """
        # Build search query
        query_parts = [title]
        if orchestra:
            # Extract last name for better matching
            orchestra_parts = orchestra.split()
            if len(orchestra_parts) > 1:
                query_parts.append(orchestra_parts[-1])  # Last name
            else:
                query_parts.append(orchestra)

        query = " ".join(query_parts)
        cache_key = f"{query}|{year}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        try:
            # Search tango.info
            search_url = f"{self.SEARCH_URL}?q={quote_plus(query)}"
            print(f"  Searching: {search_url}")

            time.sleep(REQUEST_DELAY)
            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Look for performance/recording results
            results = self._parse_search_results(soup, title, orchestra, year)

            self.cache[cache_key] = results
            return results

        except requests.RequestException as e:
            print(f"  Error searching tango.info: {e}")
            return {
                'matched': False,
                'error': str(e)
            }

    def _parse_search_results(self, soup, title, orchestra, year):
        """Parse search results page for matches."""
        results = {
            'matched': False,
            'candidates': [],
            'best_match': None
        }

        # Look for tables with results
        tables = soup.find_all('table')

        normalized_title = self.normalize_title(title)
        normalized_orchestra = self.normalize_orchestra(orchestra) if orchestra else None

        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) < 2:
                    continue

                # Look for links that might be recordings
                links = row.find_all('a')
                for link in links:
                    href = link.get('href', '')
                    text = link.get_text().strip()

                    # Check if this looks like a recording/performance link
                    if '/eng/' in href and text:
                        candidate = {
                            'text': text,
                            'url': f"{self.BASE_URL}{href}" if href.startswith('/') else href,
                            'id': href.split('/')[-1] if '/' in href else None
                        }

                        # Score the match
                        score = self._score_match(text, normalized_title, normalized_orchestra, year)
                        candidate['score'] = score

                        if score > 0:
                            results['candidates'].append(candidate)

        # Sort by score and pick best
        if results['candidates']:
            results['candidates'].sort(key=lambda x: x['score'], reverse=True)
            best = results['candidates'][0]
            if best['score'] >= 0.5:  # Threshold for "matched"
                results['matched'] = True
                results['best_match'] = best
                results['tinp'] = best.get('id')
                results['url'] = best.get('url')

        return results

    def _score_match(self, text, normalized_title, normalized_orchestra, year):
        """Score how well a result matches our search criteria."""
        score = 0.0
        text_lower = text.lower()

        # Title match (most important)
        if normalized_title in text_lower:
            score += 0.5
        elif any(word in text_lower for word in normalized_title.split() if len(word) > 3):
            score += 0.3

        # Orchestra match
        if normalized_orchestra:
            if normalized_orchestra in text_lower:
                score += 0.3
            elif any(word in text_lower for word in normalized_orchestra.split() if len(word) > 3):
                score += 0.15

        # Year match
        if year:
            if str(year) in text:
                score += 0.2

        return score


def match_single_song(title, orchestra, year=None):
    """Match a single song against tango.info."""
    matcher = TangoInfoMatcher()
    result = matcher.search(title, orchestra, year)
    return result


def main():
    """CLI interface for testing."""
    if len(sys.argv) < 3:
        print("Usage: python match_tango_info.py <title> <orchestra> [year]")
        print('Example: python match_tango_info.py "La Cumparsita" "Juan D\'Arienzo" 1951')
        sys.exit(1)

    title = sys.argv[1]
    orchestra = sys.argv[2]
    year = int(sys.argv[3]) if len(sys.argv) > 3 else None

    print(f"\nSearching tango.info for:")
    print(f"  Title: {title}")
    print(f"  Orchestra: {orchestra}")
    print(f"  Year: {year or 'any'}")
    print()

    result = match_single_song(title, orchestra, year)

    print("\nResult:")
    print(json.dumps(result, indent=2))

    if result.get('matched'):
        print(f"\n✓ MATCH FOUND: {result.get('url')}")
    else:
        print("\n✗ No match found")


if __name__ == "__main__":
    main()
