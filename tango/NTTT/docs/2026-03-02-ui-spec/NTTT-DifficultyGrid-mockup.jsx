import { useState } from "react";

const GRID_MAP = {
  1: { tier: "Big4",    tierlabel: "🌶",       depth: "famous",  depthlabel: "⭐ Famous",   count: 459  },
  2: { tier: "Big4",    tierlabel: "🌶",       depth: "regular", depthlabel: "⭐⭐ Regular", count: 530  },
  3: { tier: "Big4",    tierlabel: "🌶",       depth: "obscure", depthlabel: "⭐⭐⭐ Obscure",count: 439  },
  4: { tier: "Classic", tierlabel: "🌶🌶",     depth: "famous",  depthlabel: "⭐ Famous",   count: 205  },
  5: { tier: "Classic", tierlabel: "🌶🌶",     depth: "regular", depthlabel: "⭐⭐ Regular", count: 352  },
  6: { tier: "Classic", tierlabel: "🌶🌶",     depth: "obscure", depthlabel: "⭐⭐⭐ Obscure",count: 1035 },
  7: { tier: "Deep",    tierlabel: "🌶🌶🌶",   depth: "famous",  depthlabel: "⭐ Famous",   count: 446  },
  8: { tier: "Deep",    tierlabel: "🌶🌶🌶",   depth: "regular", depthlabel: "⭐⭐ Regular", count: 651  },
  9: { tier: "Deep",    tierlabel: "🌶🌶🌶",   depth: "obscure", depthlabel: "⭐⭐⭐ Obscure",count: 616  },
};

const TIER_LABELS = {
  Big4:    { icon: "🌶",     label: "Big 4",   sub: "D'Arienzo, Di Sarli, Troilo, Pugliese" },
  Classic: { icon: "🌶🌶",   label: "Classic", sub: "Canaro, Biagi, Tanturi, Caló & more"   },
  Deep:    { icon: "🌶🌶🌶", label: "Deep",    sub: "40+ orchestras — specialists territory"  },
};

const DEPTH_LABELS = {
  famous:  { icon: "⭐",     label: "Famous",  sub: "Most recognized songs in this group"   },
  regular: { icon: "⭐⭐",   label: "Regular", sub: "Standard milonga repertoire"            },
  obscure: { icon: "⭐⭐⭐", label: "Obscure", sub: "Deep cuts — specialists only"           },
};

const ERA_OPTIONS = [
  { key: "old",     label: "OLD",  sub: "Old Guard" },
  { key: "new",     label: "NEW",  sub: "New Guard" },
  { key: "golden",  label: "GOLD", sub: "Golden Age" },
  { key: "decline", label: "DEC",  sub: "Decline"   },
  { key: "ren",     label: "REN",  sub: "Renaissance"},
];

const STYLES = ["TANGO", "VALS", "MILONGA", "VOCALS"];

export default function OrchestraQuizConfig() {
  const [filterMode, setFilterMode] = useState("level"); // "level" | "era"
  const [selectedCell, setSelectedCell] = useState(1);
  const [selectedEras, setSelectedEras] = useState(["golden"]);
  const [selectedStyles, setSelectedStyles] = useState(["TANGO", "VALS", "MILONGA", "VOCALS"]);

  const cell = GRID_MAP[selectedCell];
  const tier = TIER_LABELS[cell.tier];
  const depth = DEPTH_LABELS[cell.depth];
  const poolCount = filterMode === "level" ? cell.count : 1847;
  const tooSmall = poolCount < 40;

  const toggleEra = (key) => {
    setSelectedEras(prev =>
      prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key]
    );
  };

  const toggleStyle = (s) => {
    setSelectedStyles(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  return (
    <div style={{
      background: "#0d1117",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "24px 16px",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    }}>
      <div style={{
        background: "#161b22",
        borderRadius: 20,
        width: "100%",
        maxWidth: 400,
        overflow: "hidden",
        border: "1px solid #30363d",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 20px 12px",
          borderBottom: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{ fontSize: 22 }}>🎵</div>
          <div>
            <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: 18 }}>Orchestra Quiz</div>
            <div style={{ color: "#7d8590", fontSize: 12 }}>Configure your session</div>
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Filter Mode Toggle */}
          <div>
            <div style={{ color: "#7d8590", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
              FILTER BY
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#0d1117",
              borderRadius: 10,
              padding: 3,
              gap: 3,
            }}>
              {["level", "era"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  style={{
                    padding: "8px 0",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.15s",
                    background: filterMode === mode ? "#238636" : "transparent",
                    color: filterMode === mode ? "#fff" : "#7d8590",
                  }}
                >
                  {mode === "level" ? "🌶 Level" : "📅 ERA"}
                </button>
              ))}
            </div>
          </div>

          {/* LEVEL MODE — 3×3 Grid */}
          {filterMode === "level" && (
            <div>
              {/* Column headers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr 1fr 1fr",
                gap: 4,
                marginBottom: 4,
              }}>
                <div />
                {["⭐", "⭐⭐", "⭐⭐⭐"].map((icon, i) => (
                  <div key={i} style={{
                    textAlign: "center",
                    fontSize: 11,
                    color: "#7d8590",
                    paddingBottom: 4,
                  }}>{icon}</div>
                ))}
              </div>

              {/* Grid rows */}
              {["Big4", "Classic", "Deep"].map((tierKey, rowIdx) => {
                const t = TIER_LABELS[tierKey];
                return (
                  <div key={tierKey} style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr 1fr 1fr",
                    gap: 4,
                    marginBottom: 4,
                  }}>
                    {/* Row label */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                    }}>{t.icon}</div>

                    {/* 3 cells */}
                    {["famous", "regular", "obscure"].map((depthKey, colIdx) => {
                      const cellNum = rowIdx * 3 + colIdx + 1;
                      const c = GRID_MAP[cellNum];
                      const isSelected = selectedCell === cellNum;
                      const isDisabled = c.count < 40;

                      return (
                        <button
                          key={cellNum}
                          onClick={() => !isDisabled && setSelectedCell(cellNum)}
                          title={isDisabled ? "Not enough songs" : `${c.count} songs`}
                          style={{
                            padding: "10px 4px",
                            borderRadius: 10,
                            border: isSelected
                              ? "2px solid #f78166"
                              : "2px solid #30363d",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            background: isSelected
                              ? "rgba(247,129,102,0.15)"
                              : isDisabled
                                ? "#0d1117"
                                : "#21262d",
                            opacity: isDisabled ? 0.35 : 1,
                            transition: "all 0.15s",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <div style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: isSelected ? "#f78166" : "#e6edf3",
                          }}>{cellNum}</div>
                          <div style={{
                            fontSize: 9,
                            color: isSelected ? "#f78166" : "#7d8590",
                            fontWeight: 500,
                          }}>{c.count.toLocaleString()}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Selection description */}
              <div style={{
                marginTop: 8,
                padding: "12px 14px",
                background: "rgba(247,129,102,0.08)",
                borderRadius: 10,
                border: "1px solid rgba(247,129,102,0.2)",
              }}>
                <div style={{ color: "#f78166", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  {tier.icon} {tier.label} · {depth.icon} {depth.label}
                </div>
                <div style={{ color: "#7d8590", fontSize: 11 }}>{tier.sub}</div>
                <div style={{ color: "#7d8590", fontSize: 11 }}>{depth.sub}</div>
                <div style={{
                  marginTop: 6,
                  color: "#3fb950",
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {cell.count.toLocaleString()} songs available
                </div>
              </div>
            </div>
          )}

          {/* ERA MODE */}
          {filterMode === "era" && (
            <div>
              <div style={{ color: "#7d8590", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
                ERA
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ERA_OPTIONS.map(era => {
                  const isOn = selectedEras.includes(era.key);
                  return (
                    <button
                      key={era.key}
                      onClick={() => toggleEra(era.key)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: isOn ? "2px solid #388bfd" : "2px solid #30363d",
                        background: isOn ? "rgba(56,139,253,0.15)" : "#21262d",
                        color: isOn ? "#388bfd" : "#7d8590",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <span>{era.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 400, opacity: 0.7 }}>{era.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: "#21262d" }} />

          {/* Style filter */}
          <div>
            <div style={{ color: "#7d8590", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
              STYLE
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STYLES.map(s => {
                const colors = {
                  TANGO: "#f85149", VALS: "#388bfd",
                  MILONGA: "#3fb950", VOCALS: "#a371f7",
                };
                const isOn = selectedStyles.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: `2px solid ${isOn ? colors[s] : "#30363d"}`,
                      background: isOn ? `${colors[s]}22` : "#21262d",
                      color: isOn ? colors[s] : "#7d8590",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#21262d" }} />

          {/* Pool count + Start */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{
                color: tooSmall ? "#f85149" : "#3fb950",
                fontWeight: 700,
                fontSize: 16,
              }}>
                {poolCount.toLocaleString()} songs
              </div>
              {tooSmall && (
                <div style={{ color: "#f85149", fontSize: 11 }}>
                  Too few — change filters
                </div>
              )}
            </div>
            <button
              disabled={tooSmall}
              style={{
                padding: "12px 32px",
                borderRadius: 12,
                border: "none",
                background: tooSmall ? "#21262d" : "#238636",
                color: tooSmall ? "#7d8590" : "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: tooSmall ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ▶ START
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
