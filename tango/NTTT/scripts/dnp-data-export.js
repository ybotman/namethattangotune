const data = require("../public/songData/djSongsWeighted.json");
const songs = data.songs;

const dnpSongs = songs.filter(s => s.doNotPlay === true);

// Group by orchestra
const byOrch = {};
dnpSongs.forEach(s => {
  const orch = s.ArtistMaster || "(No Orchestra)";
  if (byOrch[orch] === undefined) byOrch[orch] = [];
  byOrch[orch].push({
    id: s.SongID,
    t: s.Title,
    y: s.Year || "",
    s: s.Singer || "",
    r: s.dnpReason || "data_quality"
  });
});

const orchList = Object.entries(byOrch)
  .map(([o, songs]) => ({ o, c: songs.length, songs }))
  .sort((a, b) => b.c - a.c);

console.log(JSON.stringify(orchList, null, 2));
