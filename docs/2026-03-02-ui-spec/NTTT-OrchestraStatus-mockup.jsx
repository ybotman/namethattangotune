import { useState } from "react";

// ── Mock Data ────────────────────────────────────────────────────────────────

const GRID_MAP = {
  1: { tier: "Big4",    depth: "famous",  tierIcon: "🌶",     depthIcon: "⭐",     played: 47, avg: 820,  best: 1200, rank: 47,  rankOf: 312 },
  2: { tier: "Big4",    depth: "regular", tierIcon: "🌶",     depthIcon: "⭐⭐",   played: 12, avg: 610,  best: 890,  rank: 112, rankOf: 198 },
  3: { tier: "Big4",    depth: "obscure", tierIcon: "🌶",     depthIcon: "⭐⭐⭐", played: 0,  avg: 0,    best: 0,    rank: null, rankOf: 87  },
  4: { tier: "Classic", depth: "famous",  tierIcon: "🌶🌶",   depthIcon: "⭐",     played: 8,  avg: 540,  best: 700,  rank: 23,  rankOf: 145 },
  5: { tier: "Classic", depth: "regular", tierIcon: "🌶🌶",   depthIcon: "⭐⭐",   played: 0,  avg: 0,    best: 0,    rank: null, rankOf: 98  },
  6: { tier: "Classic", depth: "obscure", tierIcon: "🌶🌶",   depthIcon: "⭐⭐⭐", played: 0,  avg: 0,    best: 0,    rank: null, rankOf: 54  },
  7: { tier: "Deep",    depth: "famous",  tierIcon: "🌶🌶🌶", depthIcon: "⭐",     played: 0,  avg: 0,    best: 0,    rank: null, rankOf: 67  },
  8: { tier: "Deep",    depth: "regular", tierIcon: "🌶🌶🌶", depthIcon: "⭐⭐",   played: 0,  avg: 0,    best: 0,    rank: null, rankOf: 41  },
  9: { tier: "Deep",    depth: "obscure", tierIcon: "🌶🌶🌶", depthIcon: "⭐⭐⭐", played: 0,  avg: 0,    best: 0,    rank: null, rankOf: 12  },
};

const ORCH_DETAIL = {
  Big4: [
    { name: "D'Arienzo", played: 23, pct: 82, color: "#f78166" },
    { name: "Di Sarli",  played: 14, pct: 61, color: "#388bfd" },
    { name: "Troilo",    played: 7,  pct: 41, color: "#a371f7" },
    { name: "Pugliese",  played: 3,  pct: 18, color: "#3fb950" },
  ],
  Classic: [
    { name: "Canaro",   played: 4, pct: 72, color: "#f78166" },
    { name: "Biagi",    played: 3, pct: 55, color: "#388bfd" },
    { name: "Tanturi",  played: 1, pct: 38, color: "#a371f7" },
    { name: "Caló",     played: 0, pct: 0,  color: "#3fb950" },
  ],
  Deep: [],
};

const LEADERBOARD = [
  { rank: 1,  name: "milonguero_BA", score: 2100, flag: "🇦🇷" },
  { rank: 2,  name: "tango_helsinki", score: 1980, flag: "🇫🇮" },
  { rank: 3,  name: "dj_porteno",    score: 1850, flag: "🇦🇷" },
  { rank: 47, name: "YOU",           score: 1200, flag: "🇺🇸", isYou: true },
];

const TIER_META = {
  Big4:    { label: "Big 4",   icon: "🌶",     desc: "D'Arienzo, Di Sarli, Troilo, Pugliese" },
  Classic: { label: "Classic", icon: "🌶🌶",   desc: "Canaro, Biagi, Tanturi, Caló & more"   },
  Deep:    { label: "Deep",    icon: "🌶🌶🌶", desc: "40+ orchestras"                         },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const pct = (val, max) => Math.round((val / max) * 100);

// ── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ active, onChange }) {
  const tabs = [
    { key: "stats",       label: "📊 My Stats"    },
    { key: "orchestras",  label: "🎼 Orchestras"  },
    { key: "contest",     label: "🏆 Contest"     },
  ];
  return (
    <div style={{ display: "flex", gap: 4, padding: "12px 16px 0", borderBottom: "1px solid #21262d" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          flex: 1, padding: "9px 4px", borderRadius: "8px 8px 0 0",
          border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
          background: active === t.key ? "#21262d" : "transparent",
          color: active === t.key ? "#e6edf3" : "#7d8590",
          borderBottom: active === t.key ? "2px solid #f78166" : "2px solid transparent",
          transition: "all 0.15s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function GridCell({ cellNum, data, selected, onClick }) {
  const played = data.played > 0;
  const isSelected = selected === cellNum;
  return (
    <button onClick={() => onClick(cellNum)} style={{
      padding: "8px 4px", borderRadius: 10,
      border: isSelected ? "2px solid #f78166" : played ? "2px solid #30363d" : "2px solid #21262d",
      background: isSelected ? "rgba(247,129,102,0.12)" : played ? "#21262d" : "#0d1117",
      cursor: "pointer", transition: "all 0.15s",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      opacity: played ? 1 : 0.45,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "#f78166" : played ? "#e6edf3" : "#7d8590" }}>
        {cellNum}
      </div>
      {played ? (
        <>
          <div style={{ fontSize: 9, color: "#3fb950", fontWeight: 600 }}>{data.played}▶</div>
          <div style={{ fontSize: 9, color: "#7d8590" }}>⚡{data.avg}</div>
        </>
      ) : (
        <div style={{ fontSize: 8, color: "#7d8590" }}>play</div>
      )}
    </button>
  );
}

function StatsGrid({ selected, onSelect }) {
  return (
    <div>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr 1fr", gap: 4, marginBottom: 4 }}>
        <div />
        {["⭐ Famous", "⭐⭐ Reg.", "⭐⭐⭐ Obs."].map((h, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: "#7d8590" }}>{h}</div>
        ))}
      </div>
      {/* Rows */}
      {["Big4", "Classic", "Deep"].map((tierKey, rowIdx) => {
        const t = TIER_META[tierKey];
        return (
          <div key={tierKey} style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr 1fr", gap: 4, marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
              {t.icon}
            </div>
            {[0, 1, 2].map(col => {
              const cellNum = rowIdx * 3 + col + 1;
              return <GridCell key={cellNum} cellNum={cellNum} data={GRID_MAP[cellNum]} selected={selected} onClick={onSelect} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function CellDetail({ cellNum }) {
  const d = GRID_MAP[cellNum];
  if (!d.played) return (
    <div style={{ padding: "14px", background: "#0d1117", borderRadius: 10, textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "#7d8590", marginBottom: 8 }}>No plays yet in this bucket</div>
      <button style={{
        padding: "8px 24px", borderRadius: 8, border: "none",
        background: "#238636", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
      }}>▶ Play Now</button>
    </div>
  );
  const maxScore = 2100;
  return (
    <div style={{ padding: "14px", background: "#0d1117", borderRadius: 10 }}>
      <div style={{ color: "#f78166", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
        {d.tierIcon} {TIER_META[d.tier].label} · {d.depthIcon}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Played", value: d.played, icon: "🎵" },
          { label: "Avg Score", value: d.avg, icon: "⚡" },
          { label: "Best", value: d.best, icon: "🏆" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center", background: "#161b22", borderRadius: 8, padding: "8px 4px" }}>
            <div style={{ fontSize: 16 }}>{stat.icon}</div>
            <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>{stat.value.toLocaleString()}</div>
            <div style={{ color: "#7d8590", fontSize: 10 }}>{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Score bar */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "#7d8590", fontSize: 11 }}>Your best</span>
          <span style={{ color: "#3fb950", fontSize: 11, fontWeight: 600 }}>
            #{d.rank} of {d.rankOf}
          </span>
        </div>
        <div style={{ background: "#21262d", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div style={{
            width: `${pct(d.best, maxScore)}%`, height: "100%",
            background: "linear-gradient(90deg, #238636, #3fb950)",
            borderRadius: 4, transition: "width 0.6s ease",
          }} />
        </div>
      </div>
      <button style={{
        width: "100%", marginTop: 8, padding: "9px 0", borderRadius: 8,
        border: "1px solid #f78166", background: "transparent",
        color: "#f78166", fontWeight: 700, fontSize: 13, cursor: "pointer",
      }}>▶ Play this bucket</button>
    </div>
  );
}

function OrchestraTab({ selectedTier, onSelectTier }) {
  const tiers = ["Big4", "Classic", "Deep"];
  const orchs = ORCH_DETAIL[selectedTier] || [];
  const maxPct = 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Tier selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {tiers.map(t => {
          const meta = TIER_META[t];
          const isOn = selectedTier === t;
          return (
            <button key={t} onClick={() => onSelectTier(t)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 8,
              border: isOn ? "2px solid #f78166" : "2px solid #30363d",
              background: isOn ? "rgba(247,129,102,0.12)" : "#21262d",
              color: isOn ? "#f78166" : "#7d8590",
              cursor: "pointer", fontSize: 12, fontWeight: 700,
            }}>{meta.icon} {meta.label}</button>
          );
        })}
      </div>
      {/* Orchestra bars */}
      {orchs.length === 0 ? (
        <div style={{ textAlign: "center", color: "#7d8590", fontSize: 13, padding: 20 }}>
          No plays yet — start playing Deep orchestras!
        </div>
      ) : (
        orchs.map(o => (
          <div key={o.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600 }}>{o.name}</span>
              <span style={{ color: "#7d8590", fontSize: 12 }}>{o.played} songs · {o.pct}%</span>
            </div>
            <div style={{ background: "#21262d", borderRadius: 4, height: 8, overflow: "hidden" }}>
              <div style={{
                width: `${o.pct}%`, height: "100%",
                background: `linear-gradient(90deg, ${o.color}88, ${o.color})`,
                borderRadius: 4,
              }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ContestTab({ selectedCell }) {
  const d = GRID_MAP[selectedCell];
  const meta = TIER_META[d.tier];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 14 }}>
        <div style={{ color: "#7d8590", fontSize: 11, marginBottom: 4 }}>Current bucket</div>
        <div style={{ color: "#f78166", fontWeight: 700, fontSize: 14 }}>
          {meta.icon} {meta.label} · {d.depthIcon}
        </div>
        {d.rank ? (
          <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
            <div>
              <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: 22 }}>#{d.rank}</div>
              <div style={{ color: "#7d8590", fontSize: 11 }}>Your rank</div>
            </div>
            <div>
              <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: 22 }}>{d.rankOf}</div>
              <div style={{ color: "#7d8590", fontSize: 11 }}>Players</div>
            </div>
            <div>
              <div style={{ color: "#3fb950", fontWeight: 700, fontSize: 22 }}>{d.best.toLocaleString()}</div>
              <div style={{ color: "#7d8590", fontSize: 11 }}>Your best</div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#7d8590", fontSize: 12, marginTop: 6 }}>Play this bucket to join the contest</div>
        )}
      </div>
      {/* Leaderboard */}
      <div>
        <div style={{ color: "#7d8590", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
          LEADERBOARD — CELL {selectedCell}
        </div>
        {LEADERBOARD.map((p, i) => {
          const isYou = p.isYou;
          const showDots = i === 3 && p.rank > 4;
          return (
            <div key={p.rank}>
              {showDots && (
                <div style={{ textAlign: "center", color: "#7d8590", fontSize: 12, padding: "4px 0" }}>· · ·</div>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                background: isYou ? "rgba(247,129,102,0.08)" : "#0d1117",
                border: isYou ? "1px solid rgba(247,129,102,0.3)" : "1px solid transparent",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: p.rank <= 3 ? ["#FFD700","#C0C0C0","#CD7F32"][p.rank-1] : "#21262d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: p.rank <= 3 ? "#0d1117" : "#7d8590",
                }}>
                  {p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : `#${p.rank}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: isYou ? "#f78166" : "#e6edf3",
                    fontWeight: isYou ? 700 : 500, fontSize: 13,
                  }}>
                    {p.flag} {p.name} {isYou ? "(you)" : ""}
                  </div>
                </div>
                <div style={{ color: "#3fb950", fontWeight: 700, fontSize: 14 }}>
                  {p.score.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OrchestraStatus() {
  const [tab, setTab] = useState("stats");
  const [selectedCell, setSelectedCell] = useState(1);
  const [orchTier, setOrchTier] = useState("Big4");

  const totalPlayed = Object.values(GRID_MAP).reduce((s, c) => s + c.played, 0);
  const totalBest = Math.max(...Object.values(GRID_MAP).map(c => c.best));

  return (
    <div style={{
      background: "#0d1117", minHeight: "100vh",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "24px 16px",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    }}>
      <div style={{
        background: "#161b22", borderRadius: 20,
        width: "100%", maxWidth: 400,
        border: "1px solid #30363d", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid #21262d" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: 18 }}>Orchestra Quiz</div>
              <div style={{ color: "#7d8590", fontSize: 12, marginTop: 2 }}>Your Progress</div>
            </div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#3fb950", fontWeight: 700, fontSize: 18 }}>{totalPlayed}</div>
                <div style={{ color: "#7d8590", fontSize: 10 }}>played</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f78166", fontWeight: 700, fontSize: 18 }}>{totalBest.toLocaleString()}</div>
                <div style={{ color: "#7d8590", fontSize: 10 }}>best</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar active={tab} onChange={setTab} />

        {/* Content */}
        <div style={{ padding: "16px 16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {tab === "stats" && (
            <>
              <StatsGrid selected={selectedCell} onSelect={setSelectedCell} />
              <CellDetail cellNum={selectedCell} />
            </>
          )}

          {tab === "orchestras" && (
            <OrchestraTab selectedTier={orchTier} onSelectTier={setOrchTier} />
          )}

          {tab === "contest" && (
            <ContestTab selectedCell={selectedCell} />
          )}

        </div>
      </div>
    </div>
  );
}
