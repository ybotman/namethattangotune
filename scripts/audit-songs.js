#!/usr/bin/env node
/**
 * AUDITSONGS - Complete Song Data Audit
 *
 * Generates:
 * 1. Grid inventories for Orchestra, Singer, and Song games (9 cells each)
 * 2. Copies all master JSON files
 * 3. Creates a comprehensive audit report with logic documentation
 *
 * Output: public/docs/AUDIT_[timestamp]/
 */

const fs = require('fs');
const path = require('path');

// Paths
const dataDir = path.join(__dirname, '../public/songData');
const docsDir = path.join(__dirname, '../docs');
const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const auditDir = path.join(__dirname, `../public/docs/AUDIT_${timestamp}`);

// Load data
const djSongs = require(path.join(dataDir, 'djSongsWeighted.json'));
const artistMaster = require(path.join(dataDir, 'ArtistMaster.json'));
const singerMaster = require(path.join(dataDir, 'SingerMaster.json'));
const iconicMaster = require(path.join(docsDir, 'IconicMaster.json'));

// Create audit directory
if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

console.log(`\n=== AUDITSONGS: ${timestamp} ===\n`);

// ============================================================
// GRID DEFINITIONS
// ============================================================

const ORCHESTRA_TIERS = {
  Icons: [1],           // Level 1: Big 4
  Core: [2],            // Level 2: Essential orchestras
  Niche: [3, 4, 5]      // Level 3-5: Specialists and obscure
};

const FAMILIARITY_TIERS = {
  Famous: { min: 0.7, max: 1.0 },    // High recognition
  Known: { min: 0.5, max: 0.7 },     // Medium recognition
  Deep: { min: 0.0, max: 0.5 }       // Low recognition / deep cuts
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getOrchestraTier(song) {
  const level = song.orchestraLevel || 4;
  if (ORCHESTRA_TIERS.Icons.includes(level)) return 'Icons';
  if (ORCHESTRA_TIERS.Core.includes(level)) return 'Core';
  return 'Niche';
}

function getFamiliarityTier(song) {
  const fam = song.songFamiliarity || 0;
  if (fam >= FAMILIARITY_TIERS.Famous.min) return 'Famous';
  if (fam >= FAMILIARITY_TIERS.Known.min) return 'Known';
  return 'Deep';
}

function getSingerTier(song) {
  const level = song.singerLevel;
  if (!level || song.Singer === 'instrumental' || !song.Singer) return null;
  if (level === 1) return 'Icons';
  if (level === 2) return 'Core';
  return 'Niche';
}

// ============================================================
// BUILD GRIDS
// ============================================================

function buildOrchestraGrid() {
  const grid = {};
  const tiers = ['Icons', 'Core', 'Niche'];
  const fams = ['Famous', 'Known', 'Deep'];

  // Initialize
  tiers.forEach(t => {
    fams.forEach(f => {
      grid[`${t}-${f}`] = [];
    });
  });

  // Populate - only playable songs (not DNP/DUP)
  djSongs.songs.filter(s => !s.DNP && !s.DUP).forEach(song => {
    const tier = getOrchestraTier(song);
    const fam = getFamiliarityTier(song);
    const cell = `${tier}-${fam}`;
    grid[cell].push({
      title: song.Title,
      orchestra: song.ArtistMaster || song.Orchestra,
      year: song.Year,
      familiarity: song.songFamiliarity,
      isIconic: song.isIconic || false
    });
  });

  return grid;
}

function buildSingerGrid() {
  const grid = {};
  const tiers = ['Icons', 'Core', 'Niche'];
  const fams = ['Famous', 'Known', 'Deep'];

  // Initialize
  tiers.forEach(t => {
    fams.forEach(f => {
      grid[`${t}-${f}`] = [];
    });
  });

  // Populate - only vocal songs, not DNP/DUP
  djSongs.songs.filter(s =>
    !s.DNP && !s.DUP &&
    s.Singer &&
    s.Singer.toLowerCase() !== 'instrumental' &&
    s.Singer.trim() !== ''
  ).forEach(song => {
    const tier = getSingerTier(song);
    if (!tier) return;
    const fam = getFamiliarityTier(song);
    const cell = `${tier}-${fam}`;
    grid[cell].push({
      title: song.Title,
      singer: song.Singer,
      orchestra: song.ArtistMaster || song.Orchestra,
      year: song.Year,
      familiarity: song.songFamiliarity,
      isIconic: song.isIconic || false
    });
  });

  return grid;
}

function buildSongGrid() {
  // Song grid uses familiarity tiers differently - based on absolute familiarity
  const grid = {};
  const famLevels = ['High', 'Medium', 'Low'];
  const recLevels = ['Famous', 'Known', 'Deep'];

  const SONG_FAM = {
    High: { min: 0.75, max: 1.0 },
    Medium: { min: 0.5, max: 0.75 },
    Low: { min: 0.0, max: 0.5 }
  };

  // Initialize
  famLevels.forEach(f => {
    recLevels.forEach(r => {
      grid[`${f}-${r}`] = [];
    });
  });

  // For song grid, we use orchestra tier for "recognition" axis
  djSongs.songs.filter(s => !s.DNP && !s.DUP).forEach(song => {
    const fam = song.songFamiliarity || 0;
    let famLevel = 'Low';
    if (fam >= SONG_FAM.High.min) famLevel = 'High';
    else if (fam >= SONG_FAM.Medium.min) famLevel = 'Medium';

    // Recognition based on orchestra tier
    const orchTier = getOrchestraTier(song);
    let recLevel = 'Deep';
    if (orchTier === 'Icons') recLevel = 'Famous';
    else if (orchTier === 'Core') recLevel = 'Known';

    const cell = `${famLevel}-${recLevel}`;
    grid[cell].push({
      title: song.Title,
      orchestra: song.ArtistMaster || song.Orchestra,
      singer: song.Singer,
      year: song.Year,
      familiarity: song.songFamiliarity,
      isIconic: song.isIconic || false
    });
  });

  return grid;
}

// ============================================================
// GENERATE REPORTS
// ============================================================

function generateGridSummary(grid, name) {
  let summary = `## ${name} Grid\n\n`;
  summary += '| Cell | Count | Iconic | Sample Songs |\n';
  summary += '|------|-------|--------|-------------|\n';

  Object.keys(grid).sort().forEach(cell => {
    const songs = grid[cell];
    const iconicCount = songs.filter(s => s.isIconic).length;
    const samples = songs.slice(0, 3).map(s => s.title).join(', ');
    summary += `| ${cell} | ${songs.length} | ${iconicCount} | ${samples} |\n`;
  });

  summary += `\n**Total: ${Object.values(grid).flat().length} songs**\n\n`;
  return summary;
}

function generateLogicDoc() {
  return `# NTTT Song Familiarity & Grid Logic

## Overview

NTTT uses a **familiarity scoring system** to place songs into difficulty grids for the three game modes:
1. **Orchestra Quiz** - Identify the orchestra
2. **Singer Quiz** - Identify the singer
3. **Song Quiz** - Identify the song title

---

## Familiarity Score Formula

Each song gets a \`songFamiliarity\` score (0.0 - 1.0):

\`\`\`
songFamiliarity =
  (0.35 × orchestra_level_inverted) +   // L1=1.0, L2=0.8, L3=0.6, L4=0.4, L5=0.2
  (0.25 × star_rating / 5) +            // Rating field normalized
  (0.20 × has_plays) +                  // 1 if TimesPlayed > 0
  (0.10 × log(plays) / log(max)) +      // Play count normalized
  (0.10 × singer_level_score) +         // L1=1.0, L2=0.7, L3=0.4, instrumental=0.5
  iconic_bonus                          // +0.2 if in IconicMaster
\`\`\`

### Iconic Bonus

Songs in \`IconicMaster.json\` get +0.2 bonus. Matching is on **title + orchestra** (year ignored).

---

## Orchestra Tiers (ArtistMaster.json)

| Level | Tier | Description | Examples |
|-------|------|-------------|----------|
| 1 | Icons | Big 4 - instantly recognizable | D'Arienzo, Di Sarli, Troilo, Pugliese |
| 2 | Core | Essential golden age | Tanturi, D'Agostino, Canaro, Biagi, Fresedo |
| 3 | Niche | Specialists | De Caro, Firpo, Donato |
| 4-5 | Niche | Obscure/modern | Various |

---

## Singer Tiers (SingerMaster.json)

| Level | Tier | Description | Examples |
|-------|------|-------------|----------|
| 1 | Icons | Most famous voices | Fiorentino, Vargas, Castillo, Podesta |
| 2 | Core | Essential singers | Rufino, Echague, Campos |
| 3 | Niche | Specialists | Various |

---

## Grid Cell Definitions

### Orchestra Grid (9 cells)
- **Rows**: Icons (L1), Core (L2), Niche (L3-5)
- **Columns**: Famous (fam ≥0.7), Known (0.5-0.7), Deep (<0.5)

### Singer Grid (9 cells)
- **Rows**: Icons (singer L1), Core (singer L2), Niche (singer L3)
- **Columns**: Famous (fam ≥0.7), Known (0.5-0.7), Deep (<0.5)
- Only includes vocal songs

### Song Grid (9 cells)
- **Rows**: High (fam ≥0.75), Medium (0.5-0.75), Low (<0.5)
- **Columns**: Famous (Icons orch), Known (Core orch), Deep (Niche orch)

---

## Data Files

| File | Purpose |
|------|---------|
| \`djSongsWeighted.json\` | Master song database with all fields |
| \`ArtistMaster.json\` | Orchestra tier definitions |
| \`SingerMaster.json\` | Singer tier definitions |
| \`IconicMaster.json\` | Iconic song overrides (+0.2 bonus) |

---

## Filtering Flags

| Flag | Meaning |
|------|---------|
| \`DNP\` | Do Not Play - excluded from all games |
| \`DUP\` | Duplicate - excluded from games (keep one version) |
| \`isIconic\` | In IconicMaster, gets familiarity boost |

---

## Key Stats (This Audit)

- **Total songs**: ${djSongs.songs.length}
- **Playable** (not DNP/DUP): ${djSongs.songs.filter(s => !s.DNP && !s.DUP).length}
- **Iconic songs**: ${djSongs.songs.filter(s => s.isIconic).length}
- **Vocal songs**: ${djSongs.songs.filter(s => s.Singer && s.Singer.toLowerCase() !== 'instrumental').length}
- **Instrumental**: ${djSongs.songs.filter(s => !s.Singer || s.Singer.toLowerCase() === 'instrumental').length}

### Familiarity Distribution
| Range | Count |
|-------|-------|
| 0.8-1.0 (Iconic tier) | ${djSongs.songs.filter(s => s.songFamiliarity >= 0.8).length} |
| 0.6-0.8 (Essential) | ${djSongs.songs.filter(s => s.songFamiliarity >= 0.6 && s.songFamiliarity < 0.8).length} |
| 0.4-0.6 (DJ picks) | ${djSongs.songs.filter(s => s.songFamiliarity >= 0.4 && s.songFamiliarity < 0.6).length} |
| 0.2-0.4 (Deep cuts) | ${djSongs.songs.filter(s => s.songFamiliarity >= 0.2 && s.songFamiliarity < 0.4).length} |
| 0.0-0.2 (Obscure) | ${djSongs.songs.filter(s => s.songFamiliarity < 0.2).length} |

`;
}

// ============================================================
// MAIN EXECUTION
// ============================================================

// Build grids
console.log('Building grids...');
const orchestraGrid = buildOrchestraGrid();
const singerGrid = buildSingerGrid();
const songGrid = buildSongGrid();

// Generate markdown report
let report = `# NTTT Song Audit - ${timestamp}\n\n`;
report += `Generated: ${new Date().toISOString()}\n\n`;
report += `---\n\n`;
report += generateGridSummary(orchestraGrid, 'Orchestra');
report += generateGridSummary(singerGrid, 'Singer');
report += generateGridSummary(songGrid, 'Song');
report += `---\n\n`;
report += generateLogicDoc();

// Write report
fs.writeFileSync(path.join(auditDir, 'AUDIT_REPORT.md'), report);
console.log('✅ AUDIT_REPORT.md');

// Write grid JSONs
fs.writeFileSync(path.join(auditDir, 'orchestraGrid.json'), JSON.stringify(orchestraGrid, null, 2));
fs.writeFileSync(path.join(auditDir, 'singerGrid.json'), JSON.stringify(singerGrid, null, 2));
fs.writeFileSync(path.join(auditDir, 'songGrid.json'), JSON.stringify(songGrid, null, 2));
console.log('✅ Grid JSONs (orchestra, singer, song)');

// Copy master files
fs.copyFileSync(path.join(dataDir, 'djSongsWeighted.json'), path.join(auditDir, 'djSongsWeighted.json'));
fs.copyFileSync(path.join(dataDir, 'ArtistMaster.json'), path.join(auditDir, 'ArtistMaster.json'));
fs.copyFileSync(path.join(dataDir, 'SingerMaster.json'), path.join(auditDir, 'SingerMaster.json'));
fs.copyFileSync(path.join(docsDir, 'IconicMaster.json'), path.join(auditDir, 'IconicMaster.json'));
console.log('✅ Master JSONs copied');

// Print summary
console.log(`\n=== AUDIT COMPLETE ===`);
console.log(`Output: ${auditDir}\n`);

console.log('Orchestra Grid:');
Object.keys(orchestraGrid).sort().forEach(cell => {
  console.log(`  ${cell}: ${orchestraGrid[cell].length} songs`);
});

console.log('\nSinger Grid:');
Object.keys(singerGrid).sort().forEach(cell => {
  console.log(`  ${cell}: ${singerGrid[cell].length} songs`);
});

console.log('\nSong Grid:');
Object.keys(songGrid).sort().forEach(cell => {
  console.log(`  ${cell}: ${songGrid[cell].length} songs`);
});

console.log(`\n📁 Files created in: ${auditDir}`);
