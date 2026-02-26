import { useState, useMemo } from "react";

const DATA = {
  total: 4675,
  playable: 4555,
  doNotPlay: 120,
  noAudioUrl: 0,
  missing: {
    orchestra: { count: 95, playable: 45 },
    year: { count: 177, playable: 141 },
    title: { count: 0, playable: 0 },
    both: { count: 38 },
  },
  samplesMissingOrchestra: [
    { id: "7bdaa33e", title: "La Cumparsita", year: "1929", style: "Tango" },
    { id: "a1309454", title: "Milonga Sentimental", year: "1932", style: "Milonga" },
    { id: "8a551ce6", title: "Soy una fiera", year: "1945", style: "Milonga" },
    { id: "b6bb95de", title: "La Naranja Nacio Verde", year: "1943", style: "Milonga" },
    { id: "13113817", title: "Ficha personal", year: "1952", style: "Milonga" },
    { id: "b27e9020", title: "La Naranja Nacio Verde", year: "1949", style: "Milonga" },
    { id: "5febe996", title: "Corrales viejos", year: "1953", style: "Milonga" },
    { id: "22e08e21", title: "Mano Brava", year: "1942", style: "Milonga" },
    { id: "b9f8f19a", title: "Milonga de mis amores", year: "1953", style: "Milonga" },
    { id: "01e3c5da", title: "La Naranja Nacio Verde", year: "", style: "Milonga" },
    { id: "91b34f1c", title: "Begin for Julia", year: "2001", style: "Tango" },
    { id: "95d28ab2", title: "No Hay Tierra Domo La Mia", year: "", style: "Milonga" },
    { id: "ad35e191", title: "La cumparsita", year: "1955", style: "Tango" },
    { id: "4b34b9f2", title: "La cumparsita", year: "2006", style: "Tango" },
    { id: "ae3b86d1", title: "El Ponchazo", year: "1941", style: "Tango" },
    { id: "78323cae", title: "Barrilito", year: "1940", style: "Tango" },
    { id: "02172fd9", title: "Rodriguez Pena", year: "1927", style: "Tango" },
    { id: "857ceae3", title: "El Entrerriano", year: "1940", style: "Tango" },
    { id: "b9056c0f", title: "Son nefes - Ibrahim Ozgur", year: "2001", style: "Tango" },
    { id: "8679e9fa", title: "Ayse - Ibrahim Ozgur", year: "2004", style: "Tango" },
  ],
  samplesMissingYear: [
    { id: "4cdce63b", title: "Ruego", orchestra: "Edgardo Donato", style: "Tango" },
    { id: "b8e84aa7", title: "Entre Los Ceibos", orchestra: "Roberto Firpo", style: "Vals" },
    { id: "60c1d5c3", title: "La Mulita+", orchestra: "Roberto Firpo", style: "Milonga" },
    { id: "310e90b3", title: "Recordando Lo Pasado", orchestra: "Roberto Firpo", style: "Vals" },
    { id: "9ab36854", title: "El Internado+", orchestra: "Roberto Firpo", style: "Tango" },
    { id: "f3a34815", title: "Chagrin d'amour", orchestra: "Mario Melfi", style: "Tango" },
    { id: "a37f1970", title: "Reviens Piccina Bella", orchestra: "Mario Melfi", style: "Tango" },
    { id: "9b529f02", title: "Un tango, Madame", orchestra: "Mario Melfi", style: "Tango" },
    { id: "dd50f57b", title: "Ecris-moi", orchestra: "Mario Melfi", style: "Tango" },
    { id: "d95637a9", title: "Nostalgias", orchestra: "Mario Melfi", style: "Tango" },
    { id: "084c906a", title: "Mieux que personne", orchestra: "Mario Melfi", style: "Tango" },
    { id: "ba32d535", title: "Yo canto", orchestra: "Mario Melfi", style: "Tango" },
    { id: "ac9a0252", title: "Madre", orchestra: "Mario Melfi", style: "Tango" },
    { id: "0c28cab4", title: "Demain", orchestra: "Mario Melfi", style: "Tango" },
    { id: "0b78eaa2", title: "Ce soir je veux t'aimer", orchestra: "Mario Melfi", style: "Tango" },
    { id: "01e3c5da", title: "La Naranja Nacio Verde", orchestra: "", style: "Milonga" },
    { id: "d64fe721", title: "Bajo Un Cielo De Estrellas...", orchestra: "Miguel Calo", style: "Vals" },
    { id: "fd399cd1", title: "Remembranzas(slow.ver)...", orchestra: "Juan D'Arienzo", style: "Tango" },
    { id: "bfc77548", title: "El Resero", orchestra: "Carlos Di Sarli", style: "Tango" },
    { id: "0f98b984", title: "Remembranza(fast.ver)...", orchestra: "Juan D'Arienzo", style: "Tango" },
  ],
};

// Derive insights
const pctClean = (((DATA.total - DATA.missing.orchestra.count - DATA.missing.year.count + DATA.missing.both.count) / DATA.total) * 100).toFixed(1);
const missingYearOrch = DATA.samplesMissingYear.reduce((acc, s) => {
  const o = s.orchestra || "(none)";
  acc[o] = (acc[o] || 0) + 1;
  return acc;
}, {});
const missingOrchestraStyles = DATA.samplesMissingOrchestra.reduce((acc, s) => {
  acc[s.style] = (acc[s.style] || 0) + 1;
  return acc;
}, {});

function Gauge({ value, max, label, color, sublabel }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
        <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: 80, height: 80 }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color }}>{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{ fontSize: 9, color: "#7B6F63", marginTop: 4, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 8, color: "#3E3830" }}>{sublabel}</div>
    </div>
  );
}

function BarSegment({ segments, total, height = 28 }) {
  return (
    <div style={{ display: "flex", height, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
      {segments.map((s, i) => (
        <div key={i} title={`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}
          style={{
            width: `${(s.value / total) * 100}%`, background: s.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 7, fontWeight: 600, color: s.value / total > 0.04 ? "#0D0D0D" : "transparent",
            transition: "width 0.6s ease",
          }}>
          {s.value / total > 0.04 ? s.value : ""}
        </div>
      ))}
    </div>
  );
}

export default function DataQualityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hovRow, setHovRow] = useState(null);

  const orchGrouped = useMemo(() => {
    return Object.entries(missingYearOrch).sort(([,a],[,b]) => b - a);
  }, []);

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

      <div style={{ position: "relative", zIndex: 1, padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#C9A959", textTransform: "uppercase" }}>NTTT · Diagnóstico</div>
          <h1 style={{
            fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400, margin: "6px 0 4px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            background: "linear-gradient(135deg, #E8E0D8, #C9A959, #E8E0D8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Data Quality Report
          </h1>
          <div style={{ fontSize: 10, color: "#5A5048" }}>
            {DATA.total.toLocaleString()} songs · {pctClean}% complete records · Generated Feb 26, 2026
          </div>
        </div>

        {/* Health Score */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32, marginBottom: 28, flexWrap: "wrap",
        }}>
          <Gauge value={DATA.playable} max={DATA.total} label="PLAYABLE" color="#4CAF50" sublabel={`${DATA.playable} of ${DATA.total}`} />
          <Gauge value={DATA.total - DATA.missing.orchestra.count} max={DATA.total} label="HAS ORCHESTRA" color="#C9A959" sublabel={`${DATA.missing.orchestra.count} missing`} />
          <Gauge value={DATA.total - DATA.missing.year.count} max={DATA.total} label="HAS YEAR" color="#D4463A" sublabel={`${DATA.missing.year.count} missing`} />
          <Gauge value={DATA.total - DATA.missing.title.count} max={DATA.total} label="HAS TITLE" color="#3D7B8A" sublabel="0 missing" />
        </div>

        {/* Composition Bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, color: "#5A5048", letterSpacing: 2, marginBottom: 6 }}>LIBRARY COMPOSITION</div>
          <BarSegment total={DATA.total} height={32} segments={[
            { label: "Clean & Playable", value: DATA.playable - DATA.missing.orchestra.playable - DATA.missing.year.playable + DATA.missing.both.count, color: "#4CAF50" },
            { label: "Missing Year (playable)", value: DATA.missing.year.playable - DATA.missing.both.count, color: "#D4463A88" },
            { label: "Missing Orchestra (playable)", value: DATA.missing.orchestra.playable - DATA.missing.both.count, color: "#C9A95988" },
            { label: "Missing Both", value: DATA.missing.both.count, color: "#FF5722aa" },
            { label: "Do Not Play", value: DATA.doNotPlay, color: "#37474F" },
          ]} />
          <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
            {[
              { color: "#4CAF50", label: "Clean & Playable" },
              { color: "#D4463A88", label: "Missing Year" },
              { color: "#C9A95988", label: "Missing Orchestra" },
              { color: "#FF5722aa", label: "Missing Both" },
              { color: "#37474F", label: "Do Not Play" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: l.color }} />
                <span style={{ fontSize: 8, color: "#5A5048" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 24 }}>
          {[
            { label: "Total Songs", value: DATA.total, color: "#E8E0D8" },
            { label: "Playable", value: DATA.playable, color: "#4CAF50" },
            { label: "Do Not Play", value: DATA.doNotPlay, color: "#FF5722" },
            { label: "Missing Orchestra", value: DATA.missing.orchestra.count, color: "#C9A959" },
            { label: "Missing Year", value: DATA.missing.year.count, color: "#D4463A" },
            { label: "Missing Both", value: DATA.missing.both.count, color: "#FF5722" },
          ].map(c => (
            <div key={c.label} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 4, padding: "10px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 300, color: c.color, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {c.value.toLocaleString()}
              </div>
              <div style={{ fontSize: 8, color: "#5A5048", letterSpacing: 1, marginTop: 2 }}>{c.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[["overview","OVERVIEW"],["orch","MISSING ORCHESTRA"],["year","MISSING YEAR"],["insights","INSIGHTS"]].map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)} style={{
              background: activeTab === v ? "rgba(201,169,89,0.12)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeTab === v ? "rgba(201,169,89,0.3)" : "rgba(255,255,255,0.04)"}`,
              color: activeTab === v ? "#C9A959" : "#5A5048",
              padding: "5px 12px", borderRadius: 3, cursor: "pointer", fontSize: 9, letterSpacing: 1,
            }}>{l}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: 4, padding: 16,
        }}>

          {activeTab === "overview" && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 300, color: "#C9A959", margin: "0 0 12px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Field Completeness
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { field: "Title", missing: 0, total: DATA.total, color: "#3D7B8A" },
                  { field: "Orchestra", missing: DATA.missing.orchestra.count, total: DATA.total, color: "#C9A959" },
                  { field: "Year", missing: DATA.missing.year.count, total: DATA.total, color: "#D4463A" },
                ].map(f => {
                  const pct = ((f.total - f.missing) / f.total) * 100;
                  return (
                    <div key={f.field}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#7B6F63" }}>{f.field}</span>
                        <span style={{ fontSize: 10, color: f.missing === 0 ? "#4CAF50" : f.color }}>
                          {pct.toFixed(1)}% complete · {f.missing} missing
                        </span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.03)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 3,
                          background: `linear-gradient(90deg, ${f.color}88, ${f.color})`,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 300, color: "#C9A959", margin: "0 0 12px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Impact on Game Modes
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { mode: "Orchestra Game", affected: DATA.missing.orchestra.playable, desc: "Songs unplayable without orchestra", color: "#C9A959" },
                    { mode: "Year Game", affected: DATA.missing.year.playable, desc: "Songs unplayable without year", color: "#D4463A" },
                    { mode: "Song Title Game", affected: 0, desc: "All songs have titles ✓", color: "#4CAF50" },
                    { mode: "Combined (Orch+Year)", affected: DATA.missing.both.count, desc: "Songs missing both fields", color: "#FF5722" },
                  ].map(m => (
                    <div key={m.mode} style={{
                      padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 3,
                      borderLeft: `3px solid ${m.color}`,
                    }}>
                      <div style={{ fontSize: 10, color: "#E8E0D8", fontWeight: 500 }}>{m.mode}</div>
                      <div style={{ fontSize: 18, color: m.color, fontWeight: 300, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {m.affected} songs
                      </div>
                      <div style={{ fontSize: 8, color: "#5A5048" }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orch" && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 300, color: "#C9A959", margin: "0 0 4px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Songs Missing Orchestra ({DATA.samplesMissingOrchestra.length} samples of {DATA.missing.orchestra.count})
              </h3>
              <div style={{ fontSize: 9, color: "#5A5048", marginBottom: 12 }}>
                Style breakdown: {Object.entries(missingOrchestraStyles).map(([k,v]) => `${k} (${v})`).join(" · ")}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(201,169,89,0.15)" }}>
                      {["#","Title","Year","Style","Song ID"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "#C9A959", fontSize: 8, letterSpacing: 1, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DATA.samplesMissingOrchestra.map((s, i) => (
                      <tr key={s.id}
                        onMouseEnter={() => setHovRow(`o${i}`)}
                        onMouseLeave={() => setHovRow(null)}
                        style={{
                          background: hovRow === `o${i}` ? "rgba(201,169,89,0.04)" : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.02)",
                        }}>
                        <td style={{ padding: "4px 8px", color: "#3E3830", fontSize: 8 }}>{i + 1}</td>
                        <td style={{ padding: "4px 8px", color: "#E8E0D8" }}>{s.title}</td>
                        <td style={{ padding: "4px 8px", color: s.year ? "#7B6F63" : "#FF5722" }}>{s.year || "—"}</td>
                        <td style={{ padding: "4px 8px" }}>
                          <span style={{
                            padding: "1px 6px", borderRadius: 2, fontSize: 8,
                            background: s.style === "Tango" ? "rgba(212,70,58,0.12)" : s.style === "Milonga" ? "rgba(201,169,89,0.12)" : "rgba(61,123,138,0.12)",
                            color: s.style === "Tango" ? "#D4463A" : s.style === "Milonga" ? "#C9A959" : "#3D7B8A",
                          }}>{s.style}</span>
                        </td>
                        <td style={{ padding: "4px 8px", color: "#3E3830", fontSize: 8, fontFamily: "monospace" }}>{s.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "year" && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 300, color: "#C9A959", margin: "0 0 4px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Songs Missing Year ({DATA.samplesMissingYear.length} samples of {DATA.missing.year.count})
              </h3>
              <div style={{ fontSize: 9, color: "#5A5048", marginBottom: 12 }}>
                Concentration: {orchGrouped.map(([k,v]) => `${k} (${v})`).join(" · ")}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(201,169,89,0.15)" }}>
                      {["#","Title","Orchestra","Style","Song ID"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "#C9A959", fontSize: 8, letterSpacing: 1, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DATA.samplesMissingYear.map((s, i) => (
                      <tr key={s.id}
                        onMouseEnter={() => setHovRow(`y${i}`)}
                        onMouseLeave={() => setHovRow(null)}
                        style={{
                          background: hovRow === `y${i}` ? "rgba(201,169,89,0.04)" : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.02)",
                        }}>
                        <td style={{ padding: "4px 8px", color: "#3E3830", fontSize: 8 }}>{i + 1}</td>
                        <td style={{ padding: "4px 8px", color: "#E8E0D8" }}>{s.title}</td>
                        <td style={{ padding: "4px 8px", color: s.orchestra ? "#7B6F63" : "#FF5722" }}>{s.orchestra || "—"}</td>
                        <td style={{ padding: "4px 8px" }}>
                          <span style={{
                            padding: "1px 6px", borderRadius: 2, fontSize: 8,
                            background: s.style === "Tango" ? "rgba(212,70,58,0.12)" : s.style === "Milonga" ? "rgba(201,169,89,0.12)" : "rgba(61,123,138,0.12)",
                            color: s.style === "Tango" ? "#D4463A" : s.style === "Milonga" ? "#C9A959" : "#3D7B8A",
                          }}>{s.style}</span>
                        </td>
                        <td style={{ padding: "4px 8px", color: "#3E3830", fontSize: 8, fontFamily: "monospace" }}>{s.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 300, color: "#C9A959", margin: "0 0 16px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Data Quality Insights
              </h3>

              {/* Patterns */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    icon: "🎵", title: "Mario Melfi Dominates Missing Years",
                    desc: "9 of 20 sample records missing year belong to Mario Melfi — all French-titled tangos. Likely a bulk import without year metadata. This single orchestra accounts for a disproportionate share of the missing-year problem.",
                    severity: "high", color: "#D4463A",
                  },
                  {
                    icon: "🔄", title: "Duplicate Titles in Missing Orchestra",
                    desc: "\"La Naranja Nacio Verde\" appears 3 times (1943, 1949, no year) and \"La cumparsita\" appears 3 times (1929, 1955, 2006) — all without orchestra. These are likely different recordings that need orchestra attribution.",
                    severity: "medium", color: "#C9A959",
                  },
                  {
                    icon: "🌍", title: "Non-Argentine Entries Without Orchestra",
                    desc: "Ibrahim Ozgur tracks (2001, 2004) and \"Begin for Julia\" (2001) lack orchestra — these are non-traditional entries that may need special handling or a separate category.",
                    severity: "low", color: "#3D7B8A",
                  },
                  {
                    icon: "📋", title: "Roberto Firpo Missing Years",
                    desc: "4 Firpo tracks lack year data — given Firpo's extensive discography spanning 1916–1959, these are likely researchable through existing databases like TangoTunes or TodoTango.",
                    severity: "medium", color: "#C9A959",
                  },
                  {
                    icon: "✅", title: "Overall Health: Strong",
                    desc: `${pctClean}% of songs have both orchestra and year. Only 38 songs (0.8%) are missing both critical fields. Title completeness is 100%. The library is in excellent shape for game mode deployment.`,
                    severity: "good", color: "#4CAF50",
                  },
                  {
                    icon: "🎮", title: "Game Impact Assessment",
                    desc: `Orchestra game loses 45 playable songs (1%). Year game loses 141 playable songs (3.1%). These are manageable — game logic should filter these out and log them for future curation rather than blocking deployment.`,
                    severity: "good", color: "#4CAF50",
                  },
                ].map((insight, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 4,
                    background: "rgba(255,255,255,0.02)",
                    borderLeft: `3px solid ${insight.color}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{insight.icon}</span>
                      <span style={{ fontSize: 11, color: "#E8E0D8", fontWeight: 500 }}>{insight.title}</span>
                      <span style={{
                        fontSize: 7, padding: "1px 6px", borderRadius: 2, marginLeft: "auto",
                        background: insight.severity === "high" ? "rgba(212,70,58,0.15)" : insight.severity === "medium" ? "rgba(201,169,89,0.15)" : insight.severity === "good" ? "rgba(76,175,80,0.15)" : "rgba(61,123,138,0.15)",
                        color: insight.color, letterSpacing: 1, textTransform: "uppercase",
                      }}>{insight.severity}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#7B6F63", lineHeight: 1.5, paddingLeft: 22 }}>
                      {insight.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Priority Actions */}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 300, color: "#C9A959", margin: "0 0 10px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Recommended Actions (Priority Order)
                </h4>
                {[
                  { pri: 1, action: "Research Mario Melfi years", impact: "~9 songs", effort: "Low" },
                  { pri: 2, action: "Attribute orchestra to La Cumparsita variants", impact: "~3 songs", effort: "Low" },
                  { pri: 3, action: "Research Roberto Firpo missing years", impact: "~4 songs", effort: "Low" },
                  { pri: 4, action: "Decide on non-Argentine tracks (Ozgur, etc.)", impact: "~3 songs", effort: "Medium" },
                  { pri: 5, action: "Bulk clean La Naranja Nacio Verde duplicates", impact: "~3 songs", effort: "Low" },
                  { pri: 6, action: "Add game-mode filter for incomplete records", impact: "~186 songs excluded safely", effort: "Medium" },
                ].map(a => (
                  <div key={a.pri} style={{
                    display: "flex", gap: 10, alignItems: "center", padding: "6px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.02)",
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, background: "rgba(201,169,89,0.12)", color: "#C9A959",
                    }}>{a.pri}</span>
                    <span style={{ fontSize: 10, color: "#E8E0D8", flex: 1 }}>{a.action}</span>
                    <span style={{ fontSize: 8, color: "#5A5048" }}>{a.impact}</span>
                    <span style={{
                      fontSize: 7, padding: "1px 6px", borderRadius: 2,
                      background: a.effort === "Low" ? "rgba(76,175,80,0.1)" : "rgba(201,169,89,0.1)",
                      color: a.effort === "Low" ? "#4CAF50" : "#C9A959",
                    }}>{a.effort}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 8, color: "rgba(90,80,72,0.35)", letterSpacing: 2 }}>
          NTTT · DIAGNÓSTICO · {DATA.total} SONGS · {pctClean}% COMPLETE
        </div>
      </div>
    </div>
  );
}
