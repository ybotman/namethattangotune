"use client";

import { useState, useMemo } from "react";

// ═══ COMPLETE DATA from heatmap-orchestra-year.json — all 42 orchestras, all 67 years ═══
const RAW = [
  { n: "Juan D'Arienzo", t: 604, y: {1935:17,1936:28,1937:53,1938:38,1939:55,1940:56,1941:48,1942:31,1943:21,1944:24,1945:20,1946:26,1947:25,1948:15,1949:23,1950:14,1951:6,1952:12,1953:2,1954:13,1955:13,1956:2,1957:5,1958:4,1959:2,1961:1,1962:1,1963:11,1964:1,1966:13,1967:12,1969:2,1970:3,1971:1,1973:6} },
  { n: "Francisco Canaro", t: 478, y: {1926:3,1927:50,1928:1,1929:2,1930:21,1931:11,1932:52,1933:22,1934:31,1935:36,1936:33,1937:41,1938:29,1939:28,1940:33,1941:28,1942:17,1943:19,1944:14,1945:3,1946:2,1947:1,1949:1} },
  { n: "Carlos Di Sarli", t: 432, y: {1929:8,1930:11,1931:3,1939:4,1940:33,1941:52,1942:32,1943:40,1944:19,1945:27,1946:18,1947:20,1948:3,1951:26,1952:31,1953:17,1954:24,1955:15,1956:20,1957:12,1958:17} },
  { n: "Aníbal Troilo", t: 249, y: {1938:3,1941:29,1942:29,1943:29,1944:30,1945:22,1946:18,1947:13,1948:7,1949:5,1951:13,1952:20,1953:2,1954:6,1955:3,1956:6,1957:2,1958:6,1961:1,1963:4,1969:1} },
  { n: "Alfredo de Angelis", t: 229, y: {1943:6,1944:15,1945:17,1946:16,1947:12,1948:5,1949:14,1950:9,1951:11,1952:7,1953:14,1954:16,1955:12,1956:18,1957:10,1958:11,1959:12,1960:6,1961:8,1962:3,1963:2,1969:1,1972:1,1974:2,1976:1} },
  { n: "Rodolfo Biagi", t: 214, y: {1938:12,1939:25,1940:43,1941:35,1942:18,1943:4,1945:19,1946:10,1948:5,1950:7,1951:3,1952:4,1953:5,1954:2,1955:1,1956:4,1957:4,1958:3,1959:4,1960:2,1961:4} },
  { n: "Orq. Típica Victor", t: 198, y: {1926:15,1927:33,1928:14,1929:22,1930:18,1931:17,1932:8,1933:6,1934:3,1935:1,1936:1,1937:20,1938:7,1939:4,1940:7,1941:3,1943:10,1944:9} },
  { n: "Francisco Lomuto", t: 191, y: {1927:4,1928:16,1929:21,1930:10,1931:5,1932:3,1933:2,1935:9,1936:21,1937:19,1938:24,1939:18,1940:10,1941:12,1942:13,1943:1,1944:1,1945:2} },
  { n: "Roberto Firpo", t: 184, y: {1916:1,1920:12,1924:1,1927:1,1928:8,1929:3,1930:21,1931:2,1934:3,1935:8,1936:20,1937:17,1938:11,1939:11,1940:13,1941:2,1942:5,1944:3,1946:7,1947:2,1948:3,1949:1,1950:2,1951:8,1952:5,1953:3,1954:2,1955:2,1956:4,1959:3} },
  { n: "Ricardo Tanturi", t: 162, y: {1937:1,1938:1,1940:2,1941:24,1942:22,1943:33,1944:25,1945:25,1946:19,1947:7,1948:3} },
  { n: "Osvaldo Pugliese", t: 126, y: {1943:11,1944:35,1945:29,1946:19,1947:4,1948:3,1949:5,1952:4,1953:1,1954:1,1955:3,1956:3,1958:1,1959:7} },
  { n: "Edgardo Donato", t: 119, y: {1930:18,1931:20,1932:1,1933:5,1934:9,1935:7,1936:6,1937:4,1938:10,1939:10,1940:12,1941:9,1942:5,1944:1,1945:2} },
  { n: "Miguel Caló", t: 115, y: {1941:3,1942:17,1943:27,1944:21,1945:19,1946:5,1947:2,1948:2,1949:1,1950:3,1951:1,1954:3,1963:2,1964:4,1967:2,1969:3} },
  { n: "Enrique Rodríguez", t: 101, y: {1937:1,1938:7,1939:9,1940:12,1941:13,1942:13,1943:15,1944:11,1945:13,1946:3,1951:1,1953:1,1956:2} },
  { n: "Ángel D'Agostino", t: 95, y: {1940:2,1941:10,1942:13,1943:18,1944:19,1945:20,1946:9,1952:1,1955:1,1959:1,1963:1} },
  { n: "Domingo Federico", t: 87, y: {1943:1,1944:3,1945:18,1946:14,1947:15,1948:3,1949:4,1950:5,1951:3,1952:2,1953:1,1954:4,1955:1,1956:2,1960:3,1966:1,1968:3,1969:4} },
  { n: "Pedro Laurenz", t: 68, y: {1937:3,1938:4,1940:9,1941:5,1942:7,1943:14,1944:14,1947:3,1953:1,1966:8} },
  { n: "Lucio Demare", t: 67, y: {1938:1,1942:15,1943:10,1944:29,1945:12} },
  { n: "Osvaldo Fresedo", t: 66, y: {1933:3,1935:1,1936:2,1937:8,1938:3,1939:26,1940:4,1941:10,1951:2,1952:5,1954:1,1955:1} },
  { n: "Ángel Vargas", t: 65, y: {1947:3,1948:7,1949:10,1950:7,1951:4,1952:6,1953:18,1954:9,1956:1} },
  { n: "Rafael Canaro", t: 63, y: {1929:3,1930:8,1932:2,1934:10,1935:5,1936:7,1937:13,1938:7,1939:8} },
  { n: "Quinteto Pirincho", t: 57, y: {1938:8,1939:3,1941:2,1950:3,1951:1,1952:4,1953:2,1954:2,1955:4,1956:6,1957:3,1958:1,1959:16,1960:1,1962:1} },
  { n: "Hyperion Ensemble", t: 56, y: {2005:1,2007:7,2008:8,2011:3,2012:13,2014:11,2016:1,2023:12} },
  { n: "Osmar Maderna", t: 50, y: {1946:15,1947:17,1948:2,1949:7,1950:7,1951:2} },
  { n: "Héctor Varela", t: 47, y: {1954:2,1955:7,1956:10,1957:5,1958:8,1959:5,1960:1,1973:6,1974:2,1975:1} },
  { n: "Alfredo Gobbi", t: 37, y: {1947:2,1948:4,1949:8,1950:6,1951:5,1952:2,1953:3,1954:1,1955:2,1956:3,1958:1} },
  { n: "Orq. Típica Andariega", t: 35, y: {2011:6,2014:6,2017:4,2019:10,2020:1,2021:8} },
  { n: "Pablo Valle Sexteto", t: 26, y: {2014:13,2017:13} },
  { n: "Bandonegro", t: 25, y: {2017:13,2022:12} },
  { n: "Julio De Caro", t: 21, y: {1929:1,1930:1,1931:6,1934:1,1936:1,1938:4,1939:1,1940:1,1942:1,1949:2,1950:1,1952:1} },
  { n: "Ricardo Malerba", t: 18, y: {1941:2,1942:4,1943:9,1944:3} },
  { n: "Alberto Castillo", t: 15, y: {1943:1,1944:2,1945:1,1946:2,1947:1,1948:1,1949:2,1950:1,1951:1,1953:1,1959:1,1960:1} },
  { n: "Quinteto Don Pancho", t: 15, y: {1937:1,1938:11,1939:3} },
  { n: "Fulvio Salamanca", t: 10, y: {1957:4,1958:3,1959:3} },
  { n: "Chino Laborde", t: 10, y: {2019:6,2020:4} },
  { n: "Orq. Romántica Milong.", t: 9, y: {2017:9} },
  { n: "El Cachivache", t: 9, y: {2016:9} },
  { n: "José García Z. Grises", t: 6, y: {1942:2,1944:4} },
  { n: "Otros Aires", t: 6, y: {2012:6} },
  { n: "Cáceres", t: 3, y: {2003:3} },
  { n: "Mario Melfi", t: 2, y: {1934:1,1940:1} },
  { n: "Florindo Sassone", t: 1, y: {1968:1} },
];

// Build complete year list from data
const allYearSet = new Set();
RAW.forEach(o => Object.keys(o.y).forEach(yr => allYearSet.add(parseInt(yr))));
const ALL_YEARS_SORTED = [...allYearSet].sort((a, b) => a - b);

// Detect gaps > 3 years to insert visual break markers
const yearSlots = [];
for (let i = 0; i < ALL_YEARS_SORTED.length; i++) {
  if (i > 0 && ALL_YEARS_SORTED[i] - ALL_YEARS_SORTED[i - 1] > 3) {
    yearSlots.push({ type: "gap", from: ALL_YEARS_SORTED[i - 1], to: ALL_YEARS_SORTED[i] });
  }
  yearSlots.push({ type: "year", year: ALL_YEARS_SORTED[i] });
}

// Build expanded version that shows every year including the gap
const yearSlotsExpanded = [];
for (let i = 0; i < ALL_YEARS_SORTED.length; i++) {
  if (i > 0 && ALL_YEARS_SORTED[i] - ALL_YEARS_SORTED[i - 1] > 3) {
    // Fill in every missing year
    for (let y = ALL_YEARS_SORTED[i - 1] + 1; y < ALL_YEARS_SORTED[i]; y++) {
      yearSlotsExpanded.push({ type: "empty", year: y });
    }
  }
  yearSlotsExpanded.push({ type: "year", year: ALL_YEARS_SORTED[i] });
}

let GLOBAL_MAX = 0;
RAW.forEach(o => { const mx = Math.max(...Object.values(o.y)); if (mx > GLOBAL_MAX) GLOBAL_MAX = mx; });

const ERAS = [
  { name: "Guardia Vieja", start: 1910, end: 1925, color: "#8B7355" },
  { name: "Pre-Golden", start: 1926, end: 1934, color: "#C9A959" },
  { name: "Golden Age", start: 1935, end: 1955, color: "#D4463A" },
  { name: "Post-Golden", start: 1956, end: 1976, color: "#6B8E8B" },
  { name: "Renaissance", start: 2000, end: 2025, color: "#3D7B8A" },
];
function getEra(year) {
  for (const e of ERAS) if (year >= e.start && year <= e.end) return e;
  return { name: "?", color: "#555" };
}

function heatBg(val, max) {
  if (!val) return "transparent";
  const t = Math.min(val / max, 1);
  if (t < 0.05) return `rgba(70,25,12,0.45)`;
  if (t < 0.1) return `rgba(100,38,18,0.6)`;
  if (t < 0.18) return `rgba(140,50,22,0.72)`;
  if (t < 0.3) return `rgba(175,72,28,0.82)`;
  if (t < 0.45) return `rgba(200,100,38,0.88)`;
  if (t < 0.6) return `rgba(210,140,55,0.92)`;
  if (t < 0.75) return `rgba(201,169,89,0.94)`;
  if (t < 0.88) return `rgba(230,210,145,0.96)`;
  return `rgba(252,245,210,1)`;
}
function heatTx(val, max) {
  if (!val) return "transparent";
  return (val / max) > 0.45 ? "#1A1200" : (val / max) > 0.15 ? "#E8DCC8" : "#A08060";
}

const CW = 15; // cell width
const CH = 19; // cell height
const GAP_W = 8;
const NAME_COL = 155;
const TOTAL_COL = 34;

export default function FullHeatmap() {
  const [hovOrch, setHovOrch] = useState(null);
  const [hovYear, setHovYear] = useState(null);
  const [selOrch, setSelOrch] = useState(null);
  const [sortBy, setSortBy] = useState("total");
  const [scale, setScale] = useState("global");
  const [showGap, setShowGap] = useState(false); // false = collapsed with line, true = show empty years

  const sorted = useMemo(() => {
    let d = [...RAW];
    if (sortBy === "total") d.sort((a, b) => b.t - a.t);
    if (sortBy === "name") d.sort((a, b) => a.n.localeCompare(b.n));
    if (sortBy === "start") d.sort((a, b) => Math.min(...Object.keys(a.y).map(Number)) - Math.min(...Object.keys(b.y).map(Number)));
    return d;
  }, [sortBy]);

  const selData = selOrch ? RAW.find(o => o.n === selOrch) : null;

  const activeSlots = useMemo(() => showGap ? yearSlotsExpanded : yearSlots, [showGap]);

  const yearTotals = useMemo(() => {
    const t = {};
    ALL_YEARS_SORTED.forEach(yr => { let s = 0; RAW.forEach(o => s += (o.y[yr] || 0)); t[yr] = s; });
    return t;
  }, []);
  const maxYT = Math.max(...Object.values(yearTotals));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #080808 0%, #110E16 40%, #0C0C10 100%)",
      color: "#E8E0D8",
      fontFamily: "'SF Mono', 'Courier New', monospace",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.25,
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "24px 12px", maxWidth: 1500, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#C9A959", textTransform: "uppercase" }}>NTTT · Compás</div>
          <h1 style={{
            fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 400, margin: "6px 0 4px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            background: "linear-gradient(135deg, #E8E0D8, #C9A959, #E8E0D8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Complete Orchestra × Year
          </h1>
          <div style={{ fontSize: 10, color: "#5A5048" }}>
            4,510 recordings · 42 orchestras · 67 active years · 1916–2023
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 8, color: "#5A5048", letterSpacing: 2 }}>SORT</span>
          {[["total","TOTAL"],["name","A→Z"],["start","ERA"]].map(([v,l]) => (
            <button key={v} onClick={() => setSortBy(v)} style={{
              background: sortBy === v ? "rgba(201,169,89,0.15)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${sortBy === v ? "rgba(201,169,89,0.35)" : "rgba(255,255,255,0.05)"}`,
              color: sortBy === v ? "#C9A959" : "#5A5048", padding: "2px 8px", borderRadius: 2,
              cursor: "pointer", fontSize: 9, letterSpacing: 1,
            }}>{l}</button>
          ))}
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.05)", margin: "0 4px" }} />
          <span style={{ fontSize: 8, color: "#5A5048", letterSpacing: 2 }}>COLOR</span>
          {[["global","GLOBAL"],["row","PER ROW"]].map(([v,l]) => (
            <button key={v} onClick={() => setScale(v)} style={{
              background: scale === v ? "rgba(201,169,89,0.15)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${scale === v ? "rgba(201,169,89,0.35)" : "rgba(255,255,255,0.05)"}`,
              color: scale === v ? "#C9A959" : "#5A5048", padding: "2px 8px", borderRadius: 2,
              cursor: "pointer", fontSize: 9, letterSpacing: 1,
            }}>{l}</button>
          ))}
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.05)", margin: "0 4px" }} />
          <span style={{ fontSize: 8, color: "#5A5048", letterSpacing: 2 }}>GAP</span>
          <button onClick={() => setShowGap(!showGap)} style={{
            background: showGap ? "rgba(201,169,89,0.15)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${showGap ? "rgba(201,169,89,0.35)" : "rgba(255,255,255,0.05)"}`,
            color: showGap ? "#C9A959" : "#5A5048", padding: "2px 8px", borderRadius: 2,
            cursor: "pointer", fontSize: 9, letterSpacing: 1,
          }}>{showGap ? "SHOWING 1977–2002" : "COLLAPSED"}</button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 1, fontSize: 8, color: "#5A5048" }}>
            <span>0</span>
            {[0.05,0.1,0.18,0.3,0.45,0.6,0.75,0.88,1].map((t,i) => (
              <div key={i} style={{ width: 12, height: 8, borderRadius: 1, background: heatBg(t * GLOBAL_MAX, GLOBAL_MAX) }} />
            ))}
            <span>{GLOBAL_MAX}</span>
          </div>
        </div>

        {/* HEATMAP */}
        <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 8 }}>
          <div style={{ display: "inline-block", minWidth: "fit-content" }}>

            {/* Era markers */}
            <div style={{ display: "flex", marginLeft: NAME_COL + TOTAL_COL + 4, marginBottom: 1 }}>
              {activeSlots.map((slot, si) => {
                if (slot.type === "gap") return <div key={`g${si}`} style={{ width: GAP_W, flexShrink: 0 }} />;
                const yr = slot.year;
                const era = getEra(yr);
                const prev = activeSlots[si - 1];
                const isEraStart = si === 0 || prev?.type === "gap" || prev?.type === "empty" && getEra(prev.year).name !== era.name || prev?.type === "year" && getEra(prev.year).name !== era.name;
                const isGapYear = slot.type === "empty";
                return (
                  <div key={`e${yr}`} style={{
                    width: isGapYear ? 4 : CW, flexShrink: 0,
                    borderBottom: isGapYear ? "1px dashed rgba(90,80,72,0.15)" : `2px solid ${era.color}`,
                    fontSize: 7, textAlign: "left", color: era.color, opacity: isGapYear ? 0.2 : 0.6,
                    overflow: "visible", whiteSpace: "nowrap", position: "relative",
                  }}>
                    {isEraStart && !isGapYear && <span style={{ position: "absolute", top: -10, left: 0, letterSpacing: 0.5 }}>{era.name}</span>}
                  </div>
                );
              })}
            </div>

            {/* Year column headers */}
            <div style={{ display: "flex", alignItems: "flex-end", marginLeft: NAME_COL + TOTAL_COL + 4, height: 32, marginBottom: 2 }}>
              {activeSlots.map((slot, si) => {
                if (slot.type === "gap") return (
                  <div key={`g${si}`} style={{
                    width: GAP_W, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, color: "#3A332C", height: 32,
                  }}>⋯</div>
                );
                if (slot.type === "empty") {
                  const isMiddle = slot.year === 1989;
                  return (
                    <div key={`e${slot.year}`} style={{
                      width: 4, height: 32, flexShrink: 0, position: "relative",
                    }}>
                      {isMiddle && (
                        <div style={{
                          position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
                          whiteSpace: "nowrap", fontSize: 8, letterSpacing: 3,
                          color: "rgba(201,169,89,0.3)", fontStyle: "italic",
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          textTransform: "uppercase",
                        }}>
                          The Silence · 1977–2002
                        </div>
                      )}
                    </div>
                  );
                }
                const yr = slot.year;
                const show = yr % 5 === 0 || hovYear === yr;
                return (
                  <div key={yr} style={{
                    width: CW, flexShrink: 0, textAlign: "center",
                    fontSize: 7, color: hovYear === yr ? "#C9A959" : show ? "#5A5048" : "transparent",
                    transform: "rotate(-65deg)", transformOrigin: "bottom center",
                    height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center",
                    cursor: "pointer", transition: "color 0.1s",
                  }}
                  onMouseEnter={() => setHovYear(yr)}
                  onMouseLeave={() => setHovYear(null)}
                  >{yr}</div>
                );
              })}
            </div>

            {/* Orchestra rows */}
            {sorted.map((o, idx) => {
              const isH = hovOrch === o.n;
              const isS = selOrch === o.n;
              const rowMax = Math.max(...Object.values(o.y));
              const sMax = scale === "row" ? rowMax : GLOBAL_MAX;
              return (
                <div key={o.n}
                  onMouseEnter={() => setHovOrch(o.n)}
                  onMouseLeave={() => setHovOrch(null)}
                  onClick={() => setSelOrch(isS ? null : o.n)}
                  style={{
                    display: "flex", alignItems: "center", cursor: "pointer",
                    background: isS ? "rgba(201,169,89,0.05)" : isH ? "rgba(255,255,255,0.015)" : "transparent",
                    transition: "background 0.12s",
                  }}
                >
                  <div style={{
                    width: NAME_COL, flexShrink: 0, padding: "0 6px",
                    fontSize: 9, fontWeight: isS ? 700 : 400,
                    color: isS ? "#C9A959" : isH ? "#D8D0C4" : "#7B6F63",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    transition: "color 0.1s",
                  }}>
                    <span style={{ color: "#2E2820", fontSize: 7, marginRight: 3, display: "inline-block", width: 14, textAlign: "right" }}>{idx + 1}</span>
                    {o.n}
                  </div>
                  <div style={{
                    width: TOTAL_COL, flexShrink: 0, textAlign: "right", paddingRight: 4,
                    fontSize: 8, fontWeight: 600,
                    color: isS ? "#C9A959" : isH ? "#A09888" : "#3E3830",
                  }}>{o.t}</div>

                  {activeSlots.map((slot, si) => {
                    if (slot.type === "gap") return <div key={`g${si}`} style={{ width: GAP_W, height: CH, flexShrink: 0 }} />;
                    if (slot.type === "empty") return (
                      <div key={`e${slot.year}`} style={{
                        width: 4, height: CH, flexShrink: 0,
                        background: slot.year === 1989 ? "rgba(201,169,89,0.08)" : "transparent",
                        borderLeft: slot.year === 1977 ? "1px dashed rgba(201,169,89,0.18)" : "none",
                        borderRight: slot.year === 2002 ? "1px dashed rgba(201,169,89,0.18)" : "none",
                      }} />
                    );
                    const yr = slot.year;
                    const val = o.y[yr] || 0;
                    const isYH = hovYear === yr;
                    return (
                      <div key={yr} style={{ width: CW, height: CH, flexShrink: 0, padding: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div title={val > 0 ? `${o.n} · ${yr} · ${val}` : ""}
                          style={{
                            width: "100%", height: "100%", borderRadius: 2,
                            background: val > 0 ? heatBg(val, sMax) : isYH ? "rgba(255,255,255,0.015)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 6.5, fontWeight: val >= 25 ? 700 : 400,
                            color: val > 0 ? heatTx(val, sMax) : "transparent",
                            transition: "transform 0.1s",
                            transform: (isH && val > 0) || (isYH && val > 0) ? "scale(1.2)" : "scale(1)",
                            boxShadow: val >= 35 ? "0 0 5px rgba(201,169,89,0.25)" : "none",
                            outline: isYH && val > 0 ? "1px solid rgba(201,169,89,0.3)" : "none",
                          }}
                        >
                          {val >= 8 ? val : val > 0 ? "·" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Year totals */}
            <div style={{
              display: "flex", alignItems: "center", marginTop: 3,
              borderTop: "1px solid rgba(201,169,89,0.12)", paddingTop: 3,
            }}>
              <div style={{ width: NAME_COL, flexShrink: 0, padding: "0 6px", fontSize: 8, color: "#C9A959", letterSpacing: 1 }}>YEAR TOTAL</div>
              <div style={{ width: TOTAL_COL, flexShrink: 0 }} />
              {activeSlots.map((slot, si) => {
                if (slot.type === "gap") return <div key={`g${si}`} style={{ width: GAP_W, height: CH + 2, flexShrink: 0 }} />;
                if (slot.type === "empty") return (
                  <div key={`e${slot.year}`} style={{
                    width: 4, height: CH + 2, flexShrink: 0,
                    borderLeft: slot.year === 1977 ? "1px dashed rgba(201,169,89,0.18)" : "none",
                    borderRight: slot.year === 2002 ? "1px dashed rgba(201,169,89,0.18)" : "none",
                  }} />
                );
                const yr = slot.year;
                const val = yearTotals[yr] || 0;
                return (
                  <div key={yr} style={{ width: CW, height: CH + 2, flexShrink: 0, padding: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={() => setHovYear(yr)}
                    onMouseLeave={() => setHovYear(null)}
                  >
                    <div style={{
                      width: "100%", height: "100%", borderRadius: 2,
                      background: val > 0 ? heatBg(val, maxYT) : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 6.5, fontWeight: val >= 60 ? 700 : 400,
                      color: val > 0 ? heatTx(val, maxYT) : "transparent",
                    }}>
                      {val >= 20 ? val : val > 0 ? "·" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selData && (() => {
          const yrs = Object.entries(selData.y).sort(([a],[b]) => a - b);
          const peak = Object.entries(selData.y).sort(([,a],[,b]) => b - a)[0];
          const rowMax = Math.max(...Object.values(selData.y));
          const minYr = Math.min(...Object.keys(selData.y).map(Number));
          const maxYr = Math.max(...Object.keys(selData.y).map(Number));
          const span = [];
          for (let y = minYr; y <= maxYr; y++) span.push(y);

          return (
            <div style={{
              marginTop: 20, padding: 16,
              background: "rgba(201,169,89,0.03)", border: "1px solid rgba(201,169,89,0.1)",
              borderRadius: 4,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                <h3 style={{ fontSize: 20, fontWeight: 300, margin: 0, color: "#C9A959", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{selData.n}</h3>
                <span style={{ fontSize: 16, fontWeight: 200, color: "#7B6F63" }}>{selData.t} recordings</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 80 }}>
                {span.map(yr => {
                  const val = selData.y[yr] || 0;
                  const pct = val > 0 ? (val / rowMax) * 100 : 0;
                  const era = getEra(yr);
                  return (
                    <div key={yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 18, minWidth: 2 }}>
                      {pct > 65 && <span style={{ fontSize: 6, color: "#C9A959", marginBottom: 1 }}>{val}</span>}
                      <div style={{
                        width: "100%", height: `${pct}%`, minHeight: val > 0 ? 2 : 0,
                        background: val > 0 ? `linear-gradient(180deg, ${era.color}, ${era.color}55)` : "transparent",
                        borderRadius: "2px 2px 0 0",
                        transition: "height 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                      }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 7, color: "#3E3830" }}>
                <span>{minYr}</span><span>{maxYr}</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "#5A5048", textAlign: "center", fontStyle: "italic", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Peak: {peak[0]} ({peak[1]} songs) · Active {minYr}–{maxYr} ({Object.keys(selData.y).length} active years) · {((selData.t / 4510) * 100).toFixed(1)}% of library
              </div>
            </div>
          );
        })()}

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 8, color: "rgba(90,80,72,0.35)", letterSpacing: 2 }}>
          NTTT · COMPÁS · 42 ORCHESTRAS · 67 YEARS · 4,510 RECORDINGS
        </div>
      </div>
    </div>
  );
}
