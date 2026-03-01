// Extract unique singers from djSongsWeighted.json
const data = require('../public/songData/djSongsWeighted.json');

const singers = {};
data.songs.forEach(s => {
  const singer = s.Singer;
  if (singer && singer.toLowerCase() !== 'instrumental' && singer !== '') {
    singers[singer] = (singers[singer] || 0) + 1;
  }
});

const sorted = Object.entries(singers).sort((a, b) => b[1] - a[1]);
console.log('Total unique singers:', sorted.length);
console.log('\nTop 50 by song count:');
sorted.slice(0, 50).forEach(([name, count], i) => {
  console.log(`${i + 1}. ${name}: ${count}`);
});

console.log('\n--- All singers for SingerMaster ---');
console.log(JSON.stringify(sorted.map(([name, count]) => ({ singer: name, songCount: count })), null, 2));
