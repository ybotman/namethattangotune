// Build SingerMaster.json from djSongsWeighted + IconicMaster
const fs = require('fs');
const data = require('../public/songData/djSongsWeighted.json');
const iconic = require('../docs/IconicMaster.json');

// Level 1 singers from IconicMaster (with era)
const level1Map = {};
iconic.iconicSingers.forEach(s => {
  if (s.tier === 1) {
    level1Map[s.singer] = {
      level: 1,
      era: s.era || 'golden',
      orchestra: s.orchestra,
      notes: s.notes
    };
  }
});

// Level 2 singers - important but not iconic
const level2Singers = {
  'Roberto Maida': { era: 'golden', orchestra: 'Francisco Canaro', notes: 'Canaro\'s main vocalist' },
  'Jorge Omar': { era: 'golden', orchestra: 'Francisco Canaro', notes: 'Prolific Canaro singer' },
  'Armando Moreno': { era: 'golden', orchestra: 'Enrique Rodriguez', notes: 'Rodriguez\'s signature voice' },
  'Armando Laborde': { era: 'later', orchestra: 'Juan D\'Arienzo', notes: 'Later D\'Arienzo era' },
  'Carlos Dante': { era: 'golden', orchestra: 'Alfredo de Angelis', notes: 'De Angelis duo' },
  'Oscar Larroca': { era: 'golden', orchestra: 'Alfredo de Angelis', notes: 'De Angelis duo' },
  'Alberto Reynal': { era: 'golden', orchestra: 'Juan D\'Arienzo', notes: 'D\'Arienzo 1940s' },
  'Alberto Marino': { era: 'golden', orchestra: 'Anibal Troilo', notes: 'Post-Fiorentino Troilo' },
  'Ricardo Ruiz': { era: 'golden', orchestra: 'Alfredo de Angelis', notes: 'De Angelis vocalist' },
  'Oscar Serpa': { era: 'golden', orchestra: 'Miguel Calo', notes: 'Caló vocalist' },
  'Roberto Ray': { era: 'golden', orchestra: 'Osvaldo Fresedo', notes: 'Fresedo-Ray partnership' },
  'Fernando Diaz': { era: 'golden', orchestra: 'Miguel Calo', notes: 'Caló vocalist' },
  'Raul Iriarte': { era: 'golden', orchestra: 'Miguel Calo', notes: 'Caló vocalist' },
  'Horacio Lagos': { era: 'golden', orchestra: 'Edgardo Donato', notes: 'Donato vocalist' },
  'Hugo Duval': { era: 'golden', orchestra: 'Ricardo Tanturi', notes: 'Tanturi vocalist' },
  'Ernesto Fama': { era: 'golden', orchestra: 'Francisco Canaro', notes: 'Most recorded Canaro singer' },
  'Teofilo Ibanez': { era: 'golden', orchestra: 'Rodolfo Biagi', notes: 'Early Biagi' },
  'Carlos Roldan': { era: 'golden', orchestra: 'Juan D\'Arienzo', notes: 'D\'Arienzo vocalist' },
  'Charlo': { era: 'golden', orchestra: 'soloist', notes: 'Major solo vocalist' },
  'Jorge Vidal': { era: 'later', orchestra: 'Osvaldo Pugliese', notes: 'Later Pugliese' }
};

// Extract all singers with song counts
const singers = {};
data.songs.forEach(s => {
  const singer = s.Singer;
  if (singer && singer.toLowerCase() !== 'instrumental' && singer !== '') {
    if (!singers[singer]) {
      singers[singer] = { songCount: 0, years: [] };
    }
    singers[singer].songCount++;
    if (s.Year) singers[singer].years.push(parseInt(s.Year));
  }
});

// Build SingerMaster array
const singerMaster = [];

Object.entries(singers).forEach(([name, info]) => {
  // Determine era from average year if not specified
  let era = 'golden';
  if (info.years.length > 0) {
    const avgYear = info.years.reduce((a, b) => a + b, 0) / info.years.length;
    era = avgYear > 1955 ? 'later' : 'golden';
  }

  // Check if Level 1
  if (level1Map[name]) {
    singerMaster.push({
      singer: name,
      level: 1,
      era: level1Map[name].era,
      songCount: info.songCount,
      orchestra: level1Map[name].orchestra,
      notes: level1Map[name].notes
    });
  }
  // Check if Level 2
  else if (level2Singers[name]) {
    singerMaster.push({
      singer: name,
      level: 2,
      era: level2Singers[name].era,
      songCount: info.songCount,
      orchestra: level2Singers[name].orchestra,
      notes: level2Singers[name].notes
    });
  }
  // Everyone else is Level 3
  else {
    singerMaster.push({
      singer: name,
      level: 3,
      era: era,
      songCount: info.songCount
    });
  }
});

// Sort by level, then songCount
singerMaster.sort((a, b) => {
  if (a.level !== b.level) return a.level - b.level;
  return b.songCount - a.songCount;
});

const output = {
  version: 1,
  generated: '2026-03-01',
  notes: 'Singer tiers with era classification',
  levelDefinitions: {
    1: 'Iconic - instantly recognizable voices, essential pairings',
    2: 'Essential - important vocalists, prolific recordings',
    3: 'Standard - all other vocalists'
  },
  eraDefinitions: {
    golden: '1935-1955 Golden Age recordings',
    later: '1955+ Later era, typically solo or modern'
  },
  singers: singerMaster
};

// Stats
const l1 = singerMaster.filter(s => s.level === 1).length;
const l2 = singerMaster.filter(s => s.level === 2).length;
const l3 = singerMaster.filter(s => s.level === 3).length;
console.log(`Level 1: ${l1}, Level 2: ${l2}, Level 3: ${l3}`);
console.log(`Total: ${singerMaster.length}`);

fs.writeFileSync('../public/songData/SingerMaster.json', JSON.stringify(output, null, 2));
console.log('SingerMaster.json written to public/songData/');
