// src/app/reports/volumetrics/dnp-report/page.js
"use client";

import { useState, useMemo } from "react";

// DNP data grouped by orchestra - 59 songs total (updated 2026-02-26)
const DNP_DATA = [
  {
    o: "(No Orchestra)",
    c: 50,
    songs: [
      { t: "Begin for Julia", y: "2001", s: "", r: "no_orchestra" },
      { t: "La cumparsita", y: "2006", s: "", r: "no_orchestra" },
      { t: "Son nefes - Ibrahim Ozgur", y: "2001", s: "", r: "no_orchestra" },
      { t: "Ayse - Ibrahim Ozgur", y: "2004", s: "", r: "no_orchestra" },
      { t: "Askin sesi - Ibrahim Ozgur", y: "2001", s: "", r: "no_orchestra" },
      { t: "VargasLacava_Copa de ajeno", y: "", s: "", r: "missing_data" },
      { t: "VargasLacava_Cualquier cosa", y: "", s: "", r: "missing_data" },
      { t: "04 Rie Payaso", y: "", s: "", r: "missing_data" },
      { t: "11 Shusheta", y: "", s: "", r: "missing_data" },
      { t: "Rebeldia", y: "2002", s: "", r: "no_orchestra" },
      { t: "Mano Brava", y: "2009", s: "", r: "no_orchestra" },
      { t: "El Marne", y: "2021", s: "", r: "no_orchestra" },
      { t: "Mi Dolor", y: "2018", s: "", r: "no_orchestra" },
    ]
  },
  {
    o: "Ricardo Malerba",
    c: 2,
    songs: [
      { t: "Corazon de artista", y: "2017", s: "", r: "wrong_year" },
      { t: "Veinticuatro de Agosto", y: "2017", s: "", r: "wrong_year" },
    ]
  },
  {
    o: "Domingo Federico",
    c: 2,
    songs: [
      { t: "Pobre Novia (Remastered)", y: "2021", s: "", r: "remaster_date" },
      { t: "Tropical (Remastered)", y: "2021", s: "", r: "remaster_date" },
    ]
  },
  {
    o: "Miguel Calo",
    c: 1,
    songs: [
      { t: "Pedacito De Cielo (1942)", y: "1999", s: "Alberto Podesta", r: "wrong_year" },
    ]
  },
  {
    o: "Francisco Lomuto",
    c: 1,
    songs: [
      { t: "Cicatrices", y: "2015", s: "", r: "wrong_year" },
    ]
  },
  {
    o: "Edgardo Donato",
    c: 1,
    songs: [
      { t: "La shunca", y: "2016", s: "", r: "wrong_year" },
    ]
  },
  {
    o: "Alfredo de Angelis",
    c: 1,
    songs: [
      { t: "Obsesion", y: "2014", s: "", r: "wrong_year" },
    ]
  },
  {
    o: "Osvaldo Pugliese",
    c: 1,
    songs: [
      { t: "Sentencia", y: "2011", s: "", r: "wrong_year" },
    ]
  },
];

const REASON_INFO = {
  wrong_year: {
    label: "Wrong Year",
    color: "#E53935",
    desc: "Year in metadata is a reissue/remaster date, not the original recording year",
    action: "Research the original recording year and update the metadata",
  },
  remaster_date: {
    label: "Remaster Date",
    color: "#FB8C00",
    desc: "Year shows remaster date instead of original",
    action: "Find the original recording year from discography sources",
  },
  no_orchestra: {
    label: "No Orchestra",
    color: "#7B1FA2",
    desc: "Cannot identify the orchestra from metadata",
    action: "Research the recording and add the correct orchestra",
  },
  missing_data: {
    label: "Missing Data",
    color: "#455A64",
    desc: "Missing critical fields (year, orchestra, or both)",
    action: "Complete the metadata from reliable sources",
  },
  data_quality: {
    label: "Data Quality",
    color: "#795548",
    desc: "General data quality issue",
    action: "Review and fix the specific issue",
  },
};

const TOTAL_SONGS = 4675;
const DNP_COUNT = 59;
const PLAYABLE_COUNT = 4616;

export default function DNPReportPage() {
  const [expandedOrch, setExpandedOrch] = useState(null);
  const [filterReason, setFilterReason] = useState("all");

  // Count by reason
  const reasonCounts = useMemo(() => {
    const counts = {};
    DNP_DATA.forEach(orch => {
      orch.songs.forEach(s => {
        const r = s.r || "data_quality";
        counts[r] = (counts[r] || 0) + 1;
      });
    });
    return counts;
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    if (filterReason === "all") return DNP_DATA;
    return DNP_DATA.map(orch => ({
      ...orch,
      songs: orch.songs.filter(s => s.r === filterReason),
      c: orch.songs.filter(s => s.r === filterReason).length,
    })).filter(orch => orch.c > 0);
  }, [filterReason]);

  const filteredTotal = filteredData.reduce((sum, o) => sum + o.c, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #080808 0%, #1A0A0A 40%, #0C0C10 100%)",
      color: "#E8E0D8",
      fontFamily: "'SF Mono', 'Courier New', monospace",
      padding: "24px 16px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#E53935", textTransform: "uppercase" }}>
            NTTT · Data Quality
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 400,
            margin: "8px 0",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: "#E53935",
          }}>
            Do Not Play (DNP) Report
          </h1>
          <div style={{ fontSize: 11, color: "#7B6F63" }}>
            Songs excluded from gameplay due to data quality issues
          </div>
        </div>

        {/* Summary Card */}
        <div style={{
          background: "rgba(229, 57, 53, 0.08)",
          border: "1px solid rgba(229, 57, 53, 0.25)",
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: "#E53935" }}>{DNP_COUNT}</div>
              <div style={{ fontSize: 10, color: "#7B6F63", letterSpacing: 1 }}>DNP SONGS</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: "#4CAF50" }}>{PLAYABLE_COUNT}</div>
              <div style={{ fontSize: 10, color: "#7B6F63", letterSpacing: 1 }}>PLAYABLE</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: "#5A5048" }}>
                {((DNP_COUNT / TOTAL_SONGS) * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 10, color: "#7B6F63", letterSpacing: 1 }}>EXCLUDED</div>
            </div>
          </div>
        </div>

        {/* Recently Fixed */}
        <div style={{
          background: "rgba(76, 175, 80, 0.08)",
          border: "1px solid rgba(76, 175, 80, 0.25)",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: 500, marginBottom: 8 }}>
            Recently Made Playable (2026-02-26)
          </div>
          <div style={{ fontSize: 11, color: "#B0A090", lineHeight: 1.6 }}>
            <strong>Antonio Rodio</strong> (15 songs) - Golden Age 1943-1944, singers Alberto Serna &amp; Mario Corrales<br/>
            <strong>Sexteto Milonguero</strong> (34 songs) - D&apos;Arienzo/Biagi rhythmic tradition<br/>
            <strong>Sexteto Cristal</strong> (15 songs) - Di Sarli/Troilo melodic tradition<br/>
            <span style={{ color: "#7B6F63" }}>+ Bandonegro, Pablo Valle, Otros Aires, Andariega, Hyperion...</span>
          </div>
        </div>

        {/* What To Do Guide */}
        <div style={{
          background: "rgba(201, 169, 89, 0.05)",
          border: "1px solid rgba(201, 169, 89, 0.2)",
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#C9A959",
            margin: "0 0 12px 0",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}>
            How to Fix DNP Songs
          </h2>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, lineHeight: 1.8, color: "#B0A090" }}>
            <li><strong>Review the reason</strong> - Each song is flagged with a specific issue</li>
            <li><strong>Research the correct data</strong> - Use TangoTunes, El Recodo DB, or discographies</li>
            <li><strong>Update in Data Quality tool</strong> - Go to Tools → Data Quality to edit</li>
            <li><strong>Remove DNP flag</strong> - Once fixed, unmark as Do Not Play</li>
            <li><strong>For unknown orchestras</strong> - Research and add to ArtistMaster if valid</li>
          </ol>
        </div>

        {/* Reason Filter */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 9, color: "#5A5048", letterSpacing: 2, marginRight: 8 }}>FILTER BY REASON</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            <button
              onClick={() => setFilterReason("all")}
              style={{
                background: filterReason === "all" ? "rgba(201,169,89,0.2)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${filterReason === "all" ? "rgba(201,169,89,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: filterReason === "all" ? "#C9A959" : "#5A5048",
                padding: "4px 10px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              ALL ({DNP_COUNT})
            </button>
            {Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).map(([reason, count]) => {
              const info = REASON_INFO[reason] || REASON_INFO.data_quality;
              return (
                <button
                  key={reason}
                  onClick={() => setFilterReason(reason)}
                  style={{
                    background: filterReason === reason ? `${info.color}22` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filterReason === reason ? info.color : "rgba(255,255,255,0.08)"}`,
                    color: filterReason === reason ? info.color : "#5A5048",
                    padding: "4px 10px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  {info.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orchestra List */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 9,
            color: "#5A5048",
            letterSpacing: 2,
            marginBottom: 12,
          }}>
            {filterReason === "all" ? "ALL" : REASON_INFO[filterReason]?.label.toUpperCase()} SONGS BY ORCHESTRA ({filteredTotal})
          </div>

          {filteredData.map((orch, idx) => {
            const isExpanded = expandedOrch === orch.o;
            return (
              <div
                key={orch.o}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 6,
                  marginBottom: 8,
                  overflow: "hidden",
                }}
              >
                {/* Orchestra Header */}
                <div
                  onClick={() => setExpandedOrch(isExpanded ? null : orch.o)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: isExpanded ? "rgba(201,169,89,0.05)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#3E3830", fontSize: 10, width: 20 }}>{idx + 1}</span>
                    <span style={{
                      fontSize: 13,
                      color: orch.o === "(No Orchestra)" ? "#E53935" : "#D8D0C4",
                      fontWeight: isExpanded ? 600 : 400,
                    }}>
                      {orch.o}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#C9A959",
                    }}>
                      {orch.c}
                    </span>
                    <span style={{ color: "#5A5048", fontSize: 12 }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Song List */}
                {isExpanded && (
                  <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "8px 16px 16px",
                  }}>
                    {orch.songs.map((song, si) => {
                      const info = REASON_INFO[song.r] || REASON_INFO.data_quality;
                      return (
                        <div
                          key={si}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "8px 0",
                            borderBottom: si < orch.songs.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                          }}
                        >
                          <span style={{
                            fontSize: 8,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: `${info.color}22`,
                            color: info.color,
                            flexShrink: 0,
                          }}>
                            {info.label}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "#D8D0C4" }}>
                              {song.t}
                            </div>
                            <div style={{ fontSize: 9, color: "#5A5048", marginTop: 2 }}>
                              {song.y && `Year: ${song.y}`}
                              {song.y && song.s && " · "}
                              {song.s && `Singer: ${song.s}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Action Guide for this reason */}
                    {orch.songs[0] && (
                      <div style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        background: "rgba(201,169,89,0.05)",
                        borderRadius: 4,
                        fontSize: 10,
                        color: "#B0A090",
                      }}>
                        <strong style={{ color: "#C9A959" }}>Action:</strong>{" "}
                        {REASON_INFO[orch.songs[0].r]?.action || REASON_INFO.data_quality.action}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          fontSize: 8,
          color: "rgba(90,80,72,0.4)",
          letterSpacing: 2,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          NTTT · DNP REPORT · {DNP_COUNT} SONGS · UPDATED 2026-02-26
        </div>
      </div>
    </div>
  );
}
