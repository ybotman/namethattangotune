//------------------------------------------------------------
// src/utils/dataFetching.js
// v4 - SWAP not STACK: primaryFilterMode toggles between level and era
// v4.1 - Add client-side data caching to avoid repeated fetches
//------------------------------------------------------------

// ============================================================
// DATA CACHE - Fetch JSON files once, reuse for subsequent calls
// ============================================================
let cachedData = null;
let cachePromise = null;

/**
 * Fetch and cache all song data files.
 * Subsequent calls return the cached data immediately.
 */
/**
 * Preload song data at app startup.
 * Call this early (e.g., in root layout) so data is ready when games load.
 */
export function preloadSongData() {
  // Fire and forget - just triggers the cache population
  getCachedData().catch(err => {
    console.warn("Preload failed, will retry on first use:", err);
  });
}

async function getCachedData() {
  // If already cached, return immediately
  if (cachedData) return cachedData;

  // If fetch is in progress, wait for it
  if (cachePromise) return cachePromise;

  // Start the fetch
  cachePromise = (async () => {
    const [djSongsData, artistData, singerData, vocalData, periodsData, iconicData] = await Promise.all([
      fetch(`/songData/djSongsWeighted.json`).then((r) => r.json()),
      fetch(`/songData/ArtistMaster.json`).then((r) => r.json()),
      fetch(`/songData/SingerMaster.json`).then((r) => r.json()),
      fetch(`/api/vocal-data`).then((r) => r.json()).catch(() => ({})),
      fetch(`/songData/TangoPeriods.json`).then((r) => r.json()).catch(() => []),
      fetch(`/songData/IconicLists.json`).then((r) => r.json()).catch(() => ({ iconicSongs: [] })),
    ]);

    // Build lookup maps once
    const iconicIds = new Set(iconicData.iconicSongs.map(s => s.songId));

    const singerDuetMap = {};
    const singerArray = singerData.singers || singerData;
    singerArray.forEach((s) => {
      if (s.singer) {
        singerDuetMap[s.singer.toLowerCase()] = s.isDuetPlus === true;
      }
    });

    const artistLevelMap = {};
    artistData.forEach((artist) => {
      if (artist.active === "true") {
        artistLevelMap[artist.artist.toLowerCase()] = parseInt(artist.level, 10);
      }
    });

    // Enrich songs with level once
    const enrichedSongs = djSongsData.songs.map((song) => {
      const artistName = song.ArtistMaster?.trim().toLowerCase();
      const songLevel = artistName && artistLevelMap[artistName] ? artistLevelMap[artistName] : null;
      return { ...song, level: songLevel };
    });

    cachedData = {
      songs: enrichedSongs,
      artistData,
      singerData,
      vocalData,
      periodsData,
      iconicIds,
      singerDuetMap,
      artistLevelMap,
    };

    return cachedData;
  })();

  return cachePromise;
}

/**
 * SUB-TIER DEFINITIONS (discrete, not continuous)
 * Within each tier/level selection, songs are divided by songFamiliarity:
 *   - Classics (A): Top 30% familiarity within pool
 *   - Standards (B): Middle 40% familiarity within pool
 *   - DeepCuts (C): Bottom 30% familiarity within pool
 */
const SUB_TIER_RANGES = {
  Classics: { min: 0.7, max: 1.0 },    // Top 30%
  Standards: { min: 0.3, max: 0.7 },   // Middle 40%
  DeepCuts: { min: 0.0, max: 0.3 },    // Bottom 30%
};

/**
 * FAMILIARITY TIER DEFINITIONS (maps to discrete tiers)
 * Based on songFamiliarity field in djSongsWeighted.json
 */
const FAMILIARITY_TIERS = {
  Iconic: { min: 0.8, max: 1.0 },      // ~664 songs
  Essential: { min: 0.6, max: 0.8 },   // ~1,328 songs
  DJ: { min: 0.4, max: 0.6 },          // ~2,125 songs
  Deep: { min: 0.0, max: 0.4 },        // ~616 songs
};

/**
 * Apply sub-tier filter to a pool of songs based on their songFamiliarity
 * relative to the pool (percentile-based within the filtered set)
 *
 * @param {Array} songs - Pool of songs to filter
 * @param {string|string[]} subTiers - 'Classics', 'Standards', 'DeepCuts' or array of them
 * @returns {Array} - Filtered songs
 */
function applySubTierFilter(songs, subTiers) {
  if (!subTiers) return songs;
  if (songs.length === 0) return songs;

  // Normalize to array
  const tierArray = Array.isArray(subTiers) ? subTiers : [subTiers];
  const validTiers = tierArray.filter(t => SUB_TIER_RANGES[t]);
  if (validTiers.length === 0) return songs;

  // Sort by songFamiliarity descending
  const sorted = [...songs].sort((a, b) => (b.songFamiliarity || 0) - (a.songFamiliarity || 0));

  // Collect songs from all selected tiers
  const result = [];
  for (const tier of validTiers) {
    const { min, max } = SUB_TIER_RANGES[tier];
    const startIdx = Math.floor(sorted.length * (1 - max)); // top = low index
    const endIdx = Math.floor(sorted.length * (1 - min));   // bottom = high index
    result.push(...sorted.slice(startIdx, endIdx));
  }

  // Remove duplicates (in case tiers overlap)
  const seen = new Set();
  return result.filter(song => {
    if (seen.has(song.SongID)) return false;
    seen.add(song.SongID);
    return true;
  });
}

/**
 * Apply familiarity tier filter based on songFamiliarity field
 *
 * @param {Array} songs - Pool of songs to filter
 * @param {string[]} familiarityTiers - Array of tier names: 'Iconic', 'Essential', 'DJ', 'Deep'
 * @returns {Array} - Filtered songs
 */
function applyFamiliarityTierFilter(songs, familiarityTiers) {
  if (!familiarityTiers || familiarityTiers.length === 0) return songs;

  return songs.filter(song => {
    const familiarity = song.songFamiliarity || 0;
    return familiarityTiers.some(tier => {
      const range = FAMILIARITY_TIERS[tier];
      if (!range) return false;
      return familiarity >= range.min && familiarity < range.max;
    });
  });
}

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
 *
 * IMPORTANT: Data Quality Notes
 * - ~1,305 songs (28%) are missing ArtistMaster (orchestra) field
 * - These came from Boris import and include golden-age songs with singers
 * - Games must explicitly request requireOrchestra:true if they need orchestra data
 * - Singer games should use requireSinger:true instead
 * - Recognition tiers apply to ALL songs regardless of metadata completeness
 *
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
 * @param {boolean} options.requireOrchestra - Require songs to have ArtistMaster (for orchestra quiz)
 * @param {string[]} options.singers - Filter by specific singer names
 * @param {number[]} options.yearRange - [startYear, endYear] to filter by recording year
 * @param {string} options.duetFilter - 'all' (default) | 'solo' | 'duetsOnly' - filter by duet status
 * @param {number[]} options.recognitionTiers - Filter by recognition tier (1-5: Iconic, Essential, Familiar, Challenging, Deep Cuts) [LEGACY]
 * @param {string[]} options.periods - Filter by period names (e.g., "Golden Age", "New Guard") - converts to year ranges
 * @param {string[]} options.familiarityTiers - NEW: Filter by familiarity tier names ('Iconic', 'Essential', 'DJ', 'Deep')
 * @param {string} options.subTier - NEW: Filter by sub-tier ('Classics', 'Standards', 'DeepCuts') - applies percentile filter within pool
 * @param {number[]} options.orchestraLevels - NEW: Filter by orchestra level (1-5) - same as artistLevels but clearer name
 * @param {number[]} options.singerLevels - NEW: Filter by singer level (1-3 from SingerMaster)
 * @param {string[]} options.singerEras - NEW: Filter by singer era ('golden', 'later')
 * @param {string} options.primaryFilterMode - NEW v4: 'level' or 'era' - SWAP not STACK
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
  const {
    includeSinger = false,
    requireSinger = false,
    requireOrchestra = false,
    singers = [],
    yearRange = null,
    duetFilter = 'solo',
    recognitionTiers = [],
    periods = [],
    // NEW v3 options
    familiarityTiers = [],
    subTier = null,
    orchestraLevels = [],
    singerLevels = [],
    singerEras = [],
    // NEW v4: SWAP not STACK
    primaryFilterMode = null, // 'level' | 'era' | null (null = legacy stacking behavior)
  } = options;

  try {
    // Use weighted songs (3-5 stars, prioritized by play count)
    const [djSongsData, artistData, singerData, vocalData, periodsData, iconicData] = await Promise.all([
      fetch(`/songData/djSongsWeighted.json`).then((r) => r.json()),
      fetch(`/songData/ArtistMaster.json`).then((r) => r.json()),
      fetch(`/songData/SingerMaster.json`).then((r) => r.json()),
      fetch(`/api/vocal-data`).then((r) => r.json()).catch(() => ({})),
      fetch(`/songData/TangoPeriods.json`).then((r) => r.json()).catch(() => []),
      fetch(`/songData/IconicLists.json`).then((r) => r.json()).catch(() => ({ iconicSongs: [] })),
    ]);

    // Build iconic song ID set for Tier 1 bypass (note: IconicLists uses 'songId', djSongs uses 'SongID')
    const iconicIds = new Set(iconicData.iconicSongs.map(s => s.songId));

    // Build singer duet lookup map: { singerNameLower: isDuetPlus }
    // SingerMaster.json v1 has { singers: [...] } structure
    const singerDuetMap = {};
    const singerArray = singerData.singers || singerData; // Handle both old and new format
    singerArray.forEach((s) => {
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

    // DNP filter - exclude doNotPlay songs from gameplay
    filtered = filtered.filter((song) => !song.doNotPlay);

    // RequireOrchestra filter - only for orchestra-based games (orchestra-quiz, orchestra-learn, clip-orchestra)
    // ~1,305 songs are missing ArtistMaster but may have Singer data for singer games
    if (requireOrchestra) {
      filtered = filtered.filter(
        (song) => song.ArtistMaster && song.ArtistMaster.trim() !== ""
      );
    }

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
    // SWAP not STACK: Skip level filters when primaryFilterMode === 'era'
    const shouldApplyLevels = primaryFilterMode !== 'era';
    const validArtistLevels = artistLevels.filter((l) => typeof l === "number");
    if (shouldApplyLevels && validArtistLevels.length > 0) {
      filtered = filtered.filter(
        (song) => song.level && validArtistLevels.includes(song.level),
      );
    }

    // Recognition Tier filter (LEGACY - song-based tiers from djSongsWeighted.json)
    // SWAP not STACK: Skip when primaryFilterMode === 'era'
    const validRecognitionTiers = recognitionTiers.filter((t) => typeof t === "number");
    if (shouldApplyLevels && validRecognitionTiers.length > 0) {
      if (validRecognitionTiers.length === 1 && validRecognitionTiers[0] === 1) {
        // Iconic mode — use curated list, bypass algorithmic tiers
        filtered = filtered.filter((song) => iconicIds.has(song.SongID));
      } else {
        // All other modes — existing tier filter unchanged
        filtered = filtered.filter(
          (song) => song.recognitionTier && validRecognitionTiers.includes(song.recognitionTier),
        );
      }
    }

    // NEW v3: Orchestra Level filter (clearer name than artistLevels)
    // SWAP not STACK: Skip when primaryFilterMode === 'era'
    const validOrchestraLevels = orchestraLevels.filter((l) => typeof l === "number");
    if (shouldApplyLevels && validOrchestraLevels.length > 0) {
      filtered = filtered.filter(
        (song) => song.orchestraLevel && validOrchestraLevels.includes(song.orchestraLevel),
      );
    }

    // NEW v3: Singer Level filter
    const validSingerLevels = singerLevels.filter((l) => typeof l === "number");
    if (validSingerLevels.length > 0) {
      filtered = filtered.filter(
        (song) => song.singerLevel && validSingerLevels.includes(song.singerLevel),
      );
    }

    // NEW v3: Singer Era filter
    const validSingerEras = singerEras.filter((e) => e && e.trim() !== "");
    if (validSingerEras.length > 0) {
      const erasLower = validSingerEras.map((e) => e.toLowerCase());
      filtered = filtered.filter(
        (song) => song.singerEra && erasLower.includes(song.singerEra.toLowerCase()),
      );
    }

    // NEW v3: Familiarity Tier filter (Iconic/Essential/DJ/Deep)
    // SWAP not STACK: Skip when primaryFilterMode === 'era'
    if (shouldApplyLevels && familiarityTiers.length > 0) {
      filtered = applyFamiliarityTierFilter(filtered, familiarityTiers);
    }

    // NEW v3: Sub-Tier filter (Classics/Standards/DeepCuts) - applied AFTER other filters
    // This filters by percentile within the current pool
    // SWAP not STACK: Skip when primaryFilterMode === 'era'
    if (shouldApplyLevels && subTier) {
      filtered = applySubTierFilter(filtered, subTier);
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
    }

    // Period filter - converts period names to year ranges
    // SWAP not STACK: Skip periods when primaryFilterMode === 'level'
    const shouldApplyPeriods = primaryFilterMode !== 'level';
    if (shouldApplyPeriods && periods && periods.length > 0) {
      // Build list of year ranges from selected periods
      const periodRanges = periods
        .map((periodName) => periodsData.find((p) => p.period === periodName))
        .filter((p) => p != null)
        .map((p) => ({ start: p.start_year, end: p.end_year }));

      if (periodRanges.length > 0) {
        filtered = filtered.filter((song) => {
          const year = parseInt(song.Year, 10);
          if (isNaN(year)) return false;
          // Song matches if its year falls within ANY selected period
          return periodRanges.some((range) => year >= range.start && year <= range.end);
        });
      }
    }

    // Style filter
    const validStyles = styles.filter((s) => s && s.trim() !== "");
    if (validStyles.length > 0) {
      const stylesLower = validStyles.map((s) => s.toLowerCase());
      filtered = filtered.filter(
        (song) =>
          song.Style && stylesLower.includes(song.Style.trim().toLowerCase()),
      );
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
    if (requireSinger) {
      // Debug: check first song lookup
      const testSong = filtered[0];

      // Singer quiz: only songs with detected vocals
      filtered = filtered.filter((song) => {
        const vocal = vocalData[song.SongID];
        return vocal && vocal.hasSinger === true;
      });
    } else if (!includeSinger) {
      // Orchestra quiz default: exclude songs with singers (instrumental only)
      filtered = filtered.filter((song) => {
        const vocal = vocalData[song.SongID];
        // Include if no vocal data (not yet analyzed) or no singer detected
        return !vocal || vocal.hasSinger !== true;
      });
    }

    // Filter by specific singer names (handle both string and {label, value} objects)
    if (singers.length > 0) {
      const singersLower = singers.map((s) => {
        const name = typeof s === "string" ? s : s?.value;
        return name?.toLowerCase() || "";
      });
      filtered = filtered.filter((song) => {
        const songSinger = song.Singer?.trim().toLowerCase();
        return songSinger && singersLower.includes(songSinger);
      });
    }

    // Duet filter: 'all' (no filter), 'solo' (exclude duets), 'duetsOnly' (only duets)
    if (duetFilter === 'solo') {
      filtered = filtered.filter((song) => {
        const singerLower = song.Singer?.trim().toLowerCase();
        return !singerLower || !singerDuetMap[singerLower];
      });
    } else if (duetFilter === 'duetsOnly') {
      filtered = filtered.filter((song) => {
        const singerLower = song.Singer?.trim().toLowerCase();
        return singerLower && singerDuetMap[singerLower];
      });
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

    // Track total available before random selection
    const availableCount = filtered.length;

    const finalSongs = getRandomSongs(filtered, qty);
    const finalQty = finalSongs.length;

    return { songs: finalSongs, qty: finalQty, availableCount };
  } catch (error) {
    console.error("Error in fetchFilteredSongs:", error);
    return { songs: [], qty: 0, availableCount: 0 };
  }
}

/**
 * Lightweight function to count available songs based on filters.
 * Use this for live UI updates without fetching full song data.
 * Uses cached data to avoid repeated network requests.
 */
export async function getFilteredSongCount(options = {}) {
  const {
    artists = [],
    styles = [],
    recognitionTiers = [],
    periods = [],
    includeSinger = false,
    requireSinger = false,
    requireOrchestra = false,
    singers = [],
    yearRange = null,
    duetFilter = 'solo',
    // NEW v3 options
    familiarityTiers = [],
    subTier = null,       // Legacy single subTier
    subTiers = [],        // Array of subTiers for multi-cell grid
    orchestraLevels = [],
    singerLevels = [],
    singerEras = [],
    // NEW v4: SWAP not STACK
    primaryFilterMode = null, // 'level' | 'era' | null
  } = options;

  // SWAP not STACK: Determine which filters to apply
  const shouldApplyLevels = primaryFilterMode !== 'era';
  const shouldApplyPeriods = primaryFilterMode !== 'level';

  try {
    // Use cached data instead of fetching every time
    const data = await getCachedData();
    const { songs: enrichedSongs, periodsData, iconicIds, singerDuetMap } = data;

    let filtered = [...enrichedSongs];

    // DNP filter - exclude doNotPlay songs
    filtered = filtered.filter((song) => !song.doNotPlay);

    // Apply filters (same logic as fetchFilteredSongs)
    if (requireOrchestra) {
      filtered = filtered.filter((song) => song.ArtistMaster && song.ArtistMaster.trim() !== "");
    }

    // Artist filter
    const validArtists = artists.filter((a) => a && a.trim() !== "");
    if (validArtists.length > 0) {
      const artistsLower = validArtists.map((a) => a.toLowerCase());
      filtered = filtered.filter((song) =>
        song.ArtistMaster && artistsLower.includes(song.ArtistMaster.trim().toLowerCase())
      );
    }

    // Recognition Tier filter (LEGACY)
    // SWAP not STACK: Skip when mode === 'era'
    const validTiers = recognitionTiers.filter((t) => typeof t === "number");
    if (shouldApplyLevels && validTiers.length > 0) {
      if (validTiers.length === 1 && validTiers[0] === 1) {
        // Iconic mode — use curated list, bypass algorithmic tiers
        filtered = filtered.filter((song) => iconicIds.has(song.SongID));
      } else {
        filtered = filtered.filter((song) =>
          song.recognitionTier && validTiers.includes(song.recognitionTier)
        );
      }
    }

    // NEW v3: Orchestra Level filter
    // SWAP not STACK: Skip when mode === 'era'
    const validOrchestraLevels = orchestraLevels.filter((l) => typeof l === "number");
    if (shouldApplyLevels && validOrchestraLevels.length > 0) {
      filtered = filtered.filter(
        (song) => song.orchestraLevel && validOrchestraLevels.includes(song.orchestraLevel),
      );
    }

    // NEW v3: Singer Level filter
    // SWAP not STACK: Skip when mode === 'era'
    const validSingerLevels = singerLevels.filter((l) => typeof l === "number");
    if (shouldApplyLevels && validSingerLevels.length > 0) {
      filtered = filtered.filter(
        (song) => song.singerLevel && validSingerLevels.includes(song.singerLevel),
      );
    }

    // NEW v3: Singer Era filter
    const validSingerEras = singerEras.filter((e) => e && e.trim() !== "");
    if (validSingerEras.length > 0) {
      const erasLower = validSingerEras.map((e) => e.toLowerCase());
      filtered = filtered.filter(
        (song) => song.singerEra && erasLower.includes(song.singerEra.toLowerCase()),
      );
    }

    // NEW v3: Familiarity Tier filter (Iconic/Essential/DJ/Deep)
    // SWAP not STACK: Skip when mode === 'era'
    if (shouldApplyLevels && familiarityTiers.length > 0) {
      filtered = applyFamiliarityTierFilter(filtered, familiarityTiers);
    }

    // NEW v3: Sub-Tier filter (Classics/Standards/DeepCuts)
    // SWAP not STACK: Skip when mode === 'era'
    // Support both legacy single subTier and new subTiers array
    const effectiveSubTiers = subTiers.length > 0 ? subTiers : (subTier ? [subTier] : []);
    if (shouldApplyLevels && effectiveSubTiers.length > 0) {
      filtered = applySubTierFilter(filtered, effectiveSubTiers);
    }

    // Year range filter
    if (yearRange && Array.isArray(yearRange) && yearRange.length === 2) {
      const [startYear, endYear] = yearRange;
      filtered = filtered.filter((song) => {
        const year = parseInt(song.Year, 10);
        return !isNaN(year) && year >= startYear && year <= endYear;
      });
    }

    // Period filter
    // SWAP not STACK: Skip when mode === 'level'
    if (shouldApplyPeriods && periods && periods.length > 0) {
      const periodRanges = periods
        .map((periodName) => periodsData.find((p) => p.period === periodName))
        .filter((p) => p != null)
        .map((p) => ({ start: p.start_year, end: p.end_year }));

      if (periodRanges.length > 0) {
        filtered = filtered.filter((song) => {
          const year = parseInt(song.Year, 10);
          if (isNaN(year)) return false;
          return periodRanges.some((range) => year >= range.start && year <= range.end);
        });
      }
    }

    // Style filter
    const validStyles = styles.filter((s) => s && s.trim() !== "");
    if (validStyles.length > 0) {
      const stylesLower = validStyles.map((s) => s.toLowerCase());
      filtered = filtered.filter((song) =>
        song.Style && stylesLower.includes(song.Style.trim().toLowerCase())
      );
    }

    // Singer/instrumental filter
    if (requireSinger) {
      filtered = filtered.filter((song) => song.Singer && song.Singer.trim() !== "");
    } else if (!includeSinger) {
      filtered = filtered.filter((song) => !song.Singer || song.Singer.trim() === "");
    }

    // Specific singers filter
    if (singers.length > 0) {
      const singersLower = singers.map((s) => (typeof s === 'string' ? s : s.value).toLowerCase());
      filtered = filtered.filter((song) => {
        const songSinger = song.Singer?.trim().toLowerCase();
        return songSinger && singersLower.includes(songSinger);
      });
    }

    // Duet filter
    if (duetFilter === 'solo') {
      filtered = filtered.filter((song) => {
        const singerLower = song.Singer?.trim().toLowerCase();
        return !singerLower || !singerDuetMap[singerLower];
      });
    } else if (duetFilter === 'duetsOnly') {
      filtered = filtered.filter((song) => {
        const singerLower = song.Singer?.trim().toLowerCase();
        return singerLower && singerDuetMap[singerLower];
      });
    }

    return filtered.length;
  } catch (error) {
    console.error("Error in getFilteredSongCount:", error);
    return 0;
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

  // 3) Gather the final set of orchestra levels for distractors
  const finalLevels = new Set();

  // NEW v3: Map familiarityTiers to orchestra levels
  // Iconic = Level 1 only (Big 4), Essential = Level 1-2, DJ = Level 1-3, Deep = Level 1-4
  const familiarityTiers = config.familiarityTiers || [];
  if (familiarityTiers.length > 0) {
    const tierToMaxLevel = {
      'Iconic': 1,      // Big 4 only
      'Essential': 2,   // + Biagi, Fresedo, Tanturi, etc.
      'DJ': 3,          // + deeper orchestras
      'Deep': 4,        // + specialist orchestras
    };
    // Find the highest level needed based on selected tiers
    let maxLevel = 1;
    familiarityTiers.forEach(tier => {
      const lvl = tierToMaxLevel[tier] || 1;
      if (lvl > maxLevel) maxLevel = lvl;
    });
    // Add all levels up to maxLevel
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      finalLevels.add(lvl);
    }
  }

  // LEGACY: Map recognitionTiers (1-5) to orchestra levels
  const recognitionTiers = config.recognitionTiers || [];
  if (recognitionTiers.length > 0 && familiarityTiers.length === 0) {
    const maxTier = Math.max(...recognitionTiers);
    // Include orchestra levels up to the max tier selected
    for (let lvl = 1; lvl <= Math.min(maxTier + 1, 5); lvl++) {
      finalLevels.add(lvl);
    }
  }

  // Also support legacy config.levels if present
  (config.levels || []).forEach((lvl) => {
    finalLevels.add(Number(lvl));
  });

  // NEW v3: Support orchestraLevels directly
  (config.orchestraLevels || []).forEach((lvl) => {
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
  //    - If no filters specified, include ALL active artists
  //    - Otherwise filter by level or explicit artist selection
  const configArtistNames = (config.artists || []).map((a) => {
    const name = typeof a === "string" ? a : a?.value;
    return name?.trim().toLowerCase() || "";
  });

  // If no filters specified, use all active artists
  const noFiltersSpecified = finalLevels.size === 0 && configArtistNames.length === 0;

  const candidatePool = allArtists.filter((a) => {
    if (a.active !== "true") return false;

    // If no filters, include all active artists
    if (noFiltersSpecified) return true;

    const nameLower = a.artist?.trim().toLowerCase();
    const numericLevel = parseInt(a.level, 10);

    const isInLevel = finalLevels.has(numericLevel);
    const isInArtist = configArtistNames.includes(nameLower);

    return isInLevel || isInArtist;
  });

  // 5) Exclude the correct artist
  const correctLower = correctArtist.trim().toLowerCase();
  const filtered = candidatePool.filter(
    (a) => a.artist.trim().toLowerCase() !== correctLower,
  );

  // 6) Shuffle + slice
  const shuffled = shuffleArray(filtered);
  const finalList = shuffled.slice(0, numDistractors).map((a) => a.artist);

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
/**
 * Fetch songs grouped by title for the Same Song Comparison game.
 * Returns an array of { title, count, songs } sorted by count descending.
 * Only includes titles with 2+ recordings.
 *
 * @param {Object} options - Filter options
 * @param {number[]} options.recognitionTiers - Filter by recognition tiers
 * @param {string[]} options.periods - Filter by period names
 * @param {number} options.minRecordings - Minimum recordings required (default 2)
 * @returns {Promise<Array>} - Array of { title, count, songs }
 */
export async function fetchSongsGroupedByTitle(options = {}) {
  const { recognitionTiers = [], periods = [], minRecordings = 2 } = options;

  try {
    const [djSongsData, periodsData, vocalData] = await Promise.all([
      fetch(`/songData/djSongsWeighted.json`).then((r) => r.json()),
      fetch(`/songData/TangoPeriods.json`).then((r) => r.json()).catch(() => []),
      fetch(`/api/vocal-data`).then((r) => r.json()).catch(() => ({})),
    ]);

    let filtered = djSongsData.songs;

    // Recognition Tier filter
    const validTiers = recognitionTiers.filter((t) => typeof t === "number");
    if (validTiers.length > 0) {
      filtered = filtered.filter((song) =>
        song.recognitionTier && validTiers.includes(song.recognitionTier)
      );
    }

    // Period filter
    if (periods && periods.length > 0) {
      const periodRanges = periods
        .map((periodName) => periodsData.find((p) => p.period === periodName))
        .filter((p) => p != null)
        .map((p) => ({ start: p.start_year, end: p.end_year }));

      if (periodRanges.length > 0) {
        filtered = filtered.filter((song) => {
          const year = parseInt(song.Year, 10);
          if (isNaN(year)) return false;
          return periodRanges.some((range) => year >= range.start && year <= range.end);
        });
      }
    }

    // Enrich with vocal data and proxy URL
    filtered = filtered.map((song) => {
      const vocal = vocalData[song.SongID];
      const proxyAudioUrl = song.SongID ? `/api/audio/${song.SongID}` : song.AudioUrl;
      return {
        ...song,
        AudioUrl: proxyAudioUrl,
        hasSinger: vocal?.hasSinger,
        vocalSegments: vocal?.vocalSegments || [],
      };
    });

    // Group by title (case-insensitive)
    const titleMap = {};
    filtered.forEach((song) => {
      const title = song.Title?.trim();
      if (!title) return;
      const titleLower = title.toLowerCase();
      if (!titleMap[titleLower]) {
        titleMap[titleLower] = { title, songs: [] };
      }
      titleMap[titleLower].songs.push(song);
    });

    // Convert to array, filter by minRecordings, sort by count
    const grouped = Object.values(titleMap)
      .filter((g) => g.songs.length >= minRecordings)
      .map((g) => ({
        title: g.title,
        count: g.songs.length,
        songs: g.songs.sort((a, b) => {
          // Sort by year, then by orchestra
          const yearA = parseInt(a.Year, 10) || 0;
          const yearB = parseInt(b.Year, 10) || 0;
          if (yearA !== yearB) return yearA - yearB;
          return (a.ArtistMaster || "").localeCompare(b.ArtistMaster || "");
        }),
      }))
      .sort((a, b) => b.count - a.count);

    return grouped;
  } catch (error) {
    console.error("Error in fetchSongsGroupedByTitle:", error);
    return [];
  }
}

/**
 * Get title distractors for the Song Title Quiz.
 * Returns song titles that are NOT the correct title.
 *
 * @param {string} correctTitle - The correct song title
 * @param {Object} config - Config with recognitionTiers
 * @param {number} numDistractors - Number of distractors to return
 * @returns {Promise<string[]>} - Array of distractor titles
 */
export async function getTitleDistractors(correctTitle, config, numDistractors = 3) {
  try {
    const djSongsData = await fetch(`/songData/djSongsWeighted.json`).then((r) => r.json());

    let songs = djSongsData.songs;

    // Filter by recognition tiers if specified
    const recognitionTiers = config.recognitionTiers || [];
    if (recognitionTiers.length > 0) {
      songs = songs.filter((song) =>
        song.recognitionTier && recognitionTiers.includes(song.recognitionTier)
      );
    }

    // Get unique titles (case-insensitive), excluding correct answer
    const correctLower = correctTitle?.trim().toLowerCase();
    const titleSet = new Set();
    const titles = [];

    songs.forEach((song) => {
      const title = song.Title?.trim();
      if (!title) return;
      const titleLower = title.toLowerCase();
      if (titleLower === correctLower) return;
      if (titleSet.has(titleLower)) return;
      titleSet.add(titleLower);
      titles.push(title);
    });

    // Shuffle and return
    const shuffled = shuffleArray(titles);
    return shuffled.slice(0, numDistractors);
  } catch (error) {
    console.error("Error in getTitleDistractors:", error);
    return [];
  }
}

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

  // 3) NEW v3: Map familiarityTiers to orchestra levels for distractors
  const familiarityTiers = config.familiarityTiers || [];
  if (familiarityTiers.length > 0) {
    const tierToMaxLevel = { 'Iconic': 1, 'Essential': 2, 'DJ': 3, 'Deep': 4 };
    let maxLevel = 1;
    familiarityTiers.forEach(tier => {
      const lvl = tierToMaxLevel[tier] || 1;
      if (lvl > maxLevel) maxLevel = lvl;
    });
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      selectedArtistLevels.add(lvl);
    }
  }

  // LEGACY: Merge with config.recognitionTiers (mapped to orchestra levels)
  const recognitionTiers = config.recognitionTiers || [];
  if (recognitionTiers.length > 0 && familiarityTiers.length === 0) {
    const maxTier = Math.max(...recognitionTiers);
    for (let lvl = 1; lvl <= Math.min(maxTier + 1, 5); lvl++) {
      selectedArtistLevels.add(lvl);
    }
  }

  // NEW v3: Support orchestraLevels directly
  (config.orchestraLevels || []).forEach((lvl) => {
    selectedArtistLevels.add(Number(lvl));
  });

  // Also support legacy config.levels if present
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
  const shuffled = shuffleArray(filtered);
  console.log(`Final distractors (before slicing): ${shuffled}`);
  return shuffled.slice(0, numDistractors);
}
