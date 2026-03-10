// scripts/mark-dnp-dup.js
// Mark records as DNP (Do Not Play) or DUP (Duplicate)

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../public/songData/djSongsWeighted.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

let stats = {
  dnp: { blankOrchestra: 0, blankBoth: 0, suspiciousYear: 0, total: 0 },
  dup: { exact: 0, total: 0 }
};

// 1. Mark DNP: Blank orchestra AND blank singer (unknown instrumental)
data.songs.forEach(s => {
  // Reset flags
  s.DNP = false;
  s.DUP = false;
  s.DNP_reason = null;
  s.DUP_reason = null;

  // DNP: Blank orchestra + no singer = unknown source
  if ((!s.Orchestra || s.Orchestra === "") &&
      (!s.ArtistMaster || s.ArtistMaster === "") &&
      !s.HasSinger) {
    s.DNP = true;
    s.DNP_reason = "blank_orchestra_instrumental";
    stats.dnp.blankBoth++;
  }

  // DNP: Post-1980 with blank orchestra (likely non-tango)
  const year = parseInt(s.Year);
  if ((!s.Orchestra || s.Orchestra === "") &&
      (!s.ArtistMaster || s.ArtistMaster === "") &&
      year && year > 1980) {
    s.DNP = true;
    s.DNP_reason = "post1980_blank_orchestra";
    stats.dnp.suspiciousYear++;
  }
});

// 2. Mark DUP: Same title + orchestra + year
const seen = new Map();
data.songs.forEach(s => {
  const key = `${(s.Title || "").toLowerCase()}|${(s.ArtistMaster || "").toLowerCase()}|${s.Year || ""}`;

  if (seen.has(key)) {
    // Mark both as potential duplicates
    s.DUP = true;
    s.DUP_reason = "same_title_orchestra_year";
    const original = seen.get(key);
    if (!original.DUP) {
      original.DUP = true;
      original.DUP_reason = "same_title_orchestra_year";
      stats.dup.exact++;
    }
    stats.dup.exact++;
  } else {
    seen.set(key, s);
  }
});

// Count totals
stats.dnp.total = data.songs.filter(s => s.DNP).length;
stats.dup.total = data.songs.filter(s => s.DUP).length;

// Save
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log("=== DNP/DUP Marking Complete ===\n");
console.log("DNP (Do Not Play):");
console.log(`  - Blank orchestra + instrumental: ${stats.dnp.blankBoth}`);
console.log(`  - Post-1980 blank orchestra: ${stats.dnp.suspiciousYear}`);
console.log(`  - Total DNP: ${stats.dnp.total}`);
console.log("\nDUP (Duplicate):");
console.log(`  - Same title/orchestra/year: ${stats.dup.exact}`);
console.log(`  - Total DUP: ${stats.dup.total}`);
console.log(`\nTotal songs: ${data.songs.length}`);
console.log(`Playable: ${data.songs.filter(s => !s.DNP && !s.DUP).length}`);
