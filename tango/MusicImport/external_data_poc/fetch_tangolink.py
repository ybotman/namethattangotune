#!/usr/bin/env python3
"""
fetch_tangolink.py - Fetch TangoLink's "Most Famous Tangos" list from el-recodo

TangoLink is a curated list of the most famous/recognizable tangos,
publicly available on el-recodo.com. This is valuable reference data
for NTTT's recognition tier system.
"""

import requests
import time
import json
import re
from bs4 import BeautifulSoup
from pathlib import Path

REQUEST_DELAY = 3.0  # Be gentle with el-recodo

class TangoLinkFetcher:
    """Fetch the TangoLink 'Most Famous Tangos' list."""

    # Known TangoLink URL patterns to try
    TANGOLINK_URLS = [
        "https://www.el-recodo.com/tangolink",
        "https://www.el-recodo.com/music?tangolink",
        "https://www.el-recodo.com/music?page=tangolink",
    ]

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.5',
        })

    def fetch_list(self, max_retries=3):
        """
        Fetch the TangoLink most famous tangos list.

        Returns:
            dict with list of famous tangos and metadata
        """
        for url in self.TANGOLINK_URLS:
            print(f"Trying: {url}")

            for attempt in range(max_retries):
                try:
                    time.sleep(REQUEST_DELAY * (attempt + 1))
                    response = self.session.get(url, timeout=15)

                    if response.status_code == 429:
                        wait_time = 30 * (attempt + 1)
                        print(f"  Rate limited. Waiting {wait_time}s...")
                        time.sleep(wait_time)
                        continue

                    if response.status_code == 200:
                        return self._parse_tangolink_page(response.text, url)

                    print(f"  Status {response.status_code}")

                except requests.RequestException as e:
                    print(f"  Error: {e}")
                    time.sleep(REQUEST_DELAY * 2)

        return {'success': False, 'error': 'Could not fetch TangoLink from any URL'}

    def _parse_tangolink_page(self, html, url):
        """Parse the TangoLink page for famous tangos list."""
        soup = BeautifulSoup(html, 'html.parser')

        result = {
            'success': True,
            'source_url': url,
            'fetched_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'tangos': []
        }

        # Look for tables or lists with tango data
        tables = soup.find_all('table')

        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    tango = self._extract_tango_from_row(cells)
                    if tango:
                        result['tangos'].append(tango)

        # Also look for list items
        lists = soup.find_all(['ul', 'ol'])
        for lst in lists:
            items = lst.find_all('li')
            for item in items:
                tango = self._extract_tango_from_item(item)
                if tango:
                    result['tangos'].append(tango)

        # Deduplicate
        seen = set()
        unique_tangos = []
        for t in result['tangos']:
            key = f"{t.get('title', '')}|{t.get('orchestra', '')}"
            if key not in seen and t.get('title'):
                seen.add(key)
                unique_tangos.append(t)

        result['tangos'] = unique_tangos
        result['count'] = len(unique_tangos)

        return result

    def _extract_tango_from_row(self, cells):
        """Extract tango info from table row."""
        try:
            tango = {}

            for cell in cells:
                text = cell.get_text().strip()
                links = cell.find_all('a')

                # Check for year (4 digit number starting with 19)
                if re.match(r'^19\d{2}$', text):
                    tango['year'] = int(text)
                    continue

                # Check for orchestra link
                for link in links:
                    href = link.get('href', '')
                    link_text = link.get_text().strip()

                    if 'O=' in href or 'orchestra' in href.lower():
                        tango['orchestra'] = link_text
                    elif 'id=' in href or 'title' in href.lower():
                        tango['title'] = link_text
                        # Extract el-recodo ID
                        match = re.search(r'id=(\d+)', href)
                        if match:
                            tango['el_recodo_id'] = match.group(1)

                # If no link, might be plain text title/orchestra
                if not links and len(text) > 2 and text not in ['Tango', 'Vals', 'Milonga']:
                    if 'title' not in tango:
                        tango['title'] = text

            return tango if tango.get('title') else None

        except Exception as e:
            return None

    def _extract_tango_from_item(self, item):
        """Extract tango info from list item."""
        try:
            text = item.get_text().strip()
            links = item.find_all('a')

            tango = {'raw_text': text}

            for link in links:
                href = link.get('href', '')
                link_text = link.get_text().strip()

                if 'id=' in href:
                    tango['title'] = link_text
                    match = re.search(r'id=(\d+)', href)
                    if match:
                        tango['el_recodo_id'] = match.group(1)
                elif 'O=' in href:
                    tango['orchestra'] = link_text

            # Parse year from text
            year_match = re.search(r'\b(19\d{2})\b', text)
            if year_match:
                tango['year'] = int(year_match.group(1))

            return tango if tango.get('title') else None

        except Exception:
            return None


def fetch_tangolink_list(output_file=None):
    """Fetch TangoLink list and optionally save to file."""
    fetcher = TangoLinkFetcher()
    result = fetcher.fetch_list()

    if output_file and result.get('success'):
        output_path = Path(output_file)
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\nSaved {result.get('count', 0)} tangos to {output_file}")

    return result


def main():
    print("Fetching TangoLink 'Most Famous Tangos' list...")
    print("(This may take a while due to rate limiting)\n")

    output_file = Path(__file__).parent / "tangolink_famous.json"
    result = fetch_tangolink_list(str(output_file))

    if result.get('success'):
        print(f"\n✓ SUCCESS: Found {result.get('count', 0)} famous tangos")
        if result.get('tangos'):
            print("\nFirst 10 entries:")
            for t in result['tangos'][:10]:
                print(f"  - {t.get('title', '?')} / {t.get('orchestra', '?')} ({t.get('year', '?')})")
    else:
        print(f"\n✗ FAILED: {result.get('error', 'Unknown error')}")
        print("  You may need to try manually or wait for rate limits to reset")


if __name__ == "__main__":
    main()
