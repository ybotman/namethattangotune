const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/songData/djSongsWeighted.json', 'utf8'));

// User's 100 iconic songs
const iconicList = [
  // D'Arienzo
  { title: 'La Cumparsita', orchestra: "Juan D'Arienzo", year: 1943 },
  { title: 'El Choclo', orchestra: "Juan D'Arienzo", year: 1938 },
  { title: 'El Flete', orchestra: "Juan D'Arienzo", year: 1938 },
  { title: 'La Puñalada', orchestra: "Juan D'Arienzo", year: 1937 },
  { title: 'Pensalo bien', orchestra: "Juan D'Arienzo", year: 1938 },
  { title: 'Don Esteban', orchestra: "Juan D'Arienzo", year: 1940 },
  { title: 'Hotel Victoria', orchestra: "Juan D'Arienzo", year: 1941 },
  { title: 'Unión Cívica', orchestra: "Juan D'Arienzo", year: 1944 },
  { title: 'Loca', orchestra: "Juan D'Arienzo", year: 1940 },
  { title: 'Paciencia', orchestra: "Juan D'Arienzo", year: 1938 },
  { title: 'Chirusa', orchestra: "Juan D'Arienzo", year: 1940 },
  { title: 'Retintin', orchestra: "Juan D'Arienzo", year: 1944 },
  // Di Sarli
  { title: 'Bahía Blanca', orchestra: 'Carlos Di Sarli', year: 1957 },
  { title: 'A la gran muñeca', orchestra: 'Carlos Di Sarli', year: 1947 },
  { title: 'El cielo en tus ojos', orchestra: 'Carlos Di Sarli', year: 1941 },
  { title: 'Comme il faut', orchestra: 'Carlos Di Sarli', year: 1954 },
  { title: 'Verdemar', orchestra: 'Carlos Di Sarli', year: 1954 },
  { title: 'Junto a tu corazón', orchestra: 'Carlos Di Sarli', year: 1944 },
  { title: 'La torcacita', orchestra: 'Carlos Di Sarli', year: 1940 },
  { title: 'Organito de la tarde', orchestra: 'Carlos Di Sarli', year: 1941 },
  { title: 'Paloma', orchestra: 'Carlos Di Sarli', year: 1954 },
  { title: 'El pollo Ricardo', orchestra: 'Carlos Di Sarli', year: 1954 },
  { title: 'Indio manso', orchestra: 'Carlos Di Sarli', year: 1940 },
  { title: 'A fuego lento', orchestra: 'Carlos Di Sarli', year: 1954 },
  // Pugliese
  { title: 'La yumba', orchestra: 'Osvaldo Pugliese', year: 1946 },
  { title: 'Gallo ciego', orchestra: 'Osvaldo Pugliese', year: 1948 },
  { title: 'Recuerdo', orchestra: 'Osvaldo Pugliese', year: 1947 },
  { title: 'Emancipación', orchestra: 'Osvaldo Pugliese', year: 1949 },
  { title: 'Malandraca', orchestra: 'Osvaldo Pugliese', year: 1954 },
  { title: 'Nochero soy', orchestra: 'Osvaldo Pugliese', year: 1962 },
  { title: 'Corrientes y Esmeralda', orchestra: 'Osvaldo Pugliese', year: 1943 },
  { title: 'Farol', orchestra: 'Osvaldo Pugliese', year: 1943 },
  { title: 'La beba', orchestra: 'Osvaldo Pugliese', year: 1947 },
  { title: 'Negracha', orchestra: 'Osvaldo Pugliese', year: 1952 },
  { title: 'Derecho viejo', orchestra: 'Osvaldo Pugliese', year: 1945 },
  { title: 'Perpetuum Mobile', orchestra: 'Osvaldo Pugliese', year: 1961 },
  // Troilo
  { title: 'La trampera', orchestra: 'Anibal Troilo', year: 1941 },
  { title: 'Sur', orchestra: 'Anibal Troilo', year: 1948 },
  { title: 'Malena', orchestra: 'Anibal Troilo', year: 1942 },
  { title: "Pa' que bailen los muchachos", orchestra: 'Anibal Troilo', year: 1941 },
  { title: 'Toda mi vida', orchestra: 'Anibal Troilo', year: 1941 },
  { title: 'El marne', orchestra: 'Anibal Troilo', year: 1941 },
  { title: 'Una canción', orchestra: 'Anibal Troilo', year: 1943 },
  { title: 'Quejas de bandoneón', orchestra: 'Anibal Troilo', year: 1958 },
  { title: 'Responso', orchestra: 'Anibal Troilo', year: 1951 },
  { title: 'Tango y copas', orchestra: 'Anibal Troilo', year: 1955 },
  // Biagi
  { title: 'El recodo', orchestra: 'Rodolfo Biagi', year: 1939 },
  { title: 'Racing Club', orchestra: 'Rodolfo Biagi', year: 1939 },
  { title: 'Indiferencia', orchestra: 'Rodolfo Biagi', year: 1942 },
  { title: 'Dichas que viví', orchestra: 'Rodolfo Biagi', year: 1941 },
  { title: 'Humillación', orchestra: 'Rodolfo Biagi', year: 1940 },
  { title: 'Lágrimas y sonrisas', orchestra: 'Rodolfo Biagi', year: 1941 },
  // Caló
  { title: 'Al compás del corazón', orchestra: 'Miguel Caló', year: 1942 },
  { title: 'Saludos', orchestra: 'Miguel Caló', year: 1942 },
  { title: 'Sans souci', orchestra: 'Miguel Caló', year: 1943 },
  { title: 'Trasnochando', orchestra: 'Miguel Caló', year: 1943 },
  { title: 'Qué te importa que te llore', orchestra: 'Miguel Caló', year: 1943 },
  // De Angelis
  { title: 'Cascabelito', orchestra: 'Alfredo De Angelis', year: 1943 },
  { title: 'El tango es el tango', orchestra: 'Alfredo De Angelis', year: 1946 },
  { title: 'El cencerro', orchestra: 'Alfredo De Angelis', year: 1946 },
  { title: 'Pavadita', orchestra: 'Alfredo De Angelis', year: 1946 },
  { title: 'Adiós marinero', orchestra: 'Alfredo De Angelis', year: 1945 },
  { title: 'Cabeza de novia', orchestra: 'Alfredo De Angelis', year: 1944 },
  // Canaro
  { title: 'Poema', orchestra: 'Francisco Canaro', year: 1935 },
  { title: 'Organito de la tarde', orchestra: 'Francisco Canaro', year: 1928 },
  { title: 'Sentimiento gaucho', orchestra: 'Francisco Canaro', year: 1942 },
  { title: 'Noche de reyes', orchestra: 'Francisco Canaro', year: 1941 },
  { title: 'El pollito', orchestra: 'Francisco Canaro', year: 1931 },
  { title: 'Pampa', orchestra: 'Francisco Canaro', year: 1937 },
  { title: 'Madreselva', orchestra: 'Francisco Canaro', year: 1931 },
  // Tanturi
  { title: 'Así se baila el tango', orchestra: 'Ricardo Tanturi', year: 1942 },
  { title: 'El tango es una historia', orchestra: 'Ricardo Tanturi', year: 1944 },
  { title: 'Pocas palabras', orchestra: 'Ricardo Tanturi', year: 1943 },
  { title: 'Domingo', orchestra: 'Ricardo Tanturi', year: 1943 },
  { title: 'Una noche de garufa', orchestra: 'Ricardo Tanturi', year: 1941 },
  // D'Agostino
  { title: 'Tres esquinas', orchestra: "Angel D'Agostino", year: 1941 },
  { title: 'El cocherito', orchestra: "Angel D'Agostino", year: 1940 },
  { title: 'Café dominguez', orchestra: "Angel D'Agostino", year: 1942 },
  { title: 'Shusheta', orchestra: "Angel D'Agostino", year: 1940 },
  { title: 'Lejos de Buenos Aires', orchestra: "Angel D'Agostino", year: 1943 },
  // Laurenz
  { title: 'Milonga de mis amores', orchestra: 'Pedro Laurenz', year: 1937 },
  { title: 'Nunca tuvo novio', orchestra: 'Pedro Laurenz', year: 1937 },
  { title: 'Arrabalera', orchestra: 'Pedro Laurenz', year: 1937 },
  { title: 'Como dos extraños', orchestra: 'Pedro Laurenz', year: 1944 },
  // Rodriguez
  { title: 'Adiós pampa mía', orchestra: 'Enrique Rodriguez', year: 1942 },
  { title: 'Bésame', orchestra: 'Enrique Rodriguez', year: 1941 },
  { title: 'Clavel del aire', orchestra: 'Enrique Rodriguez', year: 1943 },
  // Demare
  { title: 'Malena', orchestra: 'Lucio Demare', year: 1942 },
  { title: 'Tango guapo', orchestra: 'Lucio Demare', year: 1942 },
  { title: 'Mandria', orchestra: 'Lucio Demare', year: 1942 },
  // Donato
  { title: 'A media luz', orchestra: 'Edgardo Donato', year: 1927 },
  { title: 'El huracán', orchestra: 'Edgardo Donato', year: 1932 },
  { title: 'Julián', orchestra: 'Edgardo Donato', year: 1933 },
  // Gardel
  { title: 'Por una cabeza', orchestra: 'Carlos Gardel', year: 1935 },
  { title: 'El día que me quieras', orchestra: 'Carlos Gardel', year: 1935 },
  { title: 'Volver', orchestra: 'Carlos Gardel', year: 1935 },
  { title: 'Silencio', orchestra: 'Carlos Gardel', year: 1932 },
  // Fresedo
  { title: 'El espiante', orchestra: 'Osvaldo Fresedo', year: 1947 },
  { title: 'Vida mía', orchestra: 'Osvaldo Fresedo', year: 1933 },
  { title: 'Pampero', orchestra: 'Osvaldo Fresedo', year: 1950 },
];

// Normalize for matching
const normalize = (s) => s?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || '';

let matched = [];
let unmatched = [];

iconicList.forEach(iconic => {
  const titleNorm = normalize(iconic.title);
  const orchNorm = normalize(iconic.orchestra);

  const match = data.songs.find(song => {
    const songTitle = normalize(song.Title);
    const songOrch = normalize(song.ArtistMaster);
    if (songTitle === titleNorm && songOrch === orchNorm) return true;
    if (songTitle.includes(titleNorm) && songOrch === orchNorm) return true;
    if (titleNorm.includes(songTitle) && songOrch === orchNorm && songTitle.length > 3) return true;
    return false;
  });

  if (match) {
    matched.push({ iconic, match });
  } else {
    unmatched.push(iconic);
  }
});

// Build orchestras list
const orchestras = [...new Set(matched.map(m => m.match.ArtistMaster))].sort();

// Build singers list (from matched songs that have singers)
const singers = [...new Set(matched.map(m => m.match.Singer).filter(s => s && s.trim()))].sort();

// Build the JSON
const iconicLists = {
  version: 1,
  _generated: new Date().toISOString(),
  _stats: {
    totalInList: iconicList.length,
    matched: matched.length,
    unmatched: unmatched.length
  },

  iconicOrchestras: orchestras,

  iconicSingers: singers,

  iconicSongs: matched.map(m => ({
    songId: m.match.SongID,
    title: m.match.Title,
    orchestra: m.match.ArtistMaster,
    year: m.match.Year,
    singer: m.match.Singer || null,
    originalTitle: m.iconic.title
  })),

  unmatchedSongs: unmatched.map(u => ({
    title: u.title,
    orchestra: u.orchestra,
    year: u.year
  }))
};

// Write JSON
fs.writeFileSync('public/songData/IconicLists.json', JSON.stringify(iconicLists, null, 2));
console.log('Written to public/songData/IconicLists.json\n');

// Summary
console.log('=== ICONIC ORCHESTRAS (' + orchestras.length + ') ===');
orchestras.forEach(o => {
  const count = matched.filter(m => m.match.ArtistMaster === o).length;
  console.log(`  ${o}: ${count} songs`);
});

console.log('\n=== ICONIC SINGERS (' + singers.length + ') ===');
singers.forEach(s => {
  const count = matched.filter(m => m.match.Singer === s).length;
  console.log(`  ${s}: ${count} songs`);
});

console.log('\n=== MATCHED SONGS BY ORCHESTRA ===');
orchestras.forEach(o => {
  console.log(`\n${o}:`);
  matched.filter(m => m.match.ArtistMaster === o).forEach(m => {
    const singer = m.match.Singer ? ` (${m.match.Singer})` : '';
    console.log(`  - ${m.match.Title}${singer} [${m.match.Year}]`);
  });
});

console.log('\n=== UNMATCHED (NOT IN DB) - ' + unmatched.length + ' ===');
const unmatchedByOrch = {};
unmatched.forEach(u => {
  if (!unmatchedByOrch[u.orchestra]) unmatchedByOrch[u.orchestra] = [];
  unmatchedByOrch[u.orchestra].push(u);
});
Object.keys(unmatchedByOrch).sort().forEach(o => {
  console.log(`\n${o}:`);
  unmatchedByOrch[o].forEach(u => console.log(`  - ${u.title} (${u.year})`));
});
