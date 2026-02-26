import { useState, useMemo } from "react";

// ═══ COMPLETE DATA — 204 singers, 2,423 songs, 41 active years (1927–2003) ═══
const RAW = [
  {n:"Ernesto Fama",t:97,y:{1929:2,1930:11,1931:7,1932:6,1933:14,1934:10,1939:23,1940:14,1941:10}},
  {n:"Roberto Maida",t:88,y:{1935:26,1936:22,1937:29,1938:11}},
  {n:"Angel Vargas",t:83,y:{1938:2,1940:2,1941:10,1942:12,1943:15,1944:18,1945:18,1946:6}},
  {n:"Jorge Omar",t:80,y:{1935:6,1936:17,1937:17,1938:21,1939:11,1940:4,1941:3,1942:1}},
  {n:"Roberto Rufino",t:79,y:{1939:1,1940:11,1941:23,1942:11,1943:32,1963:1}},
  {n:"Armando Moreno",t:75,y:{1940:10,1941:11,1942:13,1943:15,1944:11,1945:13,1946:2}},
  {n:"Jorge Ortiz",t:75,y:{1940:20,1941:20,1942:9,1943:10,1945:16}},
  {n:"Enrique Campos",t:68,y:{1943:21,1944:23,1945:21,1946:3}},
  {n:"Alberto Podesta",t:66,y:{1941:3,1942:18,1943:16,1944:16,1945:1,1947:8,1954:3,1963:1}},
  {n:"Francisco Fiorentino",t:60,y:{1938:1,1941:21,1942:22,1943:13,1944:2,1945:1}},
  {n:"Armando Laborde",t:59,y:{1944:3,1945:9,1946:11,1947:9,1948:2,1949:6,1950:2,1952:5,1953:1,1954:3,1955:4,1957:2,1959:2}},
  {n:"Alberto Echague",t:57,y:{1938:12,1939:31,1944:2,1946:3,1948:1,1949:2,1951:1,1952:1,1954:1,1955:2,1956:1}},
  {n:"Carlos Dante",t:54,y:{1929:1,1930:8,1932:1,1939:1,1944:4,1945:8,1946:6,1947:4,1948:1,1949:7,1950:1,1951:1,1953:3,1954:4,1956:3,1957:1}},
  {n:"Raul Beron",t:50,y:{1942:16,1943:10,1944:5,1949:1,1950:1,1951:3,1952:7,1953:1,1954:4,1955:2}},
  {n:"Raul Iriarte",t:49,y:{1943:13,1944:13,1945:18,1946:3,1947:2}},
  {n:"Alberto Castillo",t:49,y:{1941:17,1942:21,1943:11}},
  {n:"Jorge Duran",t:45,y:{1945:16,1946:11,1947:1,1956:6,1957:4,1958:7}},
  {n:"Oscar Larroca",t:44,y:{1951:6,1952:6,1953:7,1954:6,1955:7,1956:8,1957:4}},
  {n:"Alberto Reynal",t:42,y:{1940:24,1941:11,1942:7}},
  {n:"Alberto Marino",t:41,y:{1943:9,1944:15,1945:11,1946:6}},
  {n:"Horacio Quintana",t:41,y:{1944:29,1945:12}},
  {n:"Carlos Roldan",t:34,y:{1941:2,1942:8,1943:9,1944:12,1945:3}},
  {n:"Ricardo Ruiz",t:33,y:{1939:19,1940:4,1941:10}},
  {n:"Roberto Chanel",t:33,y:{1943:5,1944:15,1945:5,1946:6,1947:2}},
  {n:"Floreal Ruiz",t:31,y:{1943:2,1944:8,1945:6,1946:6,1947:7,1948:2}},
  {n:"Carlos A. Varela",t:29,y:{1930:9,1934:3,1935:8,1936:6,1937:2,1939:1}},
  {n:"Julio Martel",t:27,y:{1943:2,1944:4,1945:6,1946:6,1947:2,1949:6,1950:1}},
  {n:"Horacio Lagos",t:26,y:{1935:1,1936:2,1937:3,1938:5,1939:4,1940:3,1941:7,1942:1}},
  {n:"Carlos Dante y Oscar Larroca",t:26,y:{1951:4,1953:4,1954:4,1955:4,1956:6,1957:3,1958:1}},
  {n:"Hugo Duval",t:25,y:{1950:1,1951:2,1952:1,1953:2,1955:1,1956:3,1957:4,1958:3,1959:4,1960:2,1961:2}},
  {n:"Fernando Diaz",t:24,y:{1931:3,1932:1,1933:2,1939:3,1940:4,1941:5,1942:6}},
  {n:"Francisco Amor",t:23,y:{1938:1,1939:4,1940:9,1941:9}},
  {n:"Oscar Serpa",t:23,y:{1948:2,1952:4,1953:7,1954:5,1955:5}},
  {n:"Charlo",t:22,y:{1928:9,1929:4,1930:6,1931:1,1932:2}},
  {n:"Andres Falgas",t:22,y:{1939:12,1940:10}},
  {n:"Luis Diaz",t:21,y:{1930:6,1931:10,1938:4,1939:1}},
  {n:"Eduardo Adrian",t:21,y:{1941:3,1942:9,1943:8,1944:1}},
  {n:"Roberto Ray",t:20,y:{1933:3,1935:1,1936:2,1937:8,1938:3,1939:3}},
  {n:"Luis Scalon",t:20,y:{1934:8,1935:4,1937:6,1938:2}},
  {n:"Hector Maure",t:20,y:{1940:1,1941:12,1942:1,1943:3,1944:3}},
  {n:"Carlos Dante y Julio Martel",t:19,y:{1944:1,1945:2,1946:3,1947:4,1948:3,1949:1,1950:5}},
  {n:"Roberto Flores",t:18,y:{1937:1,1938:7,1939:9,1940:1}},
  {n:"Roberto Florio",t:18,y:{1956:9,1957:5,1958:4}},
  {n:"Roberto Videla",t:18,y:{1945:3,1946:11,1947:3,1948:1}},
  {n:"Teofilo Ibanez",t:18,y:{1928:2,1929:1,1930:1,1938:7,1939:7}},
  {n:"Juan Carlos Casas",t:17,y:{1938:4,1940:9,1941:1,1942:3}},
  {n:"Juan Carlos Godoy",t:16,y:{1958:6,1959:5,1960:2,1961:3}},
  {n:"Juan Carlos Miranda",t:16,y:{1938:1,1942:15}},
  {n:"Alberto Moran",t:16,y:{1945:8,1946:6,1947:1,1949:1}},
  {n:"Lalo Martel",t:14,y:{1959:5,1960:4,1961:3,1962:2}},
  {n:"Felix Gutierrez",t:13,y:{1932:8,1933:4,1936:1}},
  {n:"Mario Pomar",t:13,y:{1951:1,1952:2,1953:3,1954:5,1955:2}},
  {n:"Juan Carlos Lamas",t:13,y:{1942:6,1943:7}},
  {n:"Jorge Maciel",t:12,y:{1948:1,1949:3,1950:4,1951:2,1953:2}},
  {n:"Agustin Irusta",t:12,y:{1927:5,1932:7}},
  {n:"Carlos Galan",t:12,y:{1934:12}},
  {n:"Pedro Datila",t:12,y:{1946:3,1947:6,1949:2,1950:1}},
  {n:"Edmundo Rivero",t:10,y:{1947:4,1948:3,1949:2,1956:1}},
  {n:"Ernesto Herrera",t:9,y:{1958:7,1959:2}},
  {n:"Ortega Del Cerro",t:9,y:{1943:9}},
  {n:"Hector Pacheco",t:9,y:{1951:2,1952:5,1954:1,1955:1}},
  {n:"Orlando Verri",t:9,y:{1946:5,1947:4}},
  {n:"Osvaldo Ribo",t:8,y:{1946:3,1947:3,1948:2}},
  {n:"Alberto Amor",t:8,y:{1943:1,1945:3,1946:4}},
  {n:"Carlos Lafuente",t:8,y:{1930:2,1932:1,1933:3,1940:2}},
  {n:"Alberto Carol",t:8,y:{1944:8}},
  {n:"Alb. Echague - Arm. Laborde",t:8,y:{1945:1,1946:3,1947:2,1948:1,1949:1}},
  {n:"Rodolfo Lesica",t:7,y:{1955:2,1956:3,1957:2}},
  {n:"Argentino Ledesma",t:7,y:{1955:4,1956:3}},
  {n:"Raul Sander",t:6,y:{1932:2,1937:4}},
  {n:"Orq. Angel Condercuri",t:6,y:{1949:2,1950:1,1951:1,1959:1,1960:1}},
  {n:"Carlos Bermudez",t:6,y:{1944:6}},
  {n:"Alberto Tagle",t:5,y:{1937:1,1938:2,1939:2}},
  {n:"Roger Toussaint",t:5,y:{1934:1,1935:1,1936:3}},
  {n:"Antonio Maida",t:5,y:{1934:5}},
  {n:"Alberto Gomez",t:5,y:{1931:3,1933:1,1935:1}},
  {n:"Mario Corrales",t:5,y:{1939:3,1940:2}},
  {n:"Walter Cabral",t:5,y:{1936:5}},
  {n:"Carlos Casares",t:5,y:{1940:5}},
  {n:"Mario Pomar (Corrales)",t:5,y:{1947:2,1948:2,1949:1}},
  {n:"Luis Mariano",t:4,y:{1937:2,1939:2}},
  {n:"Arg. Ledesma y R. Lesica",t:4,y:{1954:1,1955:1,1956:2}},
  {n:"J. Falcon y F. Soler",t:4,y:{1973:4}},
  {n:"Orq. Emilio Balcarce",t:4,y:{1943:1,1944:2,1945:1}},
  {n:"Orq. Enrique Alessio",t:4,y:{1946:2,1947:1,1948:1}},
  {n:"Fiorentino y Marino",t:4,y:{1943:3,1944:1}},
  {n:"Martin Podesta",t:4,y:{1941:1,1942:3}},
  {n:"Horacio Casares",t:4,y:{1958:4}},
  {n:"Alb. Echague y Arm. Laborde",t:4,y:{1945:1,1946:1,1947:1,1948:1}},
  {n:"Armando Guerrico",t:4,y:{1957:1,1958:2,1959:1}},
  {n:"Mario Beltran",t:3,y:{1934:1,1936:2}},
  {n:"Jorge Falcon",t:3,y:{1973:2,1974:1}},
  {n:"Raul Lavie",t:3,y:{1957:3}},
  {n:"Romeo Gavio",t:3,y:{1940:1,1942:2}},
  {n:"Marino y Floreal Ruiz",t:3,y:{1944:2,1945:1}},
  {n:"Floreal Ruiz y Edmundo Rivero",t:3,y:{1947:2,1948:1}},
  {n:"E. Campos y R. Videla",t:3,y:{1945:1,1946:2}},
  {n:"J. Omar y Cell Brian",t:3,y:{1935:3}},
  {n:"J. Omar y F. Diaz",t:3,y:{1939:1,1940:1,1942:1}},
  {n:"Nelly Omar",t:3,y:{1946:2,1947:1}},
  {n:"Ant. Rodriguez Lesende",t:3,y:{1940:3}},
  {n:"Juan Carlos Caceres",t:3,y:{2003:3}},
  {n:"Adolfo Rivas",t:3,y:{1951:2,1958:1}},
  {n:"Alberto Diale",t:3,y:{1939:1,1940:1,1942:1}},
  {n:"Ricardo Duarte",t:2,y:{1936:2}},
  {n:"Ant. Maida y Randona",t:2,y:{1934:2}},
  {n:"R. Gavio y L. Morales",t:2,y:{1940:2}},
  {n:"Pablo Lozano",t:2,y:{1945:2}},
  {n:"Gavio, Morales y Lagos",t:2,y:{1940:2}},
  {n:"Lagos y Gavio",t:2,y:{1940:1,1941:1}},
  {n:"Lagos y Randona",t:2,y:{1938:1,1942:1}},
  {n:"Lagos y L. Morales",t:2,y:{1939:2}},
  {n:"Roberto Goyeneche",t:2,y:{1956:1,1958:1}},
  {n:"Floreal Ruiz y Alb. Marino",t:2,y:{1945:1,1946:1}},
  {n:"Godoy y Lalo Martel",t:2,y:{1959:1,1963:1}},
  {n:"F. Diaz y J. Omar",t:2,y:{1939:1,1942:1}},
  {n:"Hector Farrel",t:2,y:{1937:1,1940:1}},
  {n:"Carlos Saavedra",t:2,y:{1948:2}},
  {n:"Carlos Acuna",t:2,y:{1941:1,1943:1}},
  {n:"Roldan y Adrian",t:2,y:{1943:2}},
  {n:"E. Fama y A. Ramos",t:2,y:{1933:1,1934:1}},
  {n:"Domingo Conte",t:2,y:{1932:2}},
  {n:"R. Maida y A. Ramos",t:2,y:{1936:2}},
  {n:"Bermudez y Linares",t:2,y:{1944:2}},
  {n:"R. Florio y J. Duran",t:2,y:{1956:1,1957:1}},
  {n:"Lita Morales",t:2,y:{1937:2}},
  {n:"Vicente Crisera",t:2,y:{1931:2}},
  {n:"Roberto Lemos",t:2,y:{1950:1,1952:1}},
  {n:"Maciel y Coral",t:2,y:{1951:1,1952:1}},
  {n:"Santiago Devincenzi",t:2,y:{1929:1,1930:1}},
  {n:"Oscar Galan",t:2,y:{1956:2}},
  {n:"Hector De Rosas",t:2,y:{1949:2}},
  {n:"Luis Tolosa",t:2,y:{1946:2}},
  {n:"Rafael Canaro",t:1,y:{1939:1}},
  {n:"C. Dante y coro",t:1,y:{1929:1}},
  {n:"R. Canaro y coro",t:1,y:{1939:1}},
  {n:"Fernando Soler",t:1,y:{1974:1}},
  {n:"Laborde y Lesica",t:1,y:{1960:1}},
  {n:"Fontan Reyes",t:1,y:{1958:1}},
  {n:"Herrera y Laborde",t:1,y:{1959:1}},
  {n:"Juan Alessio",t:1,y:{1935:1}},
  {n:"Morales, Lagos y Gavio",t:1,y:{1939:1}},
  {n:"Morales y Lagos",t:1,y:{1939:1}},
  {n:"Hugo del Carril y Randona",t:1,y:{1935:1}},
  {n:"Daniel Adamo y J. Denis",t:1,y:{1944:1}},
  {n:"Agustin Magaldi",t:1,y:{1931:1}},
  {n:"Ant. Maida y Rondana",t:1,y:{1934:1}},
  {n:"Carlos Vivan",t:1,y:{1931:1}},
  {n:"Hugo del Carril",t:1,y:{1935:1}},
  {n:"Gavio y Lagos",t:1,y:{1941:1}},
  {n:"Mercedes Carne",t:1,y:{1931:1}},
  {n:"Lagos, Morales y Gavio",t:1,y:{1940:1}},
  {n:"Orq. Jorge Dragone",t:1,y:{1953:1}},
  {n:"Roberto Alvar",t:1,y:{1959:1}},
  {n:"Tino Garcia",t:1,y:{1952:1}},
  {n:"Marcel Veran",t:1,y:{1934:1}},
  {n:"Canto",t:1,y:{1940:1}},
  {n:"Oscar Valeta",t:1,y:{1943:1}},
  {n:"Duo Rosales-Casedei",t:1,y:{1949:1}},
  {n:"Amadeo Mandarino",t:1,y:{1942:1}},
  {n:"Fiorentino y Mandarino",t:1,y:{1941:1}},
  {n:"Aldo Calderon",t:1,y:{1951:1}},
  {n:"J. Casal y R. Beron",t:1,y:{1953:1}},
  {n:"Rivero y Calderon",t:1,y:{1949:1}},
  {n:"Angel Cardenas",t:1,y:{1958:1}},
  {n:"Godoy y Mancini",t:1,y:{1962:1}},
  {n:"C. Dante - J. Martel",t:1,y:{1947:1}},
  {n:"Carlos Aguirre",t:1,y:{1972:1}},
  {n:"Roberto Mancini",t:1,y:{1963:1}},
  {n:"Martel, glosa: Rodi",t:1,y:{1944:1}},
  {n:"Charlo?",t:1,y:{1928:1}},
  {n:"Alberto Rivera",t:1,y:{1945:1}},
  {n:"Carlos Galarce",t:1,y:{1944:1}},
  {n:"Diaz y Acuna",t:1,y:{1931:1}},
  {n:"Heredia y Duval",t:1,y:{1951:1}},
  {n:"Alberto Amor y Lago",t:1,y:{1942:1}},
  {n:"Arenas y Lucero",t:1,y:{1949:1}},
  {n:"Charlo or Gardel",t:1,y:{1930:1}},
  {n:"E. Fama y M. Mores",t:1,y:{1940:1}},
  {n:"Augustin Irusta",t:1,y:{1932:1}},
  {n:"E. Fama y Mirna Mores",t:1,y:{1940:1}},
  {n:"Luis Diaz y coro",t:1,y:{1930:1}},
  {n:"Coro Teatro Nacional",t:1,y:{1932:1}},
  {n:"R. Maida y coro",t:1,y:{1935:1}},
  {n:"E. Fama y coro",t:1,y:{1934:1}},
  {n:"Alberto Fuentes",t:1,y:{1942:1}},
  {n:"Iriarte y Arrieta",t:1,y:{1946:1}},
  {n:"Mariano Balcarce",t:1,y:{1937:1}},
  {n:"Moreno y Bayardo",t:1,y:{1944:1}},
  {n:"Moran y Chanel",t:1,y:{1946:1}},
  {n:"Chanel y Moran",t:1,y:{1945:1}},
  {n:"Agustin Volpe",t:1,y:{1940:1}},
  {n:"Rodriguez Lesende",t:1,y:{1940:1}},
  {n:"Enrique Carbel",t:1,y:{1937:1}},
  {n:"Coral y Maciel",t:1,y:{1950:1}},
  {n:"Maciel y Angel Diaz",t:1,y:{1949:1}},
  {n:"Hector Maciel",t:1,y:{1948:1}},
  {n:"Enalmar De Maria",t:1,y:{1941:1}},
  {n:"Iriarte y Trovadores",t:1,y:{1944:1}},
  {n:"Roberto Diaz",t:1,y:{1931:1}},
  {n:"Jorge Garre",t:1,y:{1957:1}},
  {n:"Carlos Varela",t:1,y:{1930:1}},
  {n:"Dorita Davis et al.",t:1,y:{1931:1}},
  {n:"Principe Azul",t:1,y:{1931:1}},
];

// Build year list
const allYearSet = new Set();
RAW.forEach(o => Object.keys(o.y).forEach(yr => allYearSet.add(parseInt(yr))));
const ALL_YEARS = [...allYearSet].sort((a, b) => a - b);

// Collapsed slots (gaps > 3yr become ⋯)
const slotsCollapsed = [];
for (let i = 0; i < ALL_YEARS.length; i++) {
  if (i > 0 && ALL_YEARS[i] - ALL_YEARS[i - 1] > 3) {
    slotsCollapsed.push({ type: "gap", from: ALL_YEARS[i - 1], to: ALL_YEARS[i] });
  }
  slotsCollapsed.push({ type: "year", year: ALL_YEARS[i] });
}

// Expanded slots (fill in every year)
const slotsExpanded = [];
for (let i = 0; i < ALL_YEARS.length; i++) {
  if (i > 0 && ALL_YEARS[i] - ALL_YEARS[i - 1] > 3) {
    for (let y = ALL_YEARS[i - 1] + 1; y < ALL_YEARS[i]; y++) {
      slotsExpanded.push({ type: "empty", year: y });
    }
  }
  slotsExpanded.push({ type: "year", year: ALL_YEARS[i] });
}

let GLOBAL_MAX = 0;
RAW.forEach(o => { const mx = Math.max(...Object.values(o.y)); if (mx > GLOBAL_MAX) GLOBAL_MAX = mx; });

const ERAS = [
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
  if (t < 0.05) return "rgba(70,25,12,0.45)";
  if (t < 0.1) return "rgba(100,38,18,0.6)";
  if (t < 0.18) return "rgba(140,50,22,0.72)";
  if (t < 0.3) return "rgba(175,72,28,0.82)";
  if (t < 0.45) return "rgba(200,100,38,0.88)";
  if (t < 0.6) return "rgba(210,140,55,0.92)";
  if (t < 0.75) return "rgba(201,169,89,0.94)";
  if (t < 0.88) return "rgba(230,210,145,0.96)";
  return "rgba(252,245,210,1)";
}
function heatTx(val, max) {
  if (!val) return "transparent";
  return (val / max) > 0.45 ? "#1A1200" : (val / max) > 0.15 ? "#E8DCC8" : "#A08060";
}

const CW = 15;
const CH = 18;
const GAP_W = 8;
const NAME_COL = 165;
const TOTAL_COL = 30;
const MIN_FILTERS = [1, 3, 5, 10, 20];

export default function FullSingerYearHeatmap() {
  const [hovSinger, setHovSinger] = useState(null);
  const [hovYear, setHovYear] = useState(null);
  const [selSinger, setSelSinger] = useState(null);
  const [sortBy, setSortBy] = useState("total");
  const [scale, setScale] = useState("global");
  const [showGap, setShowGap] = useState(false);
  const [minSongs, setMinSongs] = useState(5);

  const activeSlots = useMemo(() => showGap ? slotsExpanded : slotsCollapsed, [showGap]);

  const filtered = useMemo(() => {
    let d = RAW.filter(s => s.t >= minSongs);
    if (sortBy === "total") d.sort((a, b) => b.t - a.t);
    if (sortBy === "name") d.sort((a, b) => a.n.localeCompare(b.n));
    if (sortBy === "start") d.sort((a, b) => Math.min(...Object.keys(a.y).map(Number)) - Math.min(...Object.keys(b.y).map(Number)));
    return d;
  }, [sortBy, minSongs]);

  const selData = selSinger ? RAW.find(o => o.n === selSinger) : null;

  const yearTotals = useMemo(() => {
    const t = {};
    ALL_YEARS.forEach(yr => { let s = 0; RAW.forEach(o => s += (o.y[yr] || 0)); t[yr] = s; });
    return t;
  }, []);
  const maxYT = Math.max(...Object.values(yearTotals));

  // Gap midpoint for label
  const gapMid = useMemo(() => {
    const gapEntry = slotsCollapsed.find(s => s.type === "gap" && s.to - s.from > 20);
    return gapEntry ? Math.floor((gapEntry.from + gapEntry.to) / 2) : 1988;
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

      <div style={{ position: "relative", zIndex: 1, padding: "24px 12px", maxWidth: 1500, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#C9A959", textTransform: "uppercase" }}>NTTT · Voces</div>
          <h1 style={{
            fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 400, margin: "6px 0 4px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            background: "linear-gradient(135deg, #E8E0D8, #C9A959, #E8E0D8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Complete Singer × Year
          </h1>
          <div style={{ fontSize: 10, color: "#5A5048" }}>
            2,423 recordings · 204 singers · 41 active years · 1927–2003
          </div>
        </div>

        {/* Controls Row 1: Sort + Scale */}
        <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
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
          }}>{showGap ? "SHOWING 1975–2002" : "COLLAPSED"}</button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 1, fontSize: 8, color: "#5A5048" }}>
            <span>0</span>
            {[0.05,0.1,0.18,0.3,0.45,0.6,0.75,0.88,1].map((t,i) => (
              <div key={i} style={{ width: 12, height: 8, borderRadius: 1, background: heatBg(t * GLOBAL_MAX, GLOBAL_MAX) }} />
            ))}
            <span>{GLOBAL_MAX}</span>
          </div>
        </div>

        {/* Controls Row 2: Min songs filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 8, color: "#5A5048", letterSpacing: 2 }}>MIN SONGS</span>
          {MIN_FILTERS.map(m => (
            <button key={m} onClick={() => setMinSongs(m)} style={{
              background: minSongs === m ? "rgba(201,169,89,0.15)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${minSongs === m ? "rgba(201,169,89,0.35)" : "rgba(255,255,255,0.05)"}`,
              color: minSongs === m ? "#C9A959" : "#5A5048", padding: "2px 8px", borderRadius: 2,
              cursor: "pointer", fontSize: 9, letterSpacing: 1,
            }}>{m === 1 ? "ALL (204)" : `≥${m} (${RAW.filter(s=>s.t>=m).length})`}</button>
          ))}
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
                const isEraStart = si === 0 || prev?.type === "gap" || (prev && getEra(prev.year).name !== era.name);
                const isEmpty = slot.type === "empty";
                return (
                  <div key={`e${yr}`} style={{
                    width: isEmpty ? 4 : CW, flexShrink: 0,
                    borderBottom: isEmpty ? "1px dashed rgba(90,80,72,0.15)" : `2px solid ${era.color}`,
                    fontSize: 7, color: era.color, opacity: isEmpty ? 0.2 : 0.6,
                    overflow: "visible", whiteSpace: "nowrap", position: "relative",
                  }}>
                    {isEraStart && !isEmpty && <span style={{ position: "absolute", top: -10, left: 0, letterSpacing: 0.5 }}>{era.name}</span>}
                  </div>
                );
              })}
            </div>

            {/* Year column headers */}
            <div style={{ display: "flex", alignItems: "flex-end", marginLeft: NAME_COL + TOTAL_COL + 4, height: 32, marginBottom: 2 }}>
              {activeSlots.map((slot, si) => {
                if (slot.type === "gap") return (
                  <div key={`g${si}`} style={{ width: GAP_W, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#3A332C", height: 32 }}>⋯</div>
                );
                if (slot.type === "empty") {
                  const isMiddle = slot.year === gapMid;
                  return (
                    <div key={`e${slot.year}`} style={{ width: 4, height: 32, flexShrink: 0, position: "relative" }}>
                      {isMiddle && (
                        <div style={{
                          position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
                          whiteSpace: "nowrap", fontSize: 8, letterSpacing: 3,
                          color: "rgba(201,169,89,0.3)", fontStyle: "italic",
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          textTransform: "uppercase",
                        }}>The Silence · 1975–2002</div>
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

            {/* Singer rows */}
            {filtered.map((o, idx) => {
              const isH = hovSinger === o.n;
              const isS = selSinger === o.n;
              const rowMax = Math.max(...Object.values(o.y));
              const sMax = scale === "row" ? rowMax : GLOBAL_MAX;
              return (
                <div key={o.n}
                  onMouseEnter={() => setHovSinger(o.n)}
                  onMouseLeave={() => setHovSinger(null)}
                  onClick={() => setSelSinger(isS ? null : o.n)}
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
                    <span style={{ color: "#2E2820", fontSize: 7, marginRight: 3, display: "inline-block", width: 16, textAlign: "right" }}>{idx + 1}</span>
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
                        borderLeft: slot.year === 1975 ? "1px dashed rgba(201,169,89,0.18)" : "none",
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
                            fontSize: 6.5, fontWeight: val >= 20 ? 700 : 400,
                            color: val > 0 ? heatTx(val, sMax) : "transparent",
                            transition: "transform 0.1s",
                            transform: (isH && val > 0) || (isYH && val > 0) ? "scale(1.2)" : "scale(1)",
                            boxShadow: val >= 25 ? "0 0 5px rgba(201,169,89,0.25)" : "none",
                            outline: isYH && val > 0 ? "1px solid rgba(201,169,89,0.3)" : "none",
                          }}
                        >
                          {val >= 6 ? val : val > 0 ? "·" : ""}
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
                    borderLeft: slot.year === 1975 ? "1px dashed rgba(201,169,89,0.18)" : "none",
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
                      fontSize: 6.5, fontWeight: val >= 40 ? 700 : 400,
                      color: val > 0 ? heatTx(val, maxYT) : "transparent",
                    }}>
                      {val >= 15 ? val : val > 0 ? "·" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selData && (() => {
          const rowMax = Math.max(...Object.values(selData.y));
          const peak = Object.entries(selData.y).sort(([,a],[,b]) => b - a)[0];
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
                    <div key={yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 22, minWidth: 3 }}>
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
                Peak: {peak[0]} ({peak[1]} songs) · Active {minYr}–{maxYr} ({Object.keys(selData.y).length} active years) · {((selData.t / 2423) * 100).toFixed(1)}% of library
              </div>
            </div>
          );
        })()}

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 8, color: "rgba(90,80,72,0.35)", letterSpacing: 2 }}>
          NTTT · VOCES · 204 SINGERS · 41 YEARS · 2,423 RECORDINGS
        </div>
      </div>
    </div>
  );
}
