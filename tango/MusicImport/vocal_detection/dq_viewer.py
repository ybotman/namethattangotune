#!/usr/bin/env python3
"""Data Quality Viewer - localhost:5001"""

import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from collections import Counter, defaultdict
import os

os.chdir('/Users/tobybalsley/MyDocs/AppDev/tunes/tango/MusicImport')

with open('djLibrary.json') as f:
    raw_data = json.load(f)

with open('djSongsFiltered_boris.json') as f:
    filtered_data = json.load(f)

try:
    with open('vocal_detection/vocalAnalysis.json') as f:
        vocal_data = json.load(f)
except:
    vocal_data = {}

# Load app song data for singer info
try:
    with open('../NTTT-app/public/songData/djSongs.json') as f:
        app_songs = json.load(f)['songs']
except:
    app_songs = []

# Build Singer × Orchestra matrix
singer_orch_matrix = defaultdict(lambda: defaultdict(int))
for s in app_songs:
    singer = s.get('Singer')
    orch = s.get('Orchestra', '')
    if singer and ' - ' in orch:
        orchestra = orch.split(' - ')[0].strip()
        singer_orch_matrix[singer][orchestra] += 1

# Get top singers and orchestras for the scatter
singer_totals = {s: sum(o.values()) for s, o in singer_orch_matrix.items()}
top_singers_list = [s for s, _ in sorted(singer_totals.items(), key=lambda x: x[1], reverse=True)[:30]]

orch_totals_scatter = defaultdict(int)
for singer, orchs in singer_orch_matrix.items():
    for orch, cnt in orchs.items():
        orch_totals_scatter[orch] += cnt
top_orchs_list = [o for o, _ in sorted(orch_totals_scatter.items(), key=lambda x: x[1], reverse=True)[:12]]

# === HELPER: Is this a cortina? ===
def is_cortina(s):
    title = (s.get('title') or s.get('songTitleClean') or s.get('Title') or '').lower()
    artist = (s.get('artist') or s.get('artistMaster') or s.get('Orchestra') or '').lower()
    return 'cortina' in title or 'cortina' in artist

# === SEPARATE CORTINAS ===
cortinas = [s for s in raw_data if is_cortina(s)]
non_cortina_raw = [s for s in raw_data if not is_cortina(s)]

# === ANALYSIS ===

# 1. Unrated but played (EXCLUDING cortinas)
unrated_played = sorted(
    [s for s in non_cortina_raw if s.get('rating', 0) == 0 and s.get('timesplayed', 0) > 0],
    key=lambda x: x.get('timesplayed', 0), reverse=True
)
by_artist_unrated = defaultdict(list)
for s in unrated_played:
    by_artist_unrated[s.get('artist', '(unknown)') or '(unknown)'].append(s)

# 2. High rated but unplayed
high_unplayed = sorted(
    [s for s in filtered_data if s.get('rating', 0) >= 4 and s.get('timesplayed', 0) == 0],
    key=lambda x: (x.get('rating', 0), x.get('artistMaster', '')), reverse=True
)
by_artist_high = defaultdict(list)
for s in high_unplayed:
    by_artist_high[s.get('artistMaster', '(unknown)') or '(unknown)'].append(s)

# 3. Cross-tab
def play_bucket(p):
    if p == 0: return "0"
    if p <= 5: return "1-5"
    if p <= 10: return "6-10"
    return "11+"

cross = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
for r in filtered_data:
    cross[r.get('priorityTier', '?')][r.get('rating', 0)][play_bucket(r.get('timesplayed', 0))] += 1

ratings = Counter(r.get('rating', 0) for r in filtered_data)
priority_tiers = Counter(r.get('priorityTier', '?') for r in filtered_data)
plays_detail = {i: sum(1 for r in filtered_data if r.get('timesplayed', 0) == i) for i in range(26)}

# Year by year (not decades)
years = defaultdict(int)
for r in filtered_data:
    y = r.get('year')
    if y:
        try:
            yr = int(y)
            if 1900 <= yr <= 2030:
                years[yr] += 1
        except: pass
years = dict(sorted(years.items()))

# Year × Star crosstab for bubble chart
year_star_cross = defaultdict(lambda: defaultdict(int))
for r in filtered_data:
    y = r.get('year')
    star = r.get('rating', 0)
    if y and star:
        try:
            yr = int(y)
            if 1920 <= yr <= 2025:
                year_star_cross[yr][star] += 1
        except: pass

styles = dict(Counter(r.get('style', '(none)') for r in filtered_data).most_common(10))
top_artists = dict(Counter(r.get('artistMaster', '(none)') for r in filtered_data if r.get('artistMaster')).most_common(25))

# 4. Singer analysis
singer_songs = []
instr_songs = []
for s in filtered_data:
    vocal = vocal_data.get(s.get('songID'))
    if vocal:
        s_copy = s.copy()
        s_copy['hasSinger'] = vocal.get('hasSinger', False)
        if vocal.get('hasSinger'):
            singer_songs.append(s_copy)
        else:
            instr_songs.append(s_copy)

singer_by_orch = defaultdict(lambda: {'singer': 0, 'instr': 0})
for s in singer_songs:
    singer_by_orch[s.get('artistMaster', '(unknown)')]['singer'] += 1
for s in instr_songs:
    singer_by_orch[s.get('artistMaster', '(unknown)')]['instr'] += 1

singer_by_decade = defaultdict(lambda: {'singer': 0, 'instr': 0})
for s in singer_songs + instr_songs:
    y = s.get('year')
    if y:
        try:
            dec = (int(y) // 10) * 10
            if 1920 <= dec <= 2020:
                key = 'singer' if s.get('hasSinger') else 'instr'
                singer_by_decade[dec][key] += 1
        except: pass

singer_by_style = defaultdict(lambda: {'singer': 0, 'instr': 0})
for s in singer_songs:
    singer_by_style[s.get('style', '(none)')]['singer'] += 1
for s in instr_songs:
    singer_by_style[s.get('style', '(none)')]['instr'] += 1

# 5. Vocal percentage analysis (for singer songs)
import statistics

vocal_pct_by_orch = defaultdict(list)
vocal_pct_by_year = defaultdict(list)

for s in filtered_data:
    v = vocal_data.get(s.get('songID'))
    if v and v.get('hasSinger'):
        pct = v.get('vocalPercentage', 0)
        orch = s.get('artistMaster', '(unknown)')
        year = s.get('year')

        vocal_pct_by_orch[orch].append(pct)
        if year:
            try:
                yr = int(year)
                if 1920 <= yr <= 2025:
                    vocal_pct_by_year[yr].append(pct)
            except: pass

# Calculate stats per orchestra
orch_vocal_stats = []
for orch, pcts in vocal_pct_by_orch.items():
    if len(pcts) >= 3:
        orch_vocal_stats.append({
            'orch': orch,
            'n': len(pcts),
            'avg': statistics.mean(pcts),
            'std': statistics.stdev(pcts) if len(pcts) > 1 else 0,
            'min': min(pcts),
            'max': max(pcts)
        })
orch_vocal_stats.sort(key=lambda x: x['n'], reverse=True)

# Calculate stats per year
year_vocal_stats = []
for yr, pcts in sorted(vocal_pct_by_year.items()):
    if len(pcts) >= 3:
        year_vocal_stats.append({
            'year': yr,
            'n': len(pcts),
            'avg': statistics.mean(pcts),
            'std': statistics.stdev(pcts) if len(pcts) > 1 else 0
        })

# 6. Cortina analysis
cortina_played = [c for c in cortinas if c.get('timesplayed', 0) > 0]
cortina_by_artist = defaultdict(list)
for c in cortinas:
    cortina_by_artist[c.get('artist', '(unknown)') or '(unknown)'].append(c)

# === BUILD HTML ===
tier_colors = {'A': '#00ff88', 'B': '#00d9ff', 'C': '#ff8800'}
play_buckets_list = ["0", "1-5", "6-10", "11+"]

all_vals = [cross[t][s][pb] for t in ['A','B','C'] for s in range(1,6) for pb in play_buckets_list]
max_val = max(all_vals) if all_vals else 1

def cell_color(val):
    if val == 0: return "#1a1a2e"
    intensity = min(val / max_val, 1.0)
    if intensity < 0.33: return f"rgba(0, 217, 255, {0.3 + intensity})"
    elif intensity < 0.66: return f"rgba(255, 215, 0, {0.3 + intensity})"
    return f"rgba(255, 100, 100, {0.3 + intensity})"

cross_html = """<table style="border-collapse:collapse;width:100%;text-align:center;">
    <tr><th></th><th></th><th colspan="4" style="color:#ffd700;border-bottom:2px solid #ffd700;">Play Count</th><th></th></tr>
    <tr><th style="color:#888;">Tier</th><th style="color:#888;">Star</th>
        <th style="width:70px;">0</th><th style="width:70px;">1-5</th><th style="width:70px;">6-10</th><th style="width:70px;">11+</th>
        <th style="color:#888;">Total</th></tr>"""
for tier in ['A', 'B', 'C']:
    first_row = True
    for star in [5, 4, 3, 2, 1]:
        row = cross[tier][star]
        total = sum(row.values())
        if total > 0:
            cross_html += f"""<tr style="border-bottom:1px solid #333;">
                <td style="padding:6px;color:{tier_colors[tier]};font-weight:bold;font-size:1.2em;">{tier if first_row else ''}</td>
                <td>{"⭐"*star}</td>
                <td style="background:{cell_color(row['0'])};">{row['0'] or '-'}</td>
                <td style="background:{cell_color(row['1-5'])};">{row['1-5'] or '-'}</td>
                <td style="background:{cell_color(row['6-10'])};">{row['6-10'] or '-'}</td>
                <td style="background:{cell_color(row['11+'])};">{row['11+'] or '-'}</td>
                <td style="color:#888;">{total:,}</td></tr>"""
            first_row = False
    cross_html += '<tr><td colspan="7" style="height:8px;"></td></tr>'
cross_html += "</table>"

def make_bars(data, max_val, color="#00d9ff"):
    return ''.join(f'''<div style="display:flex;align-items:center;margin:3px 0;">
        <span style="width:60px;text-align:right;padding-right:8px;color:#888;">{label}</span>
        <div style="flex:1;background:#1f4068;height:20px;border-radius:3px;overflow:hidden;">
            <div style="width:{(val/max_val)*100 if max_val else 0}%;height:100%;background:{color};"></div></div>
        <span style="width:55px;text-align:right;padding-left:8px;font-family:monospace;">{val:,}</span></div>''' for label, val in data.items())

rating_bars = make_bars({f"{'⭐'*i}": ratings.get(i,0) for i in range(5,0,-1)}, max(ratings.values()) if ratings else 1, "#ffd700")
tier_bars = ''.join(f'''<div style="display:flex;align-items:center;margin:4px 0;">
    <span style="width:40px;text-align:center;font-weight:bold;font-size:1.2em;color:{tier_colors[t]};">{t}</span>
    <div style="flex:1;background:#1f4068;height:26px;border-radius:3px;overflow:hidden;">
        <div style="width:{(priority_tiers.get(t,0)/max(priority_tiers.values()))*100 if priority_tiers else 0}%;height:100%;background:{tier_colors[t]};"></div></div>
    <span style="width:60px;text-align:right;padding-left:10px;font-family:monospace;">{priority_tiers.get(t,0):,}</span></div>''' for t in ['A','B','C'])

max_play = max(plays_detail.values()) if plays_detail else 1
play_bars = ''.join(f'''<div style="display:flex;align-items:center;margin:1px 0;">
    <span style="width:25px;text-align:right;padding-right:5px;color:#888;font-size:0.8em;">{i}</span>
    <div style="flex:1;background:#1f4068;height:14px;border-radius:2px;overflow:hidden;">
        <div style="width:{(plays_detail.get(i,0)/max_play)*100}%;height:100%;background:{'#ff4444' if i==0 else '#00d9ff'};"></div></div>
    <span style="width:45px;text-align:right;padding-left:5px;font-family:monospace;font-size:0.8em;">{plays_detail.get(i,0):,}</span></div>''' for i in range(26))

# Year bars - show all years with visual bars
max_year_count = max(years.values()) if years else 1
year_bars_html = '<div style="display:flex;flex-wrap:wrap;gap:2px;">'
for yr, cnt in years.items():
    height = max(4, int((cnt / max_year_count) * 80))
    color = '#ffd700' if 1935 <= yr <= 1945 else '#9966ff'  # Golden age highlight
    year_bars_html += f'<div style="display:flex;flex-direction:column;align-items:center;width:18px;" title="{yr}: {cnt} songs"><div style="width:14px;height:{height}px;background:{color};border-radius:2px;"></div><span style="font-size:0.55em;color:#666;transform:rotate(-60deg);white-space:nowrap;margin-top:8px;">{yr}</span></div>'
year_bars_html += '</div>'

# Year × Star bubble chart
star_colors = {1: '#666', 2: '#888', 3: '#00d9ff', 4: '#ffd700', 5: '#ff6b9d'}
year_star_html = '<div style="position:relative;overflow-x:auto;padding:10px 0;">'
year_star_html += '<div style="display:flex;gap:1px;align-items:flex-end;">'

all_counts = [year_star_cross[yr][s] for yr in year_star_cross for s in range(1,6)]
max_count = max(all_counts) if all_counts else 1

for yr in sorted(year_star_cross.keys()):
    if 1925 <= yr <= 1965:
        year_star_html += f'<div style="display:flex;flex-direction:column;align-items:center;width:20px;">'
        for star in [5, 4, 3, 2, 1]:
            cnt = year_star_cross[yr][star]
            if cnt > 0:
                size = max(4, int((cnt / max_count) ** 0.5 * 28))
                year_star_html += f'<div style="width:{size}px;height:{size}px;background:{star_colors[star]};border-radius:50%;margin:1px;" title="{yr}: {cnt} songs at {star}⭐"></div>'
        year_star_html += f'<span style="font-size:0.5em;color:#666;margin-top:3px;transform:rotate(-60deg);white-space:nowrap;">{yr}</span></div>'

year_star_html += '</div><div style="display:flex;gap:10px;margin-top:10px;font-size:0.7em;">'
for s in [5,4,3,2,1]:
    year_star_html += f'<span><span style="display:inline-block;width:8px;height:8px;background:{star_colors[s]};border-radius:50%;"></span> {s}⭐</span>'
year_star_html += '</div></div>'

style_rows = ''.join(f'<tr><td>{s}</td><td class="num">{c:,}</td></tr>' for s,c in styles.items())
artist_rows = ''.join(f'<tr><td>{a[:28]}</td><td class="num">{c:,}</td></tr>' for a,c in top_artists.items())

unrated_artist_rows = ''.join(f'<tr><td>{a[:32]}</td><td class="num">{len(ss)}</td><td class="num">{sum(s.get("timesplayed",0) for s in ss)}</td><td class="num">{max(s.get("timesplayed",0) for s in ss)}</td></tr>' for a,ss in sorted(by_artist_unrated.items(), key=lambda x: sum(s.get('timesplayed',0) for s in x[1]), reverse=True)[:30])
unrated_songs_rows = ''.join(f'<tr><td class="num" style="color:#ff4444;font-weight:bold;">{s.get("timesplayed",0)}</td><td>{(s.get("artist","") or "")[:26]}</td><td>{(s.get("title","") or "")[:30]}</td><td style="color:#888;">{(s.get("genre","") or "")[:12]}</td></tr>' for s in unrated_played[:60])
high_artist_rows = ''.join(f'<tr><td>{a[:32]}</td><td class="num">{len(ss)}</td><td class="num">{sum(1 for s in ss if s.get("rating")==5)}</td><td class="num">{sum(1 for s in ss if s.get("rating")==4)}</td></tr>' for a,ss in sorted(by_artist_high.items(), key=lambda x: len(x[1]), reverse=True)[:30])
high_songs_rows = ''.join(f'<tr><td style="color:#ffd700;">{"⭐"*s.get("rating",0)}</td><td>{s.get("priorityTier","?")}</td><td>{(s.get("artistMaster","") or "")[:24]}</td><td>{(s.get("songTitleClean","") or "")[:28]}</td><td style="color:#888;">{s.get("style","")}</td></tr>' for s in high_unplayed[:80])

# Singer rows
def stacked_bar(singer, instr, max_total):
    total = singer + instr
    if total == 0: return ""
    w = (total / max_total) * 100 if max_total else 0
    s_pct = (singer / total) * 100
    return f'<div style="width:{w}%;display:flex;height:20px;border-radius:3px;overflow:hidden;"><div style="width:{s_pct}%;background:#ff6b9d;"></div><div style="width:{100-s_pct}%;background:#6bffb8;"></div></div>'

sorted_orch = sorted(singer_by_orch.items(), key=lambda x: x[1]['singer']+x[1]['instr'], reverse=True)[:25]
max_orch = max(v['singer']+v['instr'] for _,v in sorted_orch) if sorted_orch else 1
orch_singer_rows = ''.join(f'<tr><td>{o[:28]}</td><td class="num" style="color:#ff6b9d;">{v["singer"]}</td><td class="num" style="color:#6bffb8;">{v["instr"]}</td><td style="width:200px;">{stacked_bar(v["singer"], v["instr"], max_orch)}</td></tr>' for o,v in sorted_orch)

sorted_dec = sorted(singer_by_decade.items())
max_dec = max(v['singer']+v['instr'] for _,v in sorted_dec) if sorted_dec else 1
decade_singer_rows = ''.join(f'<tr><td>{d}s</td><td class="num" style="color:#ff6b9d;">{v["singer"]}</td><td class="num" style="color:#6bffb8;">{v["instr"]}</td><td style="width:200px;">{stacked_bar(v["singer"], v["instr"], max_dec)}</td></tr>' for d,v in sorted_dec)

sorted_style = sorted(singer_by_style.items(), key=lambda x: x[1]['singer']+x[1]['instr'], reverse=True)
max_style = max(v['singer']+v['instr'] for _,v in sorted_style) if sorted_style else 1
style_singer_rows = ''.join(f'<tr><td>{s}</td><td class="num" style="color:#ff6b9d;">{v["singer"]}</td><td class="num" style="color:#6bffb8;">{v["instr"]}</td><td style="width:200px;">{stacked_bar(v["singer"], v["instr"], max_style)}</td></tr>' for s,v in sorted_style)

# Orchestra × Period singer usage heatmap
orch_period_singer = defaultdict(lambda: defaultdict(lambda: {'singer': 0, 'instr': 0}))
for s in filtered_data:
    v = vocal_data.get(s.get('songID'))
    if v:
        orch = s.get('artistMaster', '(unknown)')
        year = s.get('year')
        if year:
            try:
                yr = int(year)
                if 1925 <= yr <= 1965:
                    period = ((yr - 1925) // 5) * 5 + 1925  # 5-year periods
                    key = 'singer' if v.get('hasSinger') else 'instr'
                    orch_period_singer[orch][period][key] += 1
            except: pass

# Get top orchestras for heatmap
orch_totals = {o: sum(sum(p.values()) for p in periods.values()) for o, periods in orch_period_singer.items()}
top_orch_list = [o for o, _ in sorted(orch_totals.items(), key=lambda x: x[1], reverse=True)[:18] if o]

periods_list = [1925, 1930, 1935, 1940, 1945, 1950, 1955, 1960]

def pct_color(pct):
    if pct is None: return '#1a1a2e'
    if pct >= 80: return '#ff6b9d'
    if pct >= 60: return '#ff9966'
    if pct >= 40: return '#ffcc66'
    if pct >= 20: return '#99cc99'
    return '#6bffb8'

orch_heatmap_html = '<table style="font-size:0.8em;"><tr><th style="text-align:left;">Orchestra</th>'
for p in periods_list:
    orch_heatmap_html += f'<th style="width:50px;text-align:center;font-size:0.8em;">{p}-{p+4}</th>'
orch_heatmap_html += '</tr>'

for orch in top_orch_list:
    orch_heatmap_html += f'<tr><td style="white-space:nowrap;">{orch[:22]}</td>'
    for period in periods_list:
        data = orch_period_singer[orch][period]
        total = data['singer'] + data['instr']
        if total > 0:
            pct = data['singer'] / total * 100
            orch_heatmap_html += f'<td style="text-align:center;background:{pct_color(pct)};color:#000;font-weight:bold;" title="{orch} {period}-{period+4}: {pct:.0f}% singer ({total} songs)">{pct:.0f}%</td>'
        else:
            orch_heatmap_html += '<td style="text-align:center;color:#444;">-</td>'
    orch_heatmap_html += '</tr>'
orch_heatmap_html += '</table>'

# Singer × Orchestra scatter/bubble chart
# Calculate distinct counts
singer_distinct_orch = {s: len([o for o in top_orchs_list if singer_orch_matrix[s].get(o, 0) > 0]) for s in top_singers_list}
orch_distinct_singer = {o: len([s for s in top_singers_list if singer_orch_matrix[s].get(o, 0) > 0]) for o in top_orchs_list}

# Count instrumental songs per orchestra
orch_instrumental = defaultdict(int)
orch_with_singer = defaultdict(int)
for s in app_songs:
    orch = s.get('Orchestra', '')
    if ' - ' in orch:
        orchestra = orch.split(' - ')[0].strip()
        singer_name = orch.split(' - ')[1].strip()
        if singer_name.lower() == 'instrumental':
            orch_instrumental[orchestra] += 1
        else:
            orch_with_singer[orchestra] += 1

singer_orch_html = '<div style="overflow-x:auto;"><table style="font-size:0.75em;border-collapse:collapse;">'

# Header row with orchestra names
singer_orch_html += '<tr><th style="text-align:left;position:sticky;left:0;background:#16213e;z-index:1;">Singer</th>'
for orch in top_orchs_list:
    short_name = orch.replace('Francisco ', 'F.').replace('Carlos ', 'C.').replace('Alfredo ', 'A.')[:10]
    singer_orch_html += f'<th style="writing-mode:vertical-rl;text-orientation:mixed;height:80px;padding:5px;font-size:0.8em;">{short_name}</th>'
singer_orch_html += '<th style="text-align:center;background:#2d2d1f;color:#ffd700;padding:5px;">Orchs</th></tr>'

# Distinct singers per orchestra row (top)
singer_orch_html += '<tr style="background:#1f2d2d;"><td style="position:sticky;left:0;background:#1f2d2d;font-weight:bold;color:#6bffb8;">🎤 Singers</td>'
for orch in top_orchs_list:
    cnt = orch_distinct_singer[orch]
    singer_orch_html += f'<td style="text-align:center;font-weight:bold;color:#6bffb8;">{cnt}</td>'
singer_orch_html += '<td style="color:#888;font-size:0.8em;">distinct</td></tr>'

# Instrumental songs per orchestra row
singer_orch_html += '<tr style="background:#2d2d1f;"><td style="position:sticky;left:0;background:#2d2d1f;font-weight:bold;color:#ffcc66;">🎹 Instrumental</td>'
for orch in top_orchs_list:
    cnt = orch_instrumental.get(orch, 0)
    singer_orch_html += f'<td style="text-align:center;color:#ffcc66;">{cnt if cnt > 0 else "·"}</td>'
singer_orch_html += '<td style="color:#888;font-size:0.8em;">songs</td></tr>'

# With singer songs per orchestra row
singer_orch_html += '<tr style="background:#2d1f2d;"><td style="position:sticky;left:0;background:#2d1f2d;font-weight:bold;color:#ff6b9d;">🎤 With Singer</td>'
for orch in top_orchs_list:
    cnt = orch_with_singer.get(orch, 0)
    singer_orch_html += f'<td style="text-align:center;color:#ff6b9d;">{cnt if cnt > 0 else "·"}</td>'
singer_orch_html += '<td style="color:#888;font-size:0.8em;">songs</td></tr>'

# Separator
singer_orch_html += '<tr><td colspan="14" style="height:8px;border-bottom:2px solid #444;"></td></tr>'

max_bubble = max(singer_orch_matrix[s][o] for s in top_singers_list for o in top_orchs_list) if top_singers_list else 1

for singer in top_singers_list:
    distinct = singer_distinct_orch[singer]
    singer_orch_html += f'<tr><td style="white-space:nowrap;position:sticky;left:0;background:#16213e;padding-right:10px;">{singer[:22]}</td>'
    for orch in top_orchs_list:
        cnt = singer_orch_matrix[singer].get(orch, 0)
        if cnt > 0:
            size = max(8, int((cnt / max_bubble) ** 0.5 * 35))
            color = f'hsl({(hash(singer) % 360)}, 70%, 60%)'
            singer_orch_html += f'<td style="text-align:center;"><div style="width:{size}px;height:{size}px;background:{color};border-radius:50%;margin:auto;display:flex;align-items:center;justify-content:center;font-size:0.7em;color:#000;font-weight:bold;" title="{singer} + {orch}: {cnt} songs">{cnt}</div></td>'
        else:
            singer_orch_html += '<td style="text-align:center;color:#333;">·</td>'
    # Distinct orchestras for this singer
    color = '#ff6b9d' if distinct > 1 else '#888'
    singer_orch_html += f'<td style="text-align:center;font-weight:bold;color:{color};background:#2d2d1f;">{distinct}</td>'
    singer_orch_html += '</tr>'

singer_orch_html += '</table></div>'

# Cortina rows
cortina_artist_rows = ''.join(f'<tr><td>{a[:35]}</td><td class="num">{len(ss)}</td><td class="num">{sum(s.get("timesplayed",0) for s in ss)}</td></tr>' for a,ss in sorted(cortina_by_artist.items(), key=lambda x: len(x[1]), reverse=True)[:20])
cortina_played_rows = ''.join(f'<tr><td class="num">{s.get("timesplayed",0)}</td><td>{(s.get("artist","") or "")[:25]}</td><td>{(s.get("title","") or "")[:35]}</td></tr>' for s in sorted(cortina_played, key=lambda x: x.get('timesplayed',0), reverse=True)[:30])

# Vocal % by Orchestra chart (bar with error bars)
orch_vocal_html = ""
for stat in orch_vocal_stats[:20]:
    avg = stat['avg']
    std = stat['std']
    lo = max(0, avg - std)
    hi = min(100, avg + std)
    orch_vocal_html += f'''<tr>
        <td>{stat['orch'][:25]}</td>
        <td class="num">{stat['n']}</td>
        <td class="num">{avg:.0f}%</td>
        <td class="num" style="color:#888;">±{std:.0f}</td>
        <td style="width:200px;position:relative;">
            <div style="position:absolute;left:{lo}%;width:{hi-lo}%;height:16px;background:rgba(255,107,157,0.3);border-radius:3px;top:2px;"></div>
            <div style="position:absolute;left:{avg}%;width:3px;height:20px;background:#ff6b9d;border-radius:2px;top:0;margin-left:-1px;"></div>
            <div style="width:100%;height:20px;background:#1f4068;border-radius:3px;"></div>
        </td>
    </tr>'''

# Vocal % by Year chart (trend line with Y-axis scale)
year_vocal_html = '<div style="display:flex;position:relative;height:140px;">'
# Y-axis
year_vocal_html += '<div style="display:flex;flex-direction:column;justify-content:space-between;padding-right:5px;font-size:0.7em;color:#888;height:100px;">'
for pct in [100, 75, 50, 25, 0]:
    year_vocal_html += f'<span>{pct}%</span>'
year_vocal_html += '</div>'
# Bars
year_vocal_html += '<div style="display:flex;align-items:flex-end;gap:2px;height:100px;border-left:1px solid #444;border-bottom:1px solid #444;padding-left:5px;flex:1;">'
if year_vocal_stats:
    for stat in year_vocal_stats:
        height = stat['avg']  # Direct % mapping
        err_height = stat['std'] / 2
        color = '#ff6b9d' if stat['avg'] > 50 else '#ffaa66'
        year_vocal_html += f'''<div style="display:flex;flex-direction:column;align-items:center;position:relative;" title="{stat['year']}: {stat['avg']:.0f}% ± {stat['std']:.0f}">
            <div style="position:absolute;bottom:{max(0,height-err_height)}px;width:2px;height:{err_height*2}px;background:rgba(255,255,255,0.3);"></div>
            <div style="width:10px;height:{height}px;background:{color};border-radius:2px 2px 0 0;"></div>
            <span style="font-size:0.45em;color:#666;transform:rotate(-60deg);position:absolute;bottom:-18px;white-space:nowrap;">{stat['year']}</span>
        </div>'''
year_vocal_html += '</div></div>'

analyzed_count = len(singer_songs) + len(instr_songs)
singer_pct = (len(singer_songs) / analyzed_count * 100) if analyzed_count else 0

HTML = f"""<!DOCTYPE html>
<html>
<head>
    <title>NTTT Data Analysis</title>
    <style>
        body {{ font-family: -apple-system, system-ui, sans-serif; max-width: 1500px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #eee; }}
        h1 {{ color: #00d9ff; }} h2 {{ color: #ffd700; margin-top: 25px; }} h3 {{ color: #00d9ff; margin-top: 0; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }}
        .grid3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }}
        .card {{ background: #16213e; padding: 18px; border-radius: 8px; }}
        table {{ width: 100%; border-collapse: collapse; }} th, td {{ padding: 5px 8px; text-align: left; border-bottom: 1px solid #333; }}
        th {{ color: #ffd700; }} .num {{ text-align: right; font-family: monospace; }}
        .big-num {{ font-size: 1.9em; color: #00d9ff; font-weight: bold; }}
        .summary-grid {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }}
        .summary-item {{ background: #16213e; padding: 12px; border-radius: 8px; text-align: center; }}
        .summary-label {{ color: #888; font-size: 0.75em; margin-top: 4px; }}
        .tabs {{ display: flex; gap: 4px; margin-bottom: 15px; flex-wrap: wrap; }}
        .tab {{ padding: 8px 14px; background: #16213e; border-radius: 6px 6px 0 0; cursor: pointer; border: none; color: #888; font-size: 0.85em; }}
        .tab:hover {{ background: #1f3050; }} .tab.active {{ background: #1f4068; color: #00d9ff; }}
        .tab-content {{ display: none; }} .tab-content.active {{ display: block; }}
        .scroll {{ max-height: 350px; overflow-y: auto; }}
        .legend {{ display: flex; gap: 15px; margin: 12px 0; font-size: 0.9em; }}
        .legend-item {{ display: flex; align-items: center; gap: 6px; }}
        .legend-box {{ width: 16px; height: 16px; border-radius: 3px; }}
        .warn {{ background: #3d2d1f; border-left: 4px solid #ff8800; padding: 10px; margin: 10px 0; border-radius: 0 6px 6px 0; }}
    </style>
</head>
<body>
    <h1>📊 NTTT Song Data Analysis</h1>
    <div class="tabs">
        <button class="tab active" onclick="showTab('overview')">📈 Overview</button>
        <button class="tab" onclick="showTab('unrated')">❓ Unrated+Played ({len(unrated_played):,})</button>
        <button class="tab" onclick="showTab('sleeping')">😴 High+Unplayed ({len(high_unplayed):,})</button>
        <button class="tab" onclick="showTab('singers')">🎤 Singers ({analyzed_count:,})</button>
        <button class="tab" onclick="showTab('cortinas')">🎬 Cortinas ({len(cortinas):,})</button>
    </div>

    <!-- OVERVIEW -->
    <div id="overview" class="tab-content active">
        <div class="summary-grid">
            <div class="summary-item"><div class="big-num">{len(filtered_data):,}</div><div class="summary-label">Rated Songs</div></div>
            <div class="summary-item"><div class="big-num" style="color:#00ff88;">{priority_tiers.get('A',0):,}</div><div class="summary-label">Priority A</div></div>
            <div class="summary-item"><div class="big-num" style="color:#ffd700;">{ratings.get(5,0)+ratings.get(4,0):,}</div><div class="summary-label">4-5 Star</div></div>
            <div class="summary-item"><div class="big-num">{sum(1 for r in filtered_data if r.get('rating',0)>=3):,}</div><div class="summary-label">3-5⭐ Quiz Pool</div></div>
            <div class="summary-item"><div class="big-num">{len(top_artists)}</div><div class="summary-label">Orchestras</div></div>
        </div>
        <h2>🔥 Priority × Star × Play Count</h2>
        <div class="card">{cross_html}</div>
        <div class="grid" style="margin-top:20px;">
            <div class="card"><h3>⭐ Star Rating</h3>{rating_bars}</div>
            <div class="card"><h3>🎯 Priority Tier</h3>{tier_bars}</div>
        </div>
        <h2>▶️ Play Count (0-25)</h2>
        <div class="card">{play_bars}</div>
        <div class="grid3" style="margin-top:20px;">
            <div class="card" style="grid-column: span 3;"><h3>📅 Year Recorded (Golden Age 1935-1945 highlighted)</h3>{year_bars_html}</div>
        </div>
        <h2>🎯 Year × Star Rating (bubble = count)</h2>
        <div class="card">{year_star_html}
            <div class="card"><h3>🎵 Style</h3><table>{style_rows}</table></div>
            <div class="card"><h3>🎻 Orchestras</h3><div class="scroll"><table>{artist_rows}</table></div></div>
        </div>
    </div>

    <!-- UNRATED -->
    <div id="unrated" class="tab-content">
        <div class="warn">⚠️ Cortinas excluded from this analysis ({len(cortinas)} cortinas filtered out)</div>
        <div class="summary-grid">
            <div class="summary-item" style="background:#2d1f1f;"><div class="big-num" style="color:#ff6b6b;">{len(unrated_played):,}</div><div class="summary-label">Unrated + Played</div></div>
            <div class="summary-item" style="background:#2d1f1f;"><div class="big-num" style="color:#ff8844;">{sum(s.get('timesplayed',0) for s in unrated_played):,}</div><div class="summary-label">Total Plays</div></div>
            <div class="summary-item" style="background:#2d1f1f;"><div class="big-num" style="color:#ffaa00;">{sum(1 for s in unrated_played if s.get('timesplayed',0)>=10):,}</div><div class="summary-label">10+ Plays</div></div>
            <div class="summary-item" style="background:#2d1f1f;"><div class="big-num" style="color:#ff4444;">{len(by_artist_unrated)}</div><div class="summary-label">Artists</div></div>
            <div class="summary-item" style="background:#2d1f1f;"><div class="big-num" style="color:#cc88ff;">{max(s.get('timesplayed',0) for s in unrated_played) if unrated_played else 0}</div><div class="summary-label">Max Plays</div></div>
        </div>
        <div class="grid">
            <div class="card" style="background:#2d1f1f;"><h3>By Artist</h3><div class="scroll"><table><tr><th>Artist</th><th class="num">Songs</th><th class="num">Plays</th><th class="num">Max</th></tr>{unrated_artist_rows}</table></div></div>
            <div class="card" style="background:#2d1f1f;"><h3>Songs (by plays)</h3><div class="scroll"><table><tr><th class="num">P</th><th>Artist</th><th>Title</th><th>Genre</th></tr>{unrated_songs_rows}</table></div></div>
        </div>
    </div>

    <!-- SLEEPING -->
    <div id="sleeping" class="tab-content">
        <div class="summary-grid">
            <div class="summary-item" style="background:#1f2d1f;"><div class="big-num" style="color:#88ff88;">{len(high_unplayed):,}</div><div class="summary-label">4-5⭐ Unplayed</div></div>
            <div class="summary-item" style="background:#1f2d1f;"><div class="big-num" style="color:#ffd700;">{sum(1 for s in high_unplayed if s.get('rating')==5):,}</div><div class="summary-label">5-Star</div></div>
            <div class="summary-item" style="background:#1f2d1f;"><div class="big-num" style="color:#ffaa44;">{sum(1 for s in high_unplayed if s.get('rating')==4):,}</div><div class="summary-label">4-Star</div></div>
            <div class="summary-item" style="background:#1f2d1f;"><div class="big-num" style="color:#00d9ff;">{sum(1 for s in high_unplayed if s.get('priorityTier')=='B'):,}</div><div class="summary-label">Priority B</div></div>
            <div class="summary-item" style="background:#1f2d1f;"><div class="big-num" style="color:#88ccff;">{len(by_artist_high)}</div><div class="summary-label">Artists</div></div>
        </div>
        <div class="grid">
            <div class="card" style="background:#1f2d1f;"><h3>By Artist</h3><div class="scroll"><table><tr><th>Artist</th><th class="num">Songs</th><th class="num">5⭐</th><th class="num">4⭐</th></tr>{high_artist_rows}</table></div></div>
            <div class="card" style="background:#1f2d1f;"><h3>Sleeping Beauties</h3><div class="scroll"><table><tr><th>Star</th><th>Pri</th><th>Artist</th><th>Title</th><th>Style</th></tr>{high_songs_rows}</table></div></div>
        </div>
    </div>

    <!-- SINGERS -->
    <div id="singers" class="tab-content">
        <div class="summary-grid">
            <div class="summary-item" style="background:#2d1f2d;"><div class="big-num" style="color:#ff6b9d;">{len(singer_songs):,}</div><div class="summary-label">With Singer</div></div>
            <div class="summary-item" style="background:#1f2d2d;"><div class="big-num" style="color:#6bffb8;">{len(instr_songs):,}</div><div class="summary-label">Instrumental</div></div>
            <div class="summary-item" style="background:#1f1f2d;"><div class="big-num" style="color:#00d9ff;">{analyzed_count:,}</div><div class="summary-label">Analyzed</div></div>
            <div class="summary-item" style="background:#1f1f2d;"><div class="big-num" style="color:#ffaa00;">{len(filtered_data) - analyzed_count:,}</div><div class="summary-label">Pending</div></div>
            <div class="summary-item" style="background:#1f1f2d;"><div class="big-num" style="color:#ff6b9d;">{singer_pct:.0f}%</div><div class="summary-label">Singer %</div></div>
        </div>
        <div class="legend"><div class="legend-item"><div class="legend-box" style="background:#ff6b9d;"></div> With Singer</div><div class="legend-item"><div class="legend-box" style="background:#6bffb8;"></div> Instrumental</div></div>
        <div class="grid">
            <div class="card"><h3>🎻 By Orchestra</h3><div class="scroll"><table><tr><th>Orchestra</th><th class="num">🎤</th><th class="num">🎹</th><th></th></tr>{orch_singer_rows}</table></div></div>
            <div class="card"><h3>📅 By Decade</h3><table><tr><th>Decade</th><th class="num">🎤</th><th class="num">🎹</th><th></th></tr>{decade_singer_rows}</table></div>
        </div>
        <h2>🎵 By Style</h2>
        <div class="card"><table><tr><th>Style</th><th class="num">🎤</th><th class="num">🎹</th><th></th></tr>{style_singer_rows}</table></div>

        <h2>🎤 Singer × Orchestra (bubble = song count)</h2>
        <div class="card">
            <p style="color:#888;font-size:0.8em;">Shows which singers recorded with which orchestras. Bubble size = number of songs together.</p>
            {singer_orch_html}
        </div>

        <h2>🔥 Orchestra Singer Usage Over Time (heatmap)</h2>
        <div class="card">
            <p style="color:#888;font-size:0.8em;">Pink = high singer %, Green = mostly instrumental. Based on {analyzed_count:,} analyzed songs.</p>
            {orch_heatmap_html}
            <div style="display:flex;gap:10px;margin-top:10px;font-size:0.75em;">
                <span><span style="display:inline-block;width:12px;height:12px;background:#ff6b9d;"></span> 80%+</span>
                <span><span style="display:inline-block;width:12px;height:12px;background:#ff9966;"></span> 60-80%</span>
                <span><span style="display:inline-block;width:12px;height:12px;background:#ffcc66;"></span> 40-60%</span>
                <span><span style="display:inline-block;width:12px;height:12px;background:#99cc99;"></span> 20-40%</span>
                <span><span style="display:inline-block;width:12px;height:12px;background:#6bffb8;"></span> 0-20%</span>
            </div>
        </div>

        <h2>📊 Vocal % Analysis (time singing in song)</h2>
        <div class="grid">
            <div class="card">
                <h3>% Vocal Time by Orchestra (avg ± stddev)</h3>
                <div class="scroll">
                    <table><tr><th>Orchestra</th><th class="num">N</th><th class="num">Avg</th><th class="num">Dev</th><th>Range</th></tr>
                    {orch_vocal_html}</table>
                </div>
            </div>
            <div class="card">
                <h3>% Vocal Time by Year (trend)</h3>
                <p style="color:#888;font-size:0.8em;">Shows avg vocal % per year. Pink = >50%, Orange = <50%</p>
                {year_vocal_html}
                <p style="color:#888;font-size:0.8em;margin-top:10px;">Vertical bars show ± std deviation</p>
            </div>
        </div>
    </div>

    <!-- CORTINAS -->
    <div id="cortinas" class="tab-content">
        <div class="warn">🎬 Cortinas are excluded from all quiz pools and play statistics</div>
        <div class="summary-grid">
            <div class="summary-item" style="background:#2d2d1f;"><div class="big-num" style="color:#ffcc00;">{len(cortinas):,}</div><div class="summary-label">Total Cortinas</div></div>
            <div class="summary-item" style="background:#2d2d1f;"><div class="big-num" style="color:#88cc00;">{len(cortina_played):,}</div><div class="summary-label">Played</div></div>
            <div class="summary-item" style="background:#2d2d1f;"><div class="big-num" style="color:#00ccff;">{sum(c.get('timesplayed',0) for c in cortinas):,}</div><div class="summary-label">Total Plays</div></div>
            <div class="summary-item" style="background:#2d2d1f;"><div class="big-num" style="color:#ff8844;">{len(cortina_by_artist)}</div><div class="summary-label">Artists</div></div>
            <div class="summary-item" style="background:#2d2d1f;"><div class="big-num" style="color:#cc88ff;">{max(c.get('timesplayed',0) for c in cortinas) if cortinas else 0}</div><div class="summary-label">Max Plays</div></div>
        </div>
        <div class="grid">
            <div class="card" style="background:#2d2d1f;"><h3>By Artist</h3><div class="scroll"><table><tr><th>Artist</th><th class="num">Count</th><th class="num">Plays</th></tr>{cortina_artist_rows}</table></div></div>
            <div class="card" style="background:#2d2d1f;"><h3>Most Played Cortinas</h3><div class="scroll"><table><tr><th class="num">Plays</th><th>Artist</th><th>Title</th></tr>{cortina_played_rows}</table></div></div>
        </div>
    </div>

    <script>
        function showTab(id) {{
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            event.target.classList.add('active');
        }}
    </script>
</body>
</html>
"""

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML.encode('utf-8'))

print("DQ Viewer at http://localhost:5001")
HTTPServer(('', 5001), Handler).serve_forever()
