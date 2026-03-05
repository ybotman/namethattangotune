const djSongs = require('../public/songData/djSongsWeighted.json');

// Find blank orchestra with singer
const blankOrch = djSongs.songs.filter(s => {
  const orch = s.ArtistMaster || '';
  const singer = s.Singer || '';
  return orch.trim() === '' &&
         singer.trim() !== '' &&
         singer.toLowerCase() !== 'instrumental';
});

console.log('Blank orchestra with singer: ' + blankOrch.length);

// Count by singer
const bySinger = {};
blankOrch.forEach(s => {
  bySinger[s.Singer] = (bySinger[s.Singer] || 0) + 1;
});

console.log('\nTop 20 singers with blank orchestra:');
Object.entries(bySinger)
  .sort((a,b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([singer, count]) => {
    console.log('  ' + singer + ': ' + count);
  });

console.log('\nTotal unique singers: ' + Object.keys(bySinger).length);
