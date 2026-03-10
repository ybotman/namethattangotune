import { useState } from "react";

// All data computed from analysis
const GRID_DATA = {
  existing: {
    "Icons-Famous":   { total: 496,  t: 418, v: 45,  m: 33 },
    "Icons-Known":    { total: 932,  t: 750, v: 90,  m: 92 },
    "Icons-Obscure":  { total: 0,    t: 0,   v: 0,   m: 0  },
    "Core-Famous":    { total: 524,  t: 430, v: 55,  m: 39 },
    "Core-Known":     { total: 1068, t: 880, v: 110, m: 78 },
    "Core-Obscure":   { total: 0,    t: 0,   v: 0,   m: 0  },
    "Niche-Famous":   { total: 113,  t: 90,  v: 14,  m: 9  },
    "Niche-Known":    { total: 1587, t: 1300,v: 160, m: 127 },
    "Niche-Obscure":  { total: 13,   t: 10,  v: 2,   m: 1  },
  },
  boris: {
    "Icons-Famous":   { total: 16,   t: 16,  v: 0,   m: 0,  unk: 0   },
    "Icons-Known":    { total: 71,   t: 66,  v: 1,   m: 4,  unk: 0   },
    "Icons-Obscure":  { total: 1,    t: 1,   v: 0,   m: 0,  unk: 0   },
    "Icons-Unknown":  { total: 412,  t: 347, v: 33,  m: 32, unk: 412 },
    "Core-Famous":    { total: 71,   t: 60,  v: 10,  m: 1,  unk: 0   },
    "Core-Known":     { total: 344,  t: 323, v: 11,  m: 9,  unk: 0   },
    "Core-Obscure":   { total: 0,    t: 0,   v: 0,   m: 0,  unk: 0   },
    "Core-Unknown":   { total: 1333, t: 1097,v: 170, m: 57, unk: 1333 },
    "Niche-Famous":   { total: 37,   t: 29,  v: 6,   m: 2,  unk: 0   },
    "Niche-Known":    { total: 216,  t: 180, v: 25,  m: 11, unk: 0   },
    "Niche-Obscure":  { total: 0,    t: 0,   v: 0,   m: 0,  unk: 0   },
    "Niche-Unknown":  { total: 622,  t: 560, v: 33,  m: 29, unk: 622 },
  }
};

// What we know about Iconic songs by cell (the well-known titles Boris has)
const ICONIC_CONTEXT = {
  "Icons-Famous": {
    note: "High-value additions — well-known Troilo/D'Arienzo/Di Sarli/Pugliese titles already confirmed famous",
    examples: ["Fechoria (Troilo)", "Esta noche de luna (Di Sarli)", "Cocoliche (OTV)"],
    verdict: "✅ Load all 16"
  },
  "Icons-Known": {
    note: "Solid mid-familiarity Icons — meaningful additions to quiz variety",
    examples: ["Various Troilo 1950s-60s", "D'Arienzo 1940s vocals"],
    verdict: "✅ Load all 71"
  },
  "Icons-Obscure": {
    note: "Just 1 song — marginal",
    examples: [],
    verdict: "⚠️ Review before loading"
  },
  "Core-Famous": {
    note: "Strong additions — famous Canaro, Fresedo, OTV titles. Alberto Castillo vals here.",
    examples: ["Castillo vals (rated 4-5★)", "OTV 1920s-30s Famous"],
    verdict: "✅ Load all 71"
  },
  "Core-Known": {
    note: "Large valuable batch — 344 known Core songs",
    examples: ["Biagi 1940s vocals", "Calo 1940s", "D'Agostino 1940s"],
    verdict: "✅ Load all 344"
  },
  "Core-Obscure": {
    note: "None in Boris — expected gap",
    examples: [],
    verdict: "n/a"
  },
  "Niche-Famous": {
    note: "37 famous Niche songs is notable — Alberto Castillo vals dominate here",
    examples: ["Castillo vals rated 4-5★", "Quinteto Pirincho 1930s"],
    verdict: "✅ Load all 37"
  },
  "Niche-Known": {
    note: "216 songs — adds real depth to quiz. Firpo, Gobbi, Alberto Castillo.",
    examples: ["Firpo 1930s", "Alfredo Gobbi 1950s", "Sassone 2000s (reissues)"],
    verdict: "✅ Load, flag reissues"
  },
  "Niche-Obscure": {
    note: "None from Boris — he didn't collect obscure Niche material",
    examples: [],
    verdict: "n/a"
  },
};

const COLS = ["Icons", "Core", "Niche"];
const ROWS = ["Famous", "Known", "Obscure"];
const COL_LABELS = { Icons: "L1 · Icons", Core: "L2 · Core", Niche: "L3+ · Niche" };
const COL_COLORS = { Icons: "#c084fc", Core: "#4ade80", Niche: "#38bdf8" };
const ROW_LABELS = { Famous: "Famous ≥ 0.70", Known: "Known ≥ 0.30", Obscure: "Obscure < 0.30" };

function MiniBar({ t, v, m, total, height = 4 }) {
  if (!total) return null;
  return (
    <div style={{ display: "flex", height, borderRadius: 2, overflow: "hidden", marginTop: 2, gap: 1 }}>
      {t > 0 && <div style={{ flex: t, background: "#60a5fa" }} />}
      {v > 0 && <div style={{ flex: v, background: "#a78bfa" }} />}
      {m > 0 && <div style={{ flex: m, background: "#fb923c" }} />}
    </div>
  );
}

function GridCell({ col, row, onSelect, selected }) {
  const key = `${col}-${row}`;
  const ex = GRID_DATA.existing[key] || { total: 0, t: 0, v: 0, m: 0 };
  const bo = GRID_DATA.boris[key] || { total: 0 };
  const boUnk = GRID_DATA.boris[`${col}-Unknown`] || { total: 0 };
  const accent = COL_COLORS[col];
  const isEmpty = ex.total === 0 && bo.total === 0;
  const isSelected = selected === key;

  const exIntensity = Math.pow(Math.min(ex.total / 1200, 1), 0.5);
  const hasNew = bo.total > 0;

  return (
    <div
      onClick={() => !isEmpty && onSelect(isSelected ? null : key)}
      style={{
        background: isEmpty
          ? "rgba(255,255,255,0.02)"
          : `rgba(${hexRgb(accent)},${0.05 + exIntensity * 0.18})`,
        border: isSelected
          ? `2px solid ${accent}`
          : isEmpty
          ? "1px solid rgba(255,255,255,0.04)"
          : `1px solid rgba(${hexRgb(accent)},${0.15 + exIntensity * 0.25})`,
        borderRadius: 8,
        padding: "10px 12px",
        cursor: isEmpty ? "default" : "pointer",
        transition: "all 0.15s",
        minHeight: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        ...(isSelected ? { boxShadow: `0 0 20px rgba(${hexRgb(accent)},0.3)` } : {}),
      }}
    >
      {/* Existing count */}
      {ex.total > 0 ? (
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e0e0f0", lineHeight: 1 }}>
            {ex.total.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>existing</div>
          <MiniBar t={ex.t} v={ex.v} m={ex.m} total={ex.total} />
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontStyle: "italic" }}>empty cell</div>
      )}

      {/* Boris new badge */}
      {hasNew && (
        <div style={{
          marginTop: 8,
          background: `rgba(${hexRgb(accent)},0.18)`,
          border: `1px solid rgba(${hexRgb(accent)},0.4)`,
          borderRadius: 5,
          padding: "4px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 0.5 }}>+ {bo.total} new</span>
          </div>
          <MiniBar t={bo.t || 0} v={bo.v || 0} m={bo.m || 0} total={bo.total} height={3} />
        </div>
      )}

      {/* Unknown floater indicator */}
      {boUnk.total > 0 && (
        <div style={{
          position: "absolute", top: 6, right: 6,
          background: "rgba(251,191,36,0.15)",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: 3,
          fontSize: 9, color: "#fbbf24",
          padding: "1px 4px",
        }}>
          +{boUnk.total}?
        </div>
      )}
    </div>
  );
}

function hexRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function DetailPanel({ cellKey, onClose }) {
  if (!cellKey) return null;
  const [col, row] = cellKey.split("-");
  const ex = GRID_DATA.existing[cellKey] || { total: 0 };
  const bo = GRID_DATA.boris[cellKey] || { total: 0 };
  const unkKey = `${col}-Unknown`;
  const boUnk = GRID_DATA.boris[unkKey] || { total: 0 };
  const ctx = ICONIC_CONTEXT[cellKey];
  const accent = COL_COLORS[col];

  const placeable = bo.total;
  const unknown = boUnk.total;

  return (
    <div style={{
      background: "#0d0d1f",
      border: `1px solid rgba(${hexRgb(accent)},0.3)`,
      borderRadius: 10,
      padding: "18px 20px",
      marginTop: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span style={{ color: accent, fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>
            {col}-{row}
          </span>
          <span style={{ color: "#556", fontSize: 12, marginLeft: 10 }}>
            {COL_LABELS[col]} · {ROW_LABELS[row]}
          </span>
        </div>
        <span onClick={onClose} style={{ cursor: "pointer", color: "#445", fontSize: 18 }}>✕</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "#556", marginBottom: 4 }}>EXISTING</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#e0e0f0" }}>{ex.total.toLocaleString()}</div>
        </div>
        <div style={{ background: `rgba(${hexRgb(accent)},0.1)`, borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: accent, marginBottom: 4 }}>BORIS PLACEABLE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{placeable}</div>
          <div style={{ fontSize: 10, color: "#778", marginTop: 2 }}>known familiarity</div>
        </div>
        <div style={{ background: "rgba(251,191,36,0.08)", borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 4 }}>NEEDS SCORING</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>{unknown}</div>
          <div style={{ fontSize: 10, color: "#778", marginTop: 2 }}>familiarity unknown</div>
        </div>
      </div>

      {bo.total > 0 && (
        <div style={{ marginBottom: 12, fontSize: 12, color: "#778" }}>
          <span style={{ color: "#60a5fa" }}>■ T:{bo.t}</span>
          <span style={{ marginLeft: 10, color: "#a78bfa" }}>■ V:{bo.v}</span>
          <span style={{ marginLeft: 10, color: "#fb923c" }}>■ M:{bo.m}</span>
        </div>
      )}

      {ctx && (
        <>
          <div style={{ fontSize: 12, color: "#8899aa", lineHeight: 1.6, marginBottom: 10 }}>
            {ctx.note}
          </div>
          {ctx.examples.length > 0 && (
            <div style={{ fontSize: 11, color: "#556", marginBottom: 10 }}>
              Examples: {ctx.examples.join(" · ")}
            </div>
          )}
          <div style={{
            display: "inline-block",
            padding: "4px 12px", borderRadius: 4,
            background: ctx.verdict.startsWith("✅") ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.12)",
            border: `1px solid ${ctx.verdict.startsWith("✅") ? "rgba(74,222,128,0.3)" : "rgba(251,191,36,0.3)"}`,
            fontSize: 12,
            color: ctx.verdict.startsWith("✅") ? "#4ade80" : "#fbbf24",
            fontWeight: 700,
          }}>
            {ctx.verdict}
          </div>
        </>
      )}
    </div>
  );
}

export default function Boris9x9() {
  const [selected, setSelected] = useState(null);

  // Totals
  const totalNew = Object.values(GRID_DATA.boris).reduce((s, c) => s + c.total, 0);
  const placeable = ["Icons-Famous","Icons-Known","Icons-Obscure","Core-Famous","Core-Known","Core-Obscure","Niche-Famous","Niche-Known","Niche-Obscure"]
    .reduce((s, k) => s + (GRID_DATA.boris[k]?.total || 0), 0);
  const needsScoring = totalNew - placeable;

  return (
    <div style={{
      background: "#070710",
      minHeight: "100vh",
      padding: "24px 24px 40px",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#e0e0f0",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>
          Boris → 9×9 Grid Analysis
        </h1>
        <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap", fontSize: 11 }}>
          <span style={{ color: "#556" }}>3,123 unique new songs</span>
          <span style={{ color: "#4ade80" }}>✓ {placeable} directly placeable (familiarity known)</span>
          <span style={{ color: "#fbbf24" }}>⚠ {needsScoring} need familiarity scoring first</span>
        </div>
        <div style={{ fontSize: 10, color: "#334", marginTop: 6 }}>
          Yellow badge = additional songs from that col with unknown familiarity (can't place in row yet) · Click cell for detail
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14, fontSize: 10, color: "#445" }}>
        <span><span style={{ color: "#60a5fa" }}>■</span> Tango</span>
        <span><span style={{ color: "#a78bfa" }}>■</span> Vals</span>
        <span><span style={{ color: "#fb923c" }}>■</span> Milonga</span>
        <span style={{ marginLeft: 8, color: "#556" }}>Large number = existing pool · <span style={{ color: "#4ade80" }}>Green badge = new from Boris</span></span>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 8 }}>
        {/* Top header */}
        <div />
        {COLS.map(col => (
          <div key={col} style={{
            textAlign: "center", fontSize: 11, fontWeight: 700,
            color: COL_COLORS[col], letterSpacing: 1, textTransform: "uppercase",
            padding: "6px 0",
          }}>
            {COL_LABELS[col]}
          </div>
        ))}

        {/* Rows */}
        {ROWS.map(row => (
          <>
            <div key={`label-${row}`} style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              paddingRight: 10,
              fontSize: 9, color: "#445", textAlign: "right", lineHeight: 1.4,
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              {row}<br />
              <span style={{ color: "#334", fontSize: 8 }}>
                {row === "Famous" ? "≥0.70" : row === "Known" ? "≥0.30" : "<0.30"}
              </span>
            </div>
            {COLS.map(col => (
              <GridCell
                key={`${col}-${row}`}
                col={col}
                row={row}
                onSelect={setSelected}
                selected={selected}
              />
            ))}
          </>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel cellKey={selected} onClose={() => setSelected(null)} />
      )}

      {/* Bottom summary */}
      <div style={{
        marginTop: 24,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 12, fontSize: 11,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 8,
          border: "1px solid #1a1a2e", padding: "12px 16px",
        }}>
          <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>⚠ THE UNKNOWN PROBLEM</div>
          <div style={{ color: "#667", lineHeight: 1.7 }}>
            {needsScoring} songs ({Math.round(needsScoring/totalNew*100)}%) have no matching title in existing familiarity DB.<br/>
            These are <em>net new songs</em> we've never seen — they need a recognition score calculated from:<br/>
            orchBonus only (no rating, no plays) → will land mostly in <span style={{ color: "#a78bfa" }}>Known/Obscure</span>
          </div>
        </div>
        <div style={{
          background: "rgba(74,222,128,0.04)", borderRadius: 8,
          border: "1px solid rgba(74,222,128,0.1)", padding: "12px 16px",
        }}>
          <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>✓ LOAD RECOMMENDATION</div>
          <div style={{ color: "#667", lineHeight: 1.7 }}>
            <span style={{ color: "#4ade80" }}>Load all 3,123</span> — even unrated. Use orchBonus for baseline score.<br/>
            Biggest wins: <span style={{ color: "#c084fc" }}>+87 Icons</span> · <span style={{ color: "#4ade80" }}>+415 Core</span> · <span style={{ color: "#38bdf8" }}>+253 Niche</span> with known familiarity.<br/>
            <span style={{ color: "#fbbf24" }}>+2,367 more</span> need scoring → will distribute across Known/Obscure rows.
          </div>
        </div>
      </div>
    </div>
  );
}
