const data = require("../public/songData/djSongsWeighted.json");
const songs = data.songs;

// Find DNP songs
const dnpSongs = songs.filter(s => s.doNotPlay === true);
console.log("DNP Songs:", dnpSongs.length);

// Find songs missing year
const missingYear = songs.filter(s => s.Year === "" || s.Year === null || s.Year === undefined);
console.log("Missing Year:", missingYear.length);

// Find songs missing orchestra
const missingOrch = songs.filter(s => s.ArtistMaster === "" || s.ArtistMaster === null || s.ArtistMaster === undefined);
console.log("Missing Orchestra:", missingOrch.length);

// Find reissues
const reissues = songs.filter(s => s.isReissue === true);
console.log("Reissues:", reissues.length);

// Output DNP details by reason
const byReason = {};
dnpSongs.forEach(s => {
  const reason = s.dnpReason || "unspecified";
  if (!byReason[reason]) byReason[reason] = [];
  byReason[reason].push({
    title: s.Title,
    orchestra: s.ArtistMaster || "(none)",
    year: s.Year || "(none)",
    singer: s.Singer || "(none)"
  });
});

console.log("\nDNP by reason:");
Object.entries(byReason).forEach(([reason, list]) => {
  console.log(`\n${reason}: ${list.length} songs`);
  list.slice(0, 8).forEach(s => console.log(`  - ${s.title} | ${s.orchestra} | ${s.year} | ${s.singer}`));
  if (list.length > 8) console.log(`  ... and ${list.length - 8} more`);
});

// Output JSON for report
const reportData = {
  generated: new Date().toISOString(),
  summary: {
    totalSongs: songs.length,
    dnpSongs: dnpSongs.length,
    missingYear: missingYear.length,
    missingOrchestra: missingOrch.length,
    reissues: reissues.length
  },
  byReason: Object.entries(byReason).map(([reason, list]) => ({
    reason,
    count: list.length,
    songs: list
  })),
  // Group DNP by orchestra
  byOrchestra: (() => {
    const grouped = {};
    dnpSongs.forEach(s => {
      const orch = s.ArtistMaster || "(none)";
      if (!grouped[orch]) grouped[orch] = [];
      grouped[orch].push({
        title: s.Title,
        year: s.Year || "(none)",
        singer: s.Singer || "(none)",
        reason: s.dnpReason || "unspecified"
      });
    });
    return Object.entries(grouped)
      .map(([orchestra, songs]) => ({ orchestra, count: songs.length, songs }))
      .sort((a, b) => b.count - a.count);
  })()
};

console.log("\n\nJSON Report Data:");
console.log(JSON.stringify(reportData, null, 2));
