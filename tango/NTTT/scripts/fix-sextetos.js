// Fix Sexteto Milonguero and Sexteto Cristal - make playable
const fs = require("fs");
const path = require("path");

const songsPath = path.join(__dirname, "../public/songData/djSongsWeighted.json");
const data = JSON.parse(fs.readFileSync(songsPath, "utf8"));

const changes = {
  milonguero: [],
  cristal: [],
};

data.songs.forEach((song) => {
  // Sexteto Milonguero - remove DNP
  if (song.ArtistMaster === "Sexteto Milonguero" && song.doNotPlay) {
    changes.milonguero.push({
      songId: song.SongID,
      title: song.Title,
      year: song.Year,
      singer: song.Singer || null,
      action: "removed DNP",
    });
    song.doNotPlay = false;
    song.dnpReason = null;
    song.dnpNotes = null;
  }

  // Sexteto Cristal - remove DNP and fix missing years
  if (song.ArtistMaster === "Sexteto Cristal") {
    const actions = [];

    if (song.doNotPlay) {
      song.doNotPlay = false;
      song.dnpReason = null;
      song.dnpNotes = null;
      actions.push("removed DNP");
    }

    if (!song.Year || song.Year === "") {
      song.Year = "2018";
      actions.push("set year to 2018");
    }

    if (actions.length > 0) {
      changes.cristal.push({
        songId: song.SongID,
        title: song.Title,
        year: song.Year,
        singer: song.Singer || null,
        action: actions.join(", "),
      });
    }
  }
});

// Save updated songs
fs.writeFileSync(songsPath, JSON.stringify(data, null, 2));

// Output summary
console.log("=== SEXTETO MILONGUERO ===");
console.log(`Fixed ${changes.milonguero.length} songs (removed DNP)`);
changes.milonguero.forEach((c) => console.log(`  - ${c.title} (${c.year})`));

console.log("\n=== SEXTETO CRISTAL ===");
console.log(`Fixed ${changes.cristal.length} songs`);
changes.cristal.forEach((c) => console.log(`  - ${c.title} (${c.year}) - ${c.action}`));

// Create change log
const changeLog = {
  date: "2026-02-26",
  timestamp: new Date().toISOString(),
  description: "Make Sexteto Milonguero and Sexteto Cristal playable - valid modern Renaissance orchestras",
  orchestraInfo: {
    sextetoMilonguero: {
      style: "D'Arienzo/Biagi rhythmic tradition - strong marcato, crisp bandoneón, compás-driven",
      years: "2007-2013",
      singer: "Javier Di Ciriaco"
    },
    sextetoCristal: {
      style: "Di Sarli/Troilo melodic tradition - legato phrasing, rich harmonics, lyrical",
      years: "2018"
    }
  },
  changes: [
    {
      file: "djSongsWeighted.json",
      action: "update",
      orchestra: "Sexteto Milonguero",
      count: changes.milonguero.length,
      description: "Removed DNP flag - valid modern recordings",
      songs: changes.milonguero
    },
    {
      file: "djSongsWeighted.json",
      action: "update",
      orchestra: "Sexteto Cristal",
      count: changes.cristal.length,
      description: "Removed DNP flag and fixed missing years",
      songs: changes.cristal
    }
  ]
};

const logPath = path.join(__dirname, "../docs/data-changes/2026-02-26_sextetos-valid.json");
fs.writeFileSync(logPath, JSON.stringify(changeLog, null, 2));
console.log("\n✓ Saved change log to docs/data-changes/2026-02-26_sextetos-valid.json");
console.log(`\nTotal: ${changes.milonguero.length + changes.cristal.length} songs now playable`);
