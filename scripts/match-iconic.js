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

console.log('=== MATCHING ICONIC SONGS AGAINST djSongsWeighted.json ===\n');
console.log('Total songs in database:', data.songs.length);
console.log('Iconic list size:', iconicList.length);
console.log('');

// Normalize for matching
const normalize = (s) => s?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || '';

let matched = [];
let unmatched = [];

iconicList.forEach(iconic => {
  const titleNorm = normalize(iconic.title);
  const orchNorm = normalize(iconic.orchestra);

  // Try to find match
  const match = data.songs.find(song => {
    const songTitle = normalize(song.Title);
    const songOrch = normalize(song.ArtistMaster);

    // Exact title + orchestra match
    if (songTitle === titleNorm && songOrch === orchNorm) return true;

    // Title contains + orchestra match
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

console.log('MATCHED:', matched.length, '/', iconicList.length);
console.log('UNMATCHED:', unmatched.length);
console.log('');

// Show unmatched
if (unmatched.length > 0) {
  console.log('=== UNMATCHED SONGS ===');
  unmatched.forEach(u => console.log(`  - ${u.title} (${u.orchestra}, ${u.year})`));
  console.log('');
}

// Compare with existing recognitionTier=1
const existingIconic = data.songs.filter(s => s.recognitionTier === 1);
console.log('=== COMPARISON WITH EXISTING recognitionTier=1 ===');
console.log('Existing iconic (tier 1) in database:', existingIconic.length);

const matchedIds = new Set(matched.map(m => m.match.SongID));
const existingIds = new Set(existingIconic.map(s => s.SongID));

const inBoth = [...matchedIds].filter(id => existingIds.has(id)).length;
const inListOnly = [...matchedIds].filter(id => !existingIds.has(id)).length;
const inDbOnly = [...existingIds].filter(id => !matchedIds.has(id)).length;

console.log('In BOTH (matched + already tier 1):', inBoth);
console.log('In your list but NOT tier 1:', inListOnly);
console.log('In tier 1 but NOT in your list:', inDbOnly);
console.log('');

// Show what's in list but not tier 1
if (inListOnly > 0) {
  console.log('=== YOUR ICONIC NOT IN TIER 1 ===');
  matched.filter(m => !existingIds.has(m.match.SongID)).forEach(m => {
    console.log(`  - ${m.match.Title} (${m.match.ArtistMaster}) - tier ${m.match.recognitionTier}`);
  });
}
