// scripts/fix-data-quality.js
// Easy data quality fixes based on audit report

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../public/songData/djSongsWeighted.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

let fixes = {
  deleted: [],
  singerFixed: [],
  titleCleaned: [],
  orchestraSwapped: [],
  yearFixed: []
};

// 1. Delete Turkish tracks
const turkishTitles = ["Son nefes", "Askin sesi", "Ayse", "Begin for Julia"];
const beforeCount = data.songs.length;
data.songs = data.songs.filter(s => {
  if (turkishTitles.some(t => s.Title && s.Title.includes(t))) {
    fixes.deleted.push(s.Title);
    return false;
  }
  return true;
});
console.log(`Deleted ${beforeCount - data.songs.length} Turkish/non-tango tracks`);

// 2. Fix Rufino to Rivero on Troilo Desencuentro
data.songs.forEach(s => {
  if (s.ArtistMaster === "Anibal Troilo" &&
      s.Title && s.Title.toLowerCase().includes("desencuentro") &&
      s.Singer === "Roberto Rufino") {
    fixes.singerFixed.push({ title: s.Title, from: s.Singer, to: "Edmundo Rivero" });
    s.Singer = "Edmundo Rivero";
  }
});
console.log(`Fixed ${fixes.singerFixed.length} singer attributions`);

// 3. Strip filename suffixes from titles
data.songs.forEach(s => {
  if (s.Title) {
    const original = s.Title;
    let cleaned = s.Title;
    // Remove suffix patterns like (slow.ver), -S-R-V-*, (jorge.valdez), etc
    cleaned = cleaned.replace(/\(slow\.ver\)/gi, "(slow)");
    cleaned = cleaned.replace(/\(fast\.ver\)/gi, "(fast)");
    cleaned = cleaned.replace(/\([^)]*valdez[^)]*\)/gi, "");
    cleaned = cleaned.replace(/\([^)]*podesta[^)]*\)/gi, "");
    cleaned = cleaned.replace(/-S-R-V-?\*?/gi, "");
    cleaned = cleaned.replace(/-F-V/gi, "");
    cleaned = cleaned.replace(/^\d+\s*-\s*/i, ""); // Remove track numbers
    cleaned = cleaned.trim();
    if (cleaned !== original) {
      fixes.titleCleaned.push({ from: original, to: cleaned });
      s.Title = cleaned;
    }
  }
});
console.log(`Cleaned ${fixes.titleCleaned.length} titles`);

// 4. Orchestra-in-Singer swap (Singer starts with "Orquesta")
data.songs.forEach(s => {
  if (s.Singer && s.Singer.startsWith("Orquesta") && (!s.Orchestra || s.Orchestra === "")) {
    fixes.orchestraSwapped.push({ singer: s.Singer, title: s.Title });
    s.Orchestra = s.Singer;
    s.ArtistMaster = s.Singer.replace("Orquesta ", "");
    s.Singer = null;
    s.HasSinger = false;
  }
});
console.log(`Fixed ${fixes.orchestraSwapped.length} orchestra-in-singer swaps`);

// 5. Fix Troilo 1999 year (Palomita Blanca)
data.songs.forEach(s => {
  if (s.ArtistMaster === "Anibal Troilo" &&
      s.Title && s.Title.toLowerCase().includes("palomita blanca") &&
      s.Year === "1999") {
    fixes.yearFixed.push({ title: s.Title, from: s.Year, to: "1945" });
    s.Year = "1945";
  }
});
console.log(`Fixed ${fixes.yearFixed.length} year anomalies`);

// Save
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log("\n=== SUMMARY ===");
console.log(JSON.stringify(fixes, null, 2));
console.log(`\nTotal songs now: ${data.songs.length}`);
