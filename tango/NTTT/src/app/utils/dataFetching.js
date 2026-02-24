//------------------------------------------------------------
// src/utils/dataFetching.js
//------------------------------------------------------------

/**
 * Fetch the entire ArtistMaster.json array directly.
 * Returns an array of objects like:
 *   [{ artist: "Carlos Di Sarli", level: "1", active: "true", ... }, ...]
 *
 * @returns {Promise<Array>} - The full ArtistMaster array
 */
export async function fetchAllArtists() {
  try {
    const artistData = await fetch("/songData/ArtistMaster.json").then((r) =>
      r.json(),
    );
    // You can filter or transform if needed
    // Example: only return active artists
    // const activeOnly = artistData.filter((a) => a.active === "true");
    return artistData;
  } catch (error) {
    console.error("Error fetching ArtistMaster data:", error);
    return [];
  }
}

/**
 * Fetch songs and artists data, enrich with artist levels, and filter them.
 * @param {string[]} artistMasters - Filter by artist names
 * @param {number[]} artistLevels - Filter by artist levels
 * @param {string[]} composers - Filter by composers
 * @param {string[]} styles - Filter by styles (Tango, Vals, Milonga)
 * @param {string} candombe - "true"/"false" or "" for no filter
 * @param {string} alternative - "true"/"false" or "" for no filter
 * @param {string} cancion - "true"/"false" or "" for no filter
 * @param {number} qty - Number of songs to return
 * @param {Object} options - Additional options
 * @param {boolean} options.includeSinger - Include songs with singer (default false = instrumental only)
 * @param {boolean} options.requireSinger - Require songs to have singer (for singer quiz)
 * @param {string[]} options.singers - Filter by specific singer names
 * @param {number[]} options.yearRange - [startYear, endYear] to filter by recording year
 * @param {string} options.duetFilter - 'all' (default) | 'solo' | 'duetsOnly' - filter by duet status
 * @param {number[]} options.recognitionTiers - Filter by recognition tier (1-5: Iconic, Essential, Familiar, Challenging, Deep Cuts)
 */
export async function fetchFilteredSongs(
  artistMasters = [],
  artistLevels = [],
  composers = [],
  styles = [],
  candombe = "",
  alternative = "",
  cancion = "",
  qty = "",
  options = {},
) {
  const { includeSinger = false, requireSinger = false, singers = [], yearRange = null, duetFilter = 'solo', recognitionTiers = [] } = options;

  try {
    // Use weighted songs (3-5 stars, prioritized by play count)
    const [djSongsData, artistData, singerData, vocalData] = await Promise.all([
      fetch(`/songData/djSongsWeighted.json`).then((r) => r.json()),
      fetch(`/songData/ArtistMaster.json`).then((r) => r.json()),
      fetch(`/songData/SingerMaster.json`).then((r) => r.json()),
      fetch(`/api/vocal-data`).then((r) => r.json()).catch(() => ({})),
    ]);
    console.log("DEBUG: Loaded vocal data entries:", Object.keys(vocalData).length);

    // Build singer duet lookup map: { singerNameLower: isDuetPlus }
    const singerDuetMap = {};
    singerData.forEach((s) => {
      if (s.singer) {
        singerDuetMap[s.singer.toLowerCase()] = s.isDuetPlus === true;
      }
    });

    // Build artistLevel map
    const artistLevelMap = {};
    artistData.forEach((artist) => {
      if (artist.active === "true") {
        artistLevelMap[artist.artist.toLowerCase()] = parseInt(
          artist.level,
          10,
        );
      }
    });

    // Enrich songs with level
    const enrichedSongs = djSongsData.songs.map((song) => {
      const artistName = song.ArtistMaster?.trim().toLowerCase();
      const songLevel =
        artistName && artistLevelMap[artistName]
          ? artistLevelMap[artistName]
          : null;
      return { ...song, level: songLevel };
    });

    // Filtering logic
    let filtered = enrichedSongs;
    console.log("DEBUG: Starting with", filtered.length, "songs");

    // ArtistMaster filter
    const validArtistMasters = artistMasters.filter(
      (a) => a && a.trim() !== "",
    );
    if (validArtistMasters.length > 0) {
      const artistMastersLower = validArtistMasters.map((a) => a.toLowerCase());
      filtered = filtered.filter(
        (song) =>
          song.ArtistMaster &&
          artistMastersLower.includes(song.ArtistMaster.trim().toLowerCase()),
      );
    }

    // ArtistLevel filter (legacy - orchestra-based levels)
    const validArtistLevels = artistLevels.filter((l) => typeof l === "number");
    if (validArtistLevels.length > 0) {
      filtered = filtered.filter(
        (song) => song.level && validArtistLevels.includes(song.level),
      );
    }

    // Recognition Tier filter (new - song-based tiers from djSongsWeighted.json)
    const validRecognitionTiers = recognitionTiers.filter((t) => typeof t === "number");
    if (validRecognitionTiers.length > 0) {
      filtered = filtered.filter(
        (song) => song.recognitionTier && validRecognitionTiers.includes(song.recognitionTier),
      );
      console.log("DEBUG: After recognitionTier filter:", filtered.length);
    }

    // Composer filter
    const validComposers = composers.filter((c) => c && c.trim() !== "");
    if (validComposers.length > 0) {
      const composersLower = validComposers.map((c) => c.toLowerCase());
      filtered = filtered.filter(
        (song) =>
          song.Composer &&
          composersLower.includes(song.Composer.trim().toLowerCase()),
      );
    }

    // Year range filter
    if (yearRange && Array.isArray(yearRange) && yearRange.length === 2) {
      const [startYear, endYear] = yearRange;
      filtered = filtered.filter((song) => {
        const year = parseInt(song.Year, 10);
        return !isNaN(year) && year >= startYear && year <= endYear;
      });
      console.log("DEBUG: After year filter:", filtered.length);
    }

    // Style filter
    const validStyles = styles.filter((s) => s && s.trim() !== "");
    if (validStyles.length > 0) {
      const stylesLower = validStyles.map((s) => s.toLowerCase());
      filtered = filtered.filter(
        (song) =>
          song.Style && stylesLower.includes(song.Style.trim().toLowerCase()),
      );
      console.log("DEBUG: After style filter:", filtered.length);
    }
    if (candombe) {
      filtered = filtered.filter((song) => song.Candombe === candombe);
    }
    if (alternative) {
      filtered = filtered.filter((song) => song.Alternative === alternative);
    }
    if (cancion) {
      filtered = filtered.filter((song) => song.Cancion === cancion);
    }

    // Singer/Vocal filtering using vocal analysis data
    console.log("DEBUG: Before singer filter, filtered.length=", filtered.length);
    console.log("DEBUG: filtered is array?", Array.isArray(filtered));
    console.log("DEBUG: requireSinger=", requireSinger, "includeSinger=", includeSinger);
    if (requireSinger) {
      // Debug: check first song lookup
      console.log("DEBUG: filtered[0] raw=", filtered[0]);
      const testSong = filtered[0];
      console.log("DEBUG: testSong object:", testSong);
      console.log("DEBUG: testSong keys:", Object.keys(testSong || {}));
      console.log("DEBUG: Test SongID:", testSong?.SongID);
      console.log("DEBUG: vocalData has key?", testSong?.SongID in vocalData);
      console.log("DEBUG: vocalData[id]=", vocalData[testSong?.SongID]);

      // Singer quiz: only songs with detected vocals
      filtered = filtered.filter((song) => {
        const vocal = vocalData[song.SongID];
        return vocal && vocal.hasSinger === true;
      });
      console.log("DEBUG: After requireSinger filter:", filtered.length);
    } else if (!includeSinger) {
      // Orchestra quiz default: exclude songs with singers (instrumental only)
      filtered = filtered.filter((song) => {
        const vocal = vocalData[song.SongID];
        // Include if no vocal data (not yet analyzed) or no singer detected
        return !vocal || vocal.hasSinger !== true;
      });
      console.log("DEBUG: After excludeSinger filter:", filtered.length);
    }

    // Filter by specific singer names (handle both string and {label, value} objects)
    if (singers.length > 0) {
      const singersLower = singers.map((s) => {
        const name = typeof s === "string" ? s : s?.value;
        return name?.toLowerCase() || "";
      });
      console.log("DEBUG: Filtering for singers:", singersLower);
      filtered = filtered.filter((song) => {
        const songSinger = song.Singer?.trim().toLowerCase();
        return songSinger && singersLower.includes(songSinger);
      });
      console.log("DEBUG: After singers filter:", filtered.length);
    }

    // Duet filter: 'all' (no filter), 'solo' (exclude duets), 'duetsOnly' (only duets)
    if (duetFilter === 'solo') {
      filtered = filtered.filter((song) => {
        const singerLower = song.Singer?.trim().toLowerCase();
        return !singerLower || !singerDuetMap[singerLower];
      });
      console.log("DEBUG: After duetFilter=solo:", filtered.length);
    } else if (duetFilter === 'duetsOnly') {
      filtered = filtered.filter((song) => {
        const singerLower = song.Singer?.trim().toLowerCase();
        return singerLower && singerDuetMap[singerLower];
      });
      console.log("DEBUG: After duetFilter=duetsOnly:", filtered.length);
    }

    // Enrich songs with vocal data for playback and rewrite AudioUrl to use proxy
    filtered = filtered.map((song) => {
      const vocal = vocalData[song.SongID];
      // Rewrite Azure URL to local proxy to avoid CORS
      const proxyAudioUrl = song.SongID ? `/api/audio/${song.SongID}` : song.AudioUrl;

      return {
        ...song,
        AudioUrl: proxyAudioUrl,
        hasSinger: vocal?.hasSinger,
        vocalSegments: vocal?.vocalSegments || [],
        vocalPercentage: vocal?.vocalPercentage,
      };
    });

    const finalSongs = getRandomSongs(filtered, qty);
    const finalQty = finalSongs.length;
    console.log("Filtered songs:", finalSongs);
    console.log("Filtered songs count:", finalQty);

    console.log("from Filter Criteria", {
      artistMasters: validArtistMasters,
      artistLevels: validArtistLevels,
      recognitionTiers: validRecognitionTiers,
      composers: validComposers,
      styles: validStyles,
      candombe: candombe || "not applied",
      alternative: alternative || "not applied",
      cancion: cancion || "not applied",
      requestedQty: qty,
      finalQty,
      // Debug singer filtering
      singersFilter: singers,
      requireSinger: requireSinger,
      includeSinger: includeSinger,
    });

    return { songs: finalSongs, qty: finalQty };
  } catch (error) {
    console.error("Error in fetchFilteredSongs:", error);
    return { songs: [], qty: 0 };
  }
}

/**
 * Returns a randomly selected subset of the input array of songs.
 * Uses weighted selection if songs have Weight field (prioritizes high play counts + star ratings).
 */
export function getRandomSongs(songs, qty = 10) {
  if (!Array.isArray(songs) || songs.length === 0) return [];

  // Check if songs have weights
  const hasWeights = songs.some(s => typeof s.Weight === 'number');

  if (hasWeights) {
    return getWeightedRandomSongs(songs, qty);
  }

  // Fallback to plain shuffle
  const shuffled = shuffleArray(songs);
  return shuffled.slice(0, Math.min(qty, songs.length));
}

/**
 * Weighted random selection - songs with higher Weight are more likely to be picked.
 * Weight is based on star rating + play count.
 */
export function getWeightedRandomSongs(songs, qty = 10) {
  if (!Array.isArray(songs) || songs.length === 0) return [];

  const selected = [];
  const remaining = [...songs];
  const targetQty = Math.min(qty, songs.length);

  while (selected.length < targetQty && remaining.length > 0) {
    // Calculate total weight
    const totalWeight = remaining.reduce((sum, s) => sum + (s.Weight || 1), 0);

    // Pick random point in weight space
    let randomPoint = Math.random() * totalWeight;

    // Find the song at that point
    let idx = 0;
    for (let i = 0; i < remaining.length; i++) {
      randomPoint -= (remaining[i].Weight || 1);
      if (randomPoint <= 0) {
        idx = i;
        break;
      }
    }

    // Move selected song from remaining to selected
    selected.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return selected;
}

/**
 * Shuffle an array using Fisher-Yates algorithm.
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Rebuild getDistractors to fetch the full artist list
 * and then use config (levels + selected artists).
 *
 * @param {string} correctArtist
 * @param {object} config        - e.g. { levels: [1,2], artists: ["Juan D'Arienzo"] }
 * @param {number} numDistractors
 * @returns {Promise<string[]>}  - array of distractor names
 */
export async function getDistractors(
  correctArtist,
  config,
  numDistractors = 3,
) {
  // 1) Fetch all artists from ArtistMaster
  const allArtists = await fetchAllArtists(); // from dataFetching.js

  if (!correctArtist || !Array.isArray(allArtists)) {
    console.warn("Invalid inputs for getDistractors:", {
      correctArtist,
      config,
      allArtists,
    });
    return [];
  }

  // 2) Build a map of { artistNameLower: numericLevel }
  const artistLevelMap = {};
  allArtists.forEach((a) => {
    const nameLower = a.artist?.trim().toLowerCase();
    const numericLevel = parseInt(a.level, 10);
    if (nameLower && !isNaN(numericLevel) && a.active === "true") {
      artistLevelMap[nameLower] = numericLevel;
    }
  });

  // 3) Gather the final set of levels (from config.levels + config.artists)
  const finalLevels = new Set();
  // Add explicit levels from config
  (config.levels || []).forEach((lvl) => {
    finalLevels.add(Number(lvl));
  });
  // Add levels from any selected artist (handle both string and {label, value} objects)
  (config.artists || []).forEach((artist) => {
    const artistName = typeof artist === "string" ? artist : artist?.value;
    if (!artistName) return;
    const lower = artistName.trim().toLowerCase();
    const lvl = artistLevelMap[lower];
    if (lvl) finalLevels.add(lvl);
  });

  // 4) Now build the candidate pool
  //    - Only artists who are active
  //    - Whose level is in finalLevels
  //    OR are in config.artists explicitly (some might not have level set)
  const configArtistNames = (config.artists || []).map((a) => {
    const name = typeof a === "string" ? a : a?.value;
    return name?.trim().toLowerCase() || "";
  });

  const candidatePool = allArtists.filter((a) => {
    const nameLower = a.artist?.trim().toLowerCase();
    const numericLevel = parseInt(a.level, 10);

    const isInLevel = finalLevels.has(numericLevel);
    const isInArtist = configArtistNames.includes(nameLower);

    return a.active === "true" && (isInLevel || isInArtist);
  });

  // 5) Exclude the correct artist
  const correctLower = correctArtist.trim().toLowerCase();
  const filtered = candidatePool.filter(
    (a) => a.artist.trim().toLowerCase() !== correctLower,
  );

  // 6) Shuffle + slice
  shuffleArray(filtered);
  const finalList = filtered.slice(0, numDistractors).map((a) => a.artist);

  console.log(`getDistractors => returning:`, finalList);
  return finalList;
}

/**
 * Get distractors by referencing config-selected artists & levels.
 * Steps:
 *   1) For each artist in config.artists => record its level.
 *   2) Merge that level set with config.levels.
 *   3) Collect all artists in those final levels.
 *   4) Exclude the correct artist.
 *   5) Shuffle & slice the desired distractor count (default=3).
 *
 * @param {string}         correctArtist - The correct artist's name
 * @param {Array}          allArtists    - Array of all artists from ArtistMaster
 * @param {Object}         config        - Contains { artists:[], levels:[] }
 * @param {number}         numDistractors - How many distractors to return (default=3)
 * @returns {string[]}     array of distractor artist names
 */
export function getDistractorsByConfig(
  correctArtist,
  allArtists,
  config,
  numDistractors = 3,
) {
  console.log(
    "getDistractorsByConfig Start => correctArtist:",
    correctArtist,
    "config:",
    config,
    "numDistractors:",
    numDistractors,
  );

  if (!correctArtist || !Array.isArray(allArtists)) {
    console.warn("Invalid inputs for getDistractorsByConfig:", {
      correctArtist,
      allArtists,
      config,
    });
    return [];
  }

  // 1) Build a quick map: { artistNameLower: numericLevel }
  const artistLevelMap = {};
  allArtists.forEach((a) => {
    const nameLower = a.artist?.toLowerCase();
    const numericLevel = parseInt(a.level, 10);
    console.log(
      `Artist: "${a.artist}", raw level: "${a.level}" => numericLevel =`,
      numericLevel,
    );

    if (nameLower && !isNaN(numericLevel)) {
      artistLevelMap[nameLower] = numericLevel;
    }
  });

  // 2) Collect levels from config.artists (handle both string and {label, value} objects)
  const selectedArtistLevels = new Set();
  (config.artists || []).forEach((artist) => {
    const artistName = typeof artist === "string" ? artist : artist?.value;
    if (!artistName) return;
    const lower = artistName.trim().toLowerCase();
    const lvl = artistLevelMap[lower];
    if (lvl) {
      selectedArtistLevels.add(lvl);
    }
    console.log("selectedArtistLevels => added:", lvl, selectedArtistLevels);
  });

  // 3) Merge with config.levels
  (config.levels || []).forEach((lvl) => {
    selectedArtistLevels.add(Number(lvl));
  });

  console.log("Final selectedArtistLevels:", [...selectedArtistLevels]);

  // 4) Gather all artists in the final set of levels
  const candidateArtists = allArtists
    .filter((a) => {
      const lvl = parseInt(a.level, 10);
      return selectedArtistLevels.has(lvl);
    })
    .map((a) => a.artist);

  console.log("candidateArtists:", candidateArtists);

  // 5) Exclude the correctArtist
  const correctLower = correctArtist.trim().toLowerCase();
  const filtered = candidateArtists.filter(
    (name) => name.trim().toLowerCase() !== correctLower,
  );

  // 6) Shuffle & pick up to numDistractors
  shuffleArray(filtered);
  console.log(`Final distractors (before slicing): ${filtered}`);
  return filtered.slice(0, numDistractors);
}
