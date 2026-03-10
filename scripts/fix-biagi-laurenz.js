// scripts/fix-biagi-laurenz.js
// Promote Biagi and Laurenz from Niche (level 4) to Core (level 2)

const fs = require("fs");
const path = require("path");

// Fix djSongsWeighted.json
const dataPath = path.join(__dirname, "../public/songData/djSongsWeighted.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

let biagiFixed = 0;
let laurenzFixed = 0;

data.songs.forEach(s => {
  // Fix Biagi
  if (s.Orchestra && s.Orchestra.toLowerCase().includes("rodolfo biagi")) {
    s.ArtistMaster = "Rodolfo Biagi";
    s.orchestraLevel = 2; // Core
    biagiFixed++;
  }
  // Fix Laurenz (both "Pedro Laurenz" and "Quinteto Pedro Laurenz")
  if (s.Orchestra && (s.Orchestra.toLowerCase().includes("pedro laurenz"))) {
    s.ArtistMaster = "Pedro Laurenz";
    s.orchestraLevel = 2; // Core
    laurenzFixed++;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Biagi: ${biagiFixed} songs → Core (level 2)`);
console.log(`Laurenz: ${laurenzFixed} songs → Core (level 2)`);

// Update ArtistMaster.json
const artistPath = path.join(__dirname, "../public/songData/ArtistMaster.json");
const artistData = JSON.parse(fs.readFileSync(artistPath, "utf8"));

// Check if already exists
const hasBiagi = artistData.some(a => a.artist && a.artist.toLowerCase() === "rodolfo biagi");
const hasLaurenz = artistData.some(a => a.artist && a.artist.toLowerCase() === "pedro laurenz");

if (!hasBiagi) {
  artistData.push({
    artist: "Rodolfo Biagi",
    level: "2",
    active: "true",
    note: "Manos Brujas - distinctive staccato rhythmic style"
  });
  console.log("Added Rodolfo Biagi to ArtistMaster.json");
}

if (!hasLaurenz) {
  artistData.push({
    artist: "Pedro Laurenz",
    level: "2",
    active: "true",
    note: "Milonga de mis amores, Nunca tuvo novio, Arrabalera"
  });
  console.log("Added Pedro Laurenz to ArtistMaster.json");
}

fs.writeFileSync(artistPath, JSON.stringify(artistData, null, 2));
console.log("Done!");
