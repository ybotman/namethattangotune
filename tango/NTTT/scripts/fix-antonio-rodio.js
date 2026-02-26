const fs = require("fs");
const path = require("path");

// Research data from user
const corrections = {
  "Donde Estas Corazon? (feat. Alberto Serna)": { year: "1944", singer: "Alberto Serna" },
  "Desvelos (feat. Alberto Serna)": { year: "1944", singer: "Alberto Serna" },
  "Esta Noche en Buenos Aires (feat. Alberto Serna)": { year: "1944", singer: "Alberto Serna" },
  "Cien Noches (feat. Alberto Serna)": { year: "1944", singer: "Alberto Serna" },
  "Me Voy Buenos Aires (feat. Alberto Serna)": { year: "1943", singer: "Alberto Serna" },
  "Munequita": { year: "1944", singer: "Alberto Serna, Daniel Adamo" },
  "Tabu (feat. Mario Corrales)": { year: "1943", singer: "Mario Corrales" },
  "Rosa Celeste (feat. Alberto Serna)": { year: "1944", singer: "Alberto Serna" },
  "Cuatro Campanadas": { year: "1944", singer: "Alberto Serna, Daniel Adamo" },
  "Corazon Que Has Hecho (feat. Alberto Serna)": { year: "1943", singer: "Alberto Serna" },
  "La Cumparsita": { year: "1944", singer: null }, // Instrumental
  "Vieja Esquina (feat. Alberto Serna)": { year: "1943", singer: "Alberto Serna" },
  "Viejo Arrabal (feat. Alberto Serna)": { year: "1943", singer: null }, // Instrumental per research
  "Parece Mentira (feat. Alberto Serna)": { year: "1944", singer: "Alberto Serna" },
  "Canyengue (feat. Mario Corrales)": { year: "1943", singer: "Mario Corrales" },
};

// Load songs
const songsPath = path.join(__dirname, "../public/songData/djSongsWeighted.json");
const data = JSON.parse(fs.readFileSync(songsPath, "utf8"));

const changes = [];

data.songs.forEach((song) => {
  if (song.ArtistMaster === "Antonio Rodio") {
    const correction = corrections[song.Title];
    if (correction) {
      const oldYear = song.Year;
      const oldSinger = song.Singer;
      const oldDnp = song.doNotPlay;

      // Apply corrections
      song.Year = correction.year;
      song.Singer = correction.singer;
      song.HasSinger = correction.singer !== null;
      song.doNotPlay = false;
      song.dnpReason = null;
      song.dnpNotes = null;
      song.isReissue = true;
      song.reissueYear = "2014";

      changes.push({
        songId: song.SongID,
        title: song.Title,
        oldYear: oldYear,
        newYear: correction.year,
        oldSinger: oldSinger,
        newSinger: correction.singer,
        wasDnp: oldDnp,
      });
    }
  }
});

// Save songs
fs.writeFileSync(songsPath, JSON.stringify(data, null, 2));

console.log("=== ANTONIO RODIO FIX ===");
console.log(`Updated ${changes.length} songs\n`);
changes.forEach((c) => {
  console.log(`${c.title}`);
  console.log(`  Year: ${c.oldYear} → ${c.newYear}`);
  console.log(`  Singer: ${c.oldSinger || "(none)"} → ${c.newSinger || "(instrumental)"}`);
  console.log(`  DNP: ${c.wasDnp} → false`);
  console.log("");
});

// Create change log
const changeLog = {
  date: "2026-02-26",
  timestamp: new Date().toISOString(),
  description: "Fix Antonio Rodio: set original years (1943-1944), add singers, remove DNP - Golden Age recordings reissued 2014",
  orchestraInfo: {
    artist: "Antonio Rodio",
    era: "Golden Age (1943-1944)",
    singers: ["Alberto Serna", "Mario Corrales", "Daniel Adamo"],
    note: "Digital reissue September 2014, original recordings 1943-1944"
  },
  changes: [
    {
      file: "djSongsWeighted.json",
      action: "update",
      orchestra: "Antonio Rodio",
      count: changes.length,
      description: "Set original years, added singers, marked isReissue, removed DNP",
      songs: changes
    }
  ]
};

const logPath = path.join(__dirname, "../docs/data-changes/2026-02-26_antonio-rodio-fix.json");
fs.writeFileSync(logPath, JSON.stringify(changeLog, null, 2));
console.log("✓ Saved change log to docs/data-changes/2026-02-26_antonio-rodio-fix.json");

// Update DQ issues
const dqPath = path.join(__dirname, "../public/songData/dataQualityIssues.json");
const dq = JSON.parse(fs.readFileSync(dqPath, "utf8"));

let dqUpdated = 0;
dq.issues.forEach((issue) => {
  if (issue.orchestra?.includes("Antonio Rodio")) {
    issue.status = "fixed";
    issue.resolution = "update_year";
    issue.reviewedAt = new Date().toISOString();
    issue.notes = "Fixed: set original year (1943-1944), marked isReissue=2014, removed DNP";
    dqUpdated++;
  }
});

dq.metadata.lastModified = new Date().toISOString();
dq.metadata.reviewed = dq.issues.filter((i) => i.status !== "not_reviewed").length;
dq.metadata.fixed = dq.issues.filter((i) => i.status === "fixed").length;

fs.writeFileSync(dqPath, JSON.stringify(dq, null, 2));
console.log(`✓ Updated ${dqUpdated} DQ issues`);

// Final stats
const dnpCount = data.songs.filter((s) => s.doNotPlay).length;
console.log(`\nNew DNP count: ${dnpCount}`);
console.log(`Playable songs: ${data.songs.length - dnpCount}`);
