/**
 * Build songFamiliarity scores for djSongsWeighted.json
 *
 * Formula:
 *   songFamiliarity =
 *     (0.35 × orchestra_level_inverted) +     // L1=1.0, L5=0.2
 *     (0.25 × star_rating_normalized) +        // StarRating / 5
 *     (0.20 × has_plays_binary) +              // 1 if PlayCount > 0
 *     (0.10 × play_count_normalized) +         // log(PlayCount) / max
 *     (0.10 × singer_fame_score) +             // From SingerMaster level
 *     iconic_bonus                              // +0.2 if in IconicMaster
 */

const fs = require('fs');

// Load data files
const djSongs = require('../public/songData/djSongsWeighted.json');
const artistMaster = require('../public/songData/ArtistMaster.json');
const singerMaster = require('../public/songData/SingerMaster.json');
const iconicMaster = require('../docs/IconicMaster.json');

// Build lookup maps
const orchestraLevelMap = {};
artistMaster.forEach(a => {
  orchestraLevelMap[a.artist] = parseInt(a.level);
  // Also map grouped names
  if (a.grouped) {
    a.grouped.forEach(g => {
      orchestraLevelMap[g] = parseInt(a.level);
    });
  }
});

const singerLevelMap = {};
const singerEraMap = {};
singerMaster.singers.forEach(s => {
  singerLevelMap[s.singer] = s.level;
  singerEraMap[s.singer] = s.era;
});

// Build iconic song lookup (title + orchestra only - year matching was too strict)
// This allows all versions of an iconic song to get the bonus
const iconicSongSet = new Set();
iconicMaster.iconicSongs.forEach(s => {
  const key = `${s.title.toLowerCase()}|${s.orchestra.toLowerCase()}`;
  iconicSongSet.add(key);
});

// Calculate max play count for normalization
const maxPlayCount = Math.max(...djSongs.songs.map(s => s.TimesPlayed || 0));
const logMaxPlayCount = Math.log(maxPlayCount + 1);

// Stats tracking
let stats = {
  total: 0,
  withOrchestraLevel: 0,
  withSingerLevel: 0,
  withPlays: 0,
  isIconic: 0,
  missingOrchestra: new Set()
};

// Process each song
djSongs.songs.forEach(song => {
  stats.total++;

  // Orchestra level (inverted: L1=1.0, L2=0.8, L3=0.6, L4=0.4, L5=0.2)
  // Use ArtistMaster field (normalized orchestra name)
  const orchestraName = song.ArtistMaster || song.Orchestra;
  const orchestraLevel = orchestraLevelMap[orchestraName];
  let orchestraScore = 0.5; // default for unknown
  if (orchestraLevel) {
    stats.withOrchestraLevel++;
    orchestraScore = 1.2 - (orchestraLevel * 0.2); // L1=1.0, L2=0.8, etc.
    song.orchestraLevel = orchestraLevel;
  } else {
    stats.missingOrchestra.add(orchestraName);
    song.orchestraLevel = 4; // default to L4
  }

  // Star rating normalized (0-1) - field is Rating not StarRating
  const starScore = (song.Rating || 3) / 5;

  // Has plays binary - field is TimesPlayed not PlayCount
  const hasPlays = (song.TimesPlayed || 0) > 0 ? 1 : 0;
  if (hasPlays) stats.withPlays++;

  // Play count normalized (log scale)
  const playScore = hasPlays ? Math.log((song.TimesPlayed || 0) + 1) / logMaxPlayCount : 0;

  // Singer level score (L1=1.0, L2=0.7, L3=0.4, instrumental=0.5)
  const singer = song.Singer;
  let singerScore = 0.5; // default for instrumental
  if (singer && singer.toLowerCase() !== 'instrumental' && singer !== '') {
    const singerLevel = singerLevelMap[singer];
    if (singerLevel) {
      stats.withSingerLevel++;
      singerScore = singerLevel === 1 ? 1.0 : singerLevel === 2 ? 0.7 : 0.4;
      song.singerLevel = singerLevel;
      song.singerEra = singerEraMap[singer] || 'golden';
    } else {
      song.singerLevel = 3;
      song.singerEra = 'golden';
    }
  } else {
    song.singerLevel = null;
    song.singerEra = null;
  }

  // Iconic bonus - match on title + orchestra only (ignoring year)
  const songKey = `${(song.Title || '').toLowerCase()}|${(song.ArtistMaster || '').toLowerCase()}`;
  const isIconic = iconicSongSet.has(songKey);
  const iconicBonus = isIconic ? 0.2 : 0;
  if (isIconic) {
    stats.isIconic++;
    song.isIconic = true;
  }

  // Calculate final familiarity score
  const rawScore =
    (0.35 * orchestraScore) +
    (0.25 * starScore) +
    (0.20 * hasPlays) +
    (0.10 * playScore) +
    (0.10 * singerScore) +
    iconicBonus;

  // Clamp to 0-1
  song.songFamiliarity = Math.min(1.0, Math.max(0, rawScore));
});

// Sort by familiarity (descending) for verification
const sortedByFamiliarity = [...djSongs.songs].sort((a, b) => b.songFamiliarity - a.songFamiliarity);

console.log('=== STATS ===');
console.log(`Total songs: ${stats.total}`);
console.log(`With orchestra level: ${stats.withOrchestraLevel} (${(stats.withOrchestraLevel/stats.total*100).toFixed(1)}%)`);
console.log(`With singer level: ${stats.withSingerLevel}`);
console.log(`With plays: ${stats.withPlays} (${(stats.withPlays/stats.total*100).toFixed(1)}%)`);
console.log(`Iconic songs matched: ${stats.isIconic}`);
console.log(`Missing orchestras: ${stats.missingOrchestra.size}`);
if (stats.missingOrchestra.size > 0 && stats.missingOrchestra.size < 20) {
  console.log('  ' + [...stats.missingOrchestra].join(', '));
}

console.log('\n=== TOP 20 BY FAMILIARITY ===');
sortedByFamiliarity.slice(0, 20).forEach((s, i) => {
  console.log(`${i+1}. ${s.Title} - ${s.ArtistMaster} (${s.Year}) = ${s.songFamiliarity.toFixed(3)}${s.isIconic ? ' [ICONIC]' : ''}`);
});

console.log('\n=== BOTTOM 10 BY FAMILIARITY ===');
sortedByFamiliarity.slice(-10).forEach((s, i) => {
  console.log(`${i+1}. ${s.Title} - ${s.ArtistMaster} (${s.Year}) = ${s.songFamiliarity.toFixed(3)}`);
});

// Distribution
const buckets = [0, 0, 0, 0, 0]; // 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
djSongs.songs.forEach(s => {
  const idx = Math.min(4, Math.floor(s.songFamiliarity * 5));
  buckets[idx]++;
});
console.log('\n=== FAMILIARITY DISTRIBUTION ===');
console.log(`0.0-0.2: ${buckets[0]} songs`);
console.log(`0.2-0.4: ${buckets[1]} songs`);
console.log(`0.4-0.6: ${buckets[2]} songs`);
console.log(`0.6-0.8: ${buckets[3]} songs`);
console.log(`0.8-1.0: ${buckets[4]} songs`);

// Update version and save
djSongs.version = (djSongs.version || 1) + 1;
djSongs.lastUpdate = '2026-03-05';
djSongs.familiarityFields = ['orchestraLevel', 'singerLevel', 'singerEra', 'songFamiliarity', 'isIconic'];

const path = require('path');
const outputPath = path.join(__dirname, '../public/songData/djSongsWeighted.json');
fs.writeFileSync(outputPath, JSON.stringify(djSongs, null, 2));
console.log('\n✅ djSongsWeighted.json updated with familiarity scores');
