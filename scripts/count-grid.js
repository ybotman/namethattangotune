const fs = require('fs');

// Load data
const djSongs = JSON.parse(fs.readFileSync('public/songData/djSongsWeighted.json', 'utf8'));
const artistMaster = JSON.parse(fs.readFileSync('public/songData/ArtistMaster.json', 'utf8'));
const vocalData = JSON.parse(fs.readFileSync('public/songData/vocalAnalysis.json', 'utf8'));

// Build artist level map
const artistLevelMap = {};
artistMaster.forEach(a => {
  if (a.active === 'true') {
    artistLevelMap[a.artist.toLowerCase()] = parseInt(a.level, 10);
  }
});

// Enrich songs with orchestraLevel
const songs = djSongs.songs
  .filter(s => !s.doNotPlay)
  .filter(s => s.ArtistMaster && s.ArtistMaster.trim() !== '')
  .map(s => {
    const artistName = s.ArtistMaster?.trim().toLowerCase();
    const level = artistLevelMap[artistName] || null;
    const vocal = vocalData[s.SongID];
    return {
      ...s,
      orchestraLevel: level,
      hasSinger: vocal?.hasSinger === true
    };
  });

// Orchestra tier mappings
const TIERS = {
  'Big4': [1],
  'Classic': [2],
  'Deep': [3, 4, 5]
};

// Sub-tier ranges (percentile-based within pool)
const SUB_TIERS = {
  'Classics': { min: 0.7, max: 1.0 },
  'Standards': { min: 0.3, max: 0.7 },
  'DeepCuts': { min: 0.0, max: 0.3 }
};

function applySubTier(pool, subTier) {
  if (pool.length === 0) return [];
  const sorted = [...pool].sort((a, b) => (b.songFamiliarity || 0) - (a.songFamiliarity || 0));
  const { min, max } = SUB_TIERS[subTier];
  const startIdx = Math.floor(sorted.length * (1 - max));
  const endIdx = Math.floor(sorted.length * (1 - min));
  return sorted.slice(startIdx, endIdx);
}

function countSongs(tierKey, subTierKey, style, withVocals) {
  const levels = TIERS[tierKey];

  // Filter by orchestra level
  let pool = songs.filter(s => s.orchestraLevel && levels.includes(s.orchestraLevel));

  // Filter by style
  pool = pool.filter(s => s.Style?.toLowerCase() === style.toLowerCase());

  // Filter by vocals
  if (withVocals) {
    pool = pool.filter(s => s.hasSinger === true);
  } else {
    pool = pool.filter(s => s.hasSinger !== true);
  }

  // Apply sub-tier
  pool = applySubTier(pool, subTierKey);

  return pool.length;
}

const tierKeys = ['Big4', 'Classic', 'Deep'];
const subTierKeys = ['Classics', 'Standards', 'DeepCuts'];
const styles = ['Tango', 'Vals', 'Milonga'];

console.log('='.repeat(80));
console.log('INSTRUMENTAL (No Vocals)');
console.log('='.repeat(80));

for (const style of styles) {
  console.log('\n' + style.toUpperCase());
  console.log('-'.repeat(50));
  console.log('            | Classics | Standards | DeepCuts | TOTAL');
  console.log('-'.repeat(50));

  for (const tier of tierKeys) {
    const counts = subTierKeys.map(sub => countSongs(tier, sub, style, false));
    const total = counts.reduce((a, b) => a + b, 0);
    const padTier = tier.padEnd(11);
    const padCounts = counts.map(c => String(c).padStart(8)).join(' |');
    console.log(padTier + ' |' + padCounts + ' |' + String(total).padStart(6));
  }

  // Column totals
  const colTotals = subTierKeys.map(sub =>
    tierKeys.reduce((sum, tier) => sum + countSongs(tier, sub, style, false), 0)
  );
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);
  console.log('-'.repeat(50));
  console.log('TOTAL       |' + colTotals.map(c => String(c).padStart(8)).join(' |') + ' |' + String(grandTotal).padStart(6));
}

console.log('\n' + '='.repeat(80));
console.log('WITH VOCALS');
console.log('='.repeat(80));

for (const style of styles) {
  console.log('\n' + style.toUpperCase());
  console.log('-'.repeat(50));
  console.log('            | Classics | Standards | DeepCuts | TOTAL');
  console.log('-'.repeat(50));

  for (const tier of tierKeys) {
    const counts = subTierKeys.map(sub => countSongs(tier, sub, style, true));
    const total = counts.reduce((a, b) => a + b, 0);
    const padTier = tier.padEnd(11);
    const padCounts = counts.map(c => String(c).padStart(8)).join(' |');
    console.log(padTier + ' |' + padCounts + ' |' + String(total).padStart(6));
  }

  // Column totals
  const colTotals = subTierKeys.map(sub =>
    tierKeys.reduce((sum, tier) => sum + countSongs(tier, sub, style, true), 0)
  );
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);
  console.log('-'.repeat(50));
  console.log('TOTAL       |' + colTotals.map(c => String(c).padStart(8)).join(' |') + ' |' + String(grandTotal).padStart(6));
}

// Grand summary
console.log('\n' + '='.repeat(80));
console.log('GRAND TOTALS BY TIER');
console.log('='.repeat(80));

let grandInstrumental = 0;
let grandVocal = 0;

for (const tier of tierKeys) {
  let instrTotal = 0;
  let vocalTotal = 0;
  for (const style of styles) {
    for (const sub of subTierKeys) {
      instrTotal += countSongs(tier, sub, style, false);
      vocalTotal += countSongs(tier, sub, style, true);
    }
  }
  grandInstrumental += instrTotal;
  grandVocal += vocalTotal;
  console.log(tier.padEnd(12) + '| Instrumental: ' + String(instrTotal).padStart(5) + ' | Vocal: ' + String(vocalTotal).padStart(5) + ' | Combined: ' + String(instrTotal + vocalTotal).padStart(5));
}

console.log('-'.repeat(60));
console.log('ALL TIERS   | Instrumental: ' + String(grandInstrumental).padStart(5) + ' | Vocal: ' + String(grandVocal).padStart(5) + ' | Combined: ' + String(grandInstrumental + grandVocal).padStart(5));
