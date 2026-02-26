import { useState, useMemo, useRef } from "react";

// ═══ REAL DATA from heatmap-orchestra-year.json ═══
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
  { n: "Osmar Maderna", t: 50, y: {1946:15,1947:17,1948:2,1949:7,1950:7,1951:2} },
  { n: "Héctor Varela", t: 47, y: {1954:2,1955:7,1956:10,1957:5,1958:8,1959:5,1960:1,1973:6,1974:2,1975:1} },
  { n: "Alfredo Gobbi", t: 37, y: {1947:2,1948:4,1949:8,1950:6,1951:5,1952:2,1953:3,1954:1,1955:2,1956:3,1958:1} },
  { n: "Julio De Caro", t: 21, y: {1929:1,1930:1,1931:6,1934:1,1936:1,1938:4,1939:1,1940:1,1942:1,1949:2,1950:1,1952:1} },
];

// Build year range from actual data
const allYearNums = new Set();
RAW.forEach(o => Object.keys(o.y).forEach(yr => allYearNums.add(parseInt(yr))));
const YEAR_MIN = Math.min(...allYearNums);
const YEAR_MAX = Math.max(...allYearNums);
const ALL_YEARS = [];
for (let y = YEAR_MIN; y <= YEAR_MAX; y++) ALL_YEARS.push(y);

// Find global max for color scaling
let GLOBAL_MAX = 0;
RAW.forEach(o => { const mx = Math.max(...Object.values(o.y)); if (mx > GLOBAL_MAX) GLOBAL_MAX = mx; });

// Era definitions
const ERAS = [
  { name: "Guardia Vieja", start: 1916, end: 1925, color: "#8B7355" },
  { name: "Pre-Golden", start: 1926, end: 1934, color: "#C9A959" },
  { name: "Golden Age", start: 1935, end: 1955, color: "#D4463A" },
  { name: "Post-Golden", start: 1956, end: 1969, color: "#6B8E8B" },
  { name: "Late", start: 1970, end: 1976, color: "#5C6B73" },
];

function getEra(year) {
  for (const e of ERAS) if (year >= e.start && year <= e.end) return e;
  return ERAS[ERAS.length - 1];
}

// Heat color: dark → warm amber → bright gold → white
function heatBg(val, max) {
  if (!val) return "transparent";
  const t = Math.min(val / max, 1);
  if (t < 0.08) return `rgba(80,30,15,0.5)`;
  if (t < 0.15) return `rgba(120,45,20,0.7)`;
  if (t < 0.25) return `rgba(165,60,25,0.8)`;
  if (t < 0.4) return `rgba(195,90,35,0.85)`;
  if (t < 0.55) return `rgba(210,130,50,0.9)`;
  if (t < 0.7) return `rgba(201,169,89,0.92)`;
  if (t < 0.85) return `rgba(225,200,130,0.95)`;
  return `rgba(250,240,200,1)`;
}
function heatText(val, max) {
  if (!val) return "transparent";
  const t = val / max;
  return t > 0.5 ? "#1A1A1A" : t > 0.2 ? "#E8E0D8" : "#A08868";
}

const CELL_W = 17;
const CELL_H = 22;
const NAME_W = 155;

export default function OrchestraYearHeatmap() {
  const [hoveredOrch, setHoveredOrch] = useState(null);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [selectedOrch, setSelectedOrch] = useState(null);
  const [sortBy, setSortBy] = useState("total");
  const [scaleMode, setScaleMode] = useState("global"); // global | row
  const scrollRef = useRef(null);

  const sortedData = useMemo(() => {
    let d = [...RAW];
    if (sortBy === "total") d.sort((a, b) => b.t - a.t);
    if (sortBy === "name") d.sort((a, b) => a.n.localeCompare(b.n));
    if (sortBy === "start") d.sort((a, b) => Math.min(...Object.keys(a.y).map(Number)) - Math.min(...Object.keys(b.y).map(Number)));
    return d;
  }, [sortBy]);

  const selData = selectedOrch ? RAW.find(o => o.n === selectedOrch) : null;

  // Year totals for the bottom row
  const yearTotals = useMemo(() => {
    const t = {};
    ALL_YEARS.forEach(yr => {
      let sum = 0;
      RAW.forEach(o => { sum += (o.y[yr] || 0); });
      t[yr] = sum;
    });
    return t;
  }, []);
  const maxYearTotal = Math.max(...Object.values(yearTotals));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #0A0A0A 0%, #14101A 40%, #0F0F14 100%)",
      color: "#E8E0D8",
      fontFamily: "'Courier New', 'SF Mono', monospace",
      padding: 0,
    }}>
      {/* Grain */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.3,
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#C9A959", marginBottom: 8, textTransform: "uppercase" }}>
            NTTT Library · Compás Report
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 400, margin: 0, letterSpacing: 2,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            background: "linear-gradient(135deg, #E8E0D8, #C9A959, #E8E0D8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Orchestra × Year Heatmap
          </h1>
          <div style={{ fontSize: 11, color: "#6B5F53", marginTop: 6 }}>
            4,510 recordings · 26 orchestras · {YEAR_MIN}–{YEAR_MAX} · each cell = one year
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#6B5F53", letterSpacing: 2 }}>SORT</span>
          {[["total","TOTAL"],["name","A→Z"],["start","ERA"]].map(([v,l]) => (
            <button key={v} onClick={() => setSortBy(v)} style={{
              background: sortBy === v ? "rgba(201,169,89,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${sortBy === v ? "rgba(201,169,89,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: sortBy === v ? "#C9A959" : "#6B5F53", padding: "3px 10px", borderRadius: 2,
              cursor: "pointer", fontSize: 10, letterSpacing: 1, transition: "all 0.2s",
            }}>{l}</button>
          ))}
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.06)", margin: "0 6px" }} />
          <span style={{ fontSize: 9, color: "#6B5F53", letterSpacing: 2 }}>SCALE</span>
          {[["global","GLOBAL"],["row","PER ROW"]].map(([v,l]) => (
            <button key={v} onClick={() => setScaleMode(v)} style={{
              background: scaleMode === v ? "rgba(201,169,89,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${scaleMode === v ? "rgba(201,169,89,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: scaleMode === v ? "#C9A959" : "#6B5F53", padding: "3px 10px", borderRadius: 2,
              cursor: "pointer", fontSize: 10, letterSpacing: 1, transition: "all 0.2s",
            }}>{l}</button>
          ))}
          {/* Legend */}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 9, color: "#6B5F53" }}>
            <span>0</span>
            {[0.08,0.15,0.25,0.4,0.55,0.7,0.85,1].map((t,i) => (
              <div key={i} style={{ width: 14, height: 10, borderRadius: 1, background: heatBg(t * GLOBAL_MAX, GLOBAL_MAX) }} />
            ))}
            <span>{GLOBAL_MAX}</span>
          </div>
        </div>

        {/* Era bar */}
        <div style={{ display: "flex", marginLeft: NAME_W + 36, marginBottom: 2, gap: 0 }}>
          {ERAS.map(era => {
            const startIdx = ALL_YEARS.indexOf(Math.max(era.start, YEAR_MIN));
            const endIdx = ALL_YEARS.indexOf(Math.min(era.end, YEAR_MAX));
            if (startIdx < 0 || endIdx < 0) return null;
            const span = endIdx - startIdx + 1;
            return (
              <div key={era.name} style={{
                width: span * CELL_W, flexShrink: 0,
                fontSize: 8, color: era.color, textAlign: "center",
                borderBottom: `2px solid ${era.color}`, paddingBottom: 2,
                letterSpacing: 1, textTransform: "uppercase", opacity: 0.7,
              }}>
                {span > 6 ? era.name : ""}
              </div>
            );
          })}
        </div>

        {/* Main heatmap */}
        <div ref={scrollRef} style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 16 }}>
          <div style={{ display: "inline-block", minWidth: "fit-content" }}>

            {/* Year headers */}
            <div style={{ display: "flex", alignItems: "flex-end", marginLeft: NAME_W + 36, marginBottom: 2, height: 36 }}>
              {ALL_YEARS.map(yr => (
                <div key={yr} style={{
                  width: CELL_W, flexShrink: 0, textAlign: "center",
                  fontSize: 7, color: hoveredYear === yr ? "#C9A959" : (yr % 5 === 0 ? "#6B5F53" : "transparent"),
                  transform: "rotate(-60deg)", transformOrigin: "bottom center",
                  height: 30, display: "flex", alignItems: "flex-end", justifyContent: "center",
                  cursor: "pointer", transition: "color 0.15s",
                }}
                onMouseEnter={() => setHoveredYear(yr)}
                onMouseLeave={() => setHoveredYear(null)}
                >
                  {yr}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {sortedData.map((orch, idx) => {
              const isHovered = hoveredOrch === orch.n;
              const isSelected = selectedOrch === orch.n;
              const rowMax = Math.max(...Object.values(orch.y));
              const scaleMax = scaleMode === "row" ? rowMax : GLOBAL_MAX;

              return (
                <div key={orch.n} style={{
                  display: "flex", alignItems: "center",
                  background: isSelected ? "rgba(201,169,89,0.06)" : isHovered ? "rgba(255,255,255,0.02)" : "transparent",
                  transition: "background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredOrch(orch.n)}
                onMouseLeave={() => setHoveredOrch(null)}
                onClick={() => setSelectedOrch(isSelected ? null : orch.n)}
                >
                  {/* Orchestra name */}
                  <div style={{
                    width: NAME_W, flexShrink: 0, padding: "0 8px",
                    fontSize: 10, fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? "#C9A959" : isHovered ? "#E8E0D8" : "#8B7B6B",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    transition: "color 0.15s",
                  }}>
                    <span style={{ color: "#3A332C", fontSize: 8, marginRight: 4, display: "inline-block", width: 14, textAlign: "right" }}>
                      {idx + 1}
                    </span>
                    {orch.n}
                  </div>

                  {/* Total */}
                  <div style={{
                    width: 32, flexShrink: 0, textAlign: "right", paddingRight: 4,
                    fontSize: 9, fontWeight: 600,
                    color: isSelected ? "#C9A959" : isHovered ? "#B0A898" : "#4A423A",
                    transition: "color 0.15s",
                  }}>
                    {orch.t}
                  </div>

                  {/* Year cells */}
                  {ALL_YEARS.map(yr => {
                    const val = orch.y[yr] || 0;
                    const isYrHovered = hoveredYear === yr;
                    return (
                      <div key={yr} style={{
                        width: CELL_W, height: CELL_H, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 1,
                      }}>
                        <div
                          title={val > 0 ? `${orch.n} · ${yr} · ${val} songs` : ""}
                          style={{
                            width: "100%", height: "100%", borderRadius: 2,
                            background: val > 0 ? heatBg(val, scaleMax) : (isYrHovered ? "rgba(255,255,255,0.02)" : "transparent"),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 7, fontWeight: val >= 30 ? 700 : 400,
                            color: val > 0 ? heatText(val, scaleMax) : "transparent",
                            transition: "transform 0.12s, box-shadow 0.12s",
                            transform: (isHovered && val > 0) || isYrHovered ? "scale(1.15)" : "scale(1)",
                            boxShadow: val >= 40 ? `0 0 6px rgba(201,169,89,0.3)` : "none",
                            outline: isYrHovered && val > 0 ? "1px solid rgba(201,169,89,0.4)" : "none",
                          }}
                        >
                          {val >= 10 ? val : val > 0 ? "·" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Year totals row */}
            <div style={{
              display: "flex", alignItems: "center", marginTop: 4,
              borderTop: "1px solid rgba(201,169,89,0.15)", paddingTop: 4,
            }}>
              <div style={{ width: NAME_W, flexShrink: 0, padding: "0 8px", fontSize: 9, color: "#C9A959", letterSpacing: 1 }}>
                YEAR TOTAL
              </div>
              <div style={{ width: 32, flexShrink: 0 }} />
              {ALL_YEARS.map(yr => {
                const val = yearTotals[yr] || 0;
                return (
                  <div key={yr} style={{
                    width: CELL_W, height: CELL_H + 2, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 1,
                  }}
                  onMouseEnter={() => setHoveredYear(yr)}
                  onMouseLeave={() => setHoveredYear(null)}
                  >
                    <div style={{
                      width: "100%", height: "100%", borderRadius: 2,
                      background: val > 0 ? heatBg(val, maxYearTotal) : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 7, fontWeight: val >= 80 ? 700 : 400,
                      color: val > 0 ? heatText(val, maxYearTotal) : "transparent",
                    }}>
                      {val >= 30 ? val : val > 0 ? "·" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected detail panel */}
        {selData && (
          <div style={{
            marginTop: 24, padding: 20,
            background: "rgba(201,169,89,0.03)", border: "1px solid rgba(201,169,89,0.12)",
            borderRadius: 4,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{
                fontSize: 22, fontWeight: 300, margin: 0, color: "#C9A959",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                {selData.n}
              </h3>
              <span style={{ fontSize: 20, fontWeight: 200, color: "#8B7B6B" }}>
                {selData.t} recordings
              </span>
            </div>

            {/* Mini bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 100 }}>
              {ALL_YEARS.map(yr => {
                const val = selData.y[yr] || 0;
                const maxForOrch = Math.max(...Object.values(selData.y));
                const pct = val > 0 ? (val / maxForOrch) * 100 : 0;
                const era = getEra(yr);
                return (
                  <div key={yr} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    maxWidth: 16, minWidth: 3,
                  }}>
                    {val > 0 && pct > 60 && (
                      <span style={{ fontSize: 7, color: "#C9A959", marginBottom: 1 }}>{val}</span>
                    )}
                    <div style={{
                      width: "100%", height: `${pct}%`, minHeight: val > 0 ? 2 : 0,
                      background: val > 0 ? `linear-gradient(180deg, ${era.color}, ${era.color}66)` : "transparent",
                      borderRadius: "2px 2px 0 0",
                      transition: "height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: "#4A423A" }}>
              <span>{YEAR_MIN}</span>
              <span>{YEAR_MAX}</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 10, color: "#6B5F53", textAlign: "center", fontStyle: "italic", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13 }}>
              Peak: {Object.entries(selData.y).sort(([,a],[,b]) => b - a)[0][0]}
              ({Object.entries(selData.y).sort(([,a],[,b]) => b - a)[0][1]} songs)
              {" · "}
              Active {Math.min(...Object.keys(selData.y).map(Number))}–{Math.max(...Object.keys(selData.y).map(Number))}
              {" · "}
              {((selData.t / 4510) * 100).toFixed(1)}% of library
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: "center", fontSize: 9, color: "rgba(107,95,83,0.4)", letterSpacing: 2 }}>
          NTTT · COMPÁS · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
