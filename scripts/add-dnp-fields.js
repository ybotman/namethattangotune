#!/usr/bin/env node
/**
 * Add DNP (Do Not Play) fields to djSongsWeighted.json
 * and auto-mark remaining DQ issues as DNP.
 *
 * Usage: node scripts/add-dnp-fields.js
 */

const fs = require('fs');
const path = require('path');

const SONGS_PATH = path.join(__dirname, '..', 'public', 'songData', 'djSongsWeighted.json');
const DQ_PATH = path.join(__dirname, '..', 'public', 'songData', 'dataQualityIssues.json');

// Load data
console.log('Loading data...');
const songsData = JSON.parse(fs.readFileSync(SONGS_PATH, 'utf8'));
const dqData = JSON.parse(fs.readFileSync(DQ_PATH, 'utf8'));

// Build set of DQ issue song IDs (not_reviewed only)
const dqSongIds = new Set();
dqData.issues.forEach(issue => {
  if (issue.status === 'not_reviewed') {
    dqSongIds.add(issue.songId);
  }
});

console.log(`Found ${dqSongIds.size} not_reviewed DQ issues to mark as DNP`);

// Update songs
let updated = 0;
let alreadyHadDnp = 0;

songsData.songs = songsData.songs.map(song => {
  // Check if already has DNP field
  if (song.doNotPlay !== undefined) {
    alreadyHadDnp++;
  }

  // Mark as DNP if in DQ issues
  const isDqIssue = dqSongIds.has(song.SongID);

  return {
    ...song,
    doNotPlay: isDqIssue ? true : (song.doNotPlay || false),
    dnpReason: isDqIssue ? 'data_quality' : (song.dnpReason || null),
    dnpNotes: isDqIssue ? 'Auto-marked from unreviewed DQ issues' : (song.dnpNotes || null),
  };
});

// Count results
const dnpCount = songsData.songs.filter(s => s.doNotPlay).length;
const totalSongs = songsData.songs.length;

console.log(`\nResults:`);
console.log(`- Total songs: ${totalSongs}`);
console.log(`- Songs with DNP=true: ${dnpCount}`);
console.log(`- Auto-marked from DQ: ${dqSongIds.size}`);
console.log(`- Playable songs: ${totalSongs - dnpCount}`);

// Save
console.log('\nSaving...');
fs.writeFileSync(SONGS_PATH, JSON.stringify(songsData, null, 2));
console.log('Done!');
