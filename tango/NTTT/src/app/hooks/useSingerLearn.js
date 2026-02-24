"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGameContext } from "@/contexts/GameContext";

/**
 * Simple iOS user-agent check
 */
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function useSingerLearn() {
  // Access config from GameContext
  const { config, updateConfig } = useGameContext();

  // -- local states
  const [allSingers, setAllSingers] = useState([]); // Raw singer data with isDuetPlus
  const [singerOptions, setSingerOptions] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedSingers, setSelectedSingers] = useState(
    // Convert string array to object array if needed
    (config.singers || []).map((s) => (typeof s === "string" ? { label: s, value: s } : s))
  );
  const [validationMessage, setValidationMessage] = useState("");
  const [primaryStyles, setPrimaryStyles] = useState([]);
  const hasFetchedDataRef = useRef(false);

  // iOS detection
  const onIOS = isIOS();
  const [autoNext, setAutoNext] = useState(!onIOS);

  // ---------------------------------------------
  // Validate config
  // ---------------------------------------------
  const validateInputs = useCallback(
    (theConfig) => {
      const c = theConfig || config;
      const numSongs = c.numSongs ?? 10;
      if (numSongs < 3 || numSongs > 25) {
        return "Number of Songs must be between 3 and 25.";
      }

      const timeLimit = c.timeLimit ?? 15;
      if (timeLimit < 3 || timeLimit > 30) {
        return "Time Limit must be between 3 and 30 seconds.";
      }

      const singersList = c.singers || [];
      const hasSingers = singersList.length > 0;
      const hasLevels = (c.levels || []).length > 0;

      if (!hasSingers && !hasLevels) {
        return "You must select at least one Singer or one Level.";
      }

      return "";
    },
    [config],
  );

  // ---------------------------------------------
  // Fetch style/singer/artist data once
  // ---------------------------------------------
  useEffect(() => {
    if (hasFetchedDataRef.current) return;
    hasFetchedDataRef.current = true;

    // Fetch Styles
    const fetchStyles = async () => {
      try {
        const styleData = await fetch(`/songData/StyleMaster.json`).then(
          (res) => res.json(),
        );
        setPrimaryStyles(styleData.primaryStyles || []);

        // If user's config.styles is empty, set default "Tango"
        if (!config.styles || Object.keys(config.styles).length === 0) {
          updateConfig("styles", { Tango: true });
        }
      } catch (err) {
        console.error("Error fetching StyleMaster.json:", err);
      }
    };

    // Fetch Singers
    const fetchSingers = async () => {
      try {
        const singerData = await fetch(`/songData/SingerMaster.json`).then(
          (res) => res.json(),
        );
        // Store raw data with isDuetPlus for filtering (no count filter - show all)
        setAllSingers(singerData);
      } catch (err) {
        console.error("Error fetching SingerMaster.json:", err);
      }
    };

    // Fetch Artists
    const fetchArtists = async () => {
      try {
        const artistData = await fetch(`/songData/ArtistMaster.json`).then(
          (res) => res.json(),
        );
        const activeArtists = artistData
          .filter((artist) => artist.active === "true")
          .sort((a, b) => {
            const levelA = parseInt(a.level, 10);
            const levelB = parseInt(b.level, 10);
            if (levelA !== levelB) return levelA - levelB;
            return a.artist.localeCompare(b.artist);
          })
          .map((artist) => ({
            label: `${artist.artist} (Level ${artist.level})`,
            value: artist.artist,
          }));
        setArtistOptions(activeArtists);
      } catch (err) {
        console.error("Error fetching ArtistMaster.json:", err);
      }
    };

    // Kick off all fetches
    fetchStyles();
    fetchSingers();
    fetchArtists();
  }, [config.styles, updateConfig]);

  // ---------------------------------------------
  // Filter singerOptions based on duetFilter
  // ---------------------------------------------
  useEffect(() => {
    if (allSingers.length === 0) return;

    const duetFilter = config.duetFilter || "solo";
    let filtered = allSingers;

    if (duetFilter === "solo") {
      // Only non-duet singers
      filtered = allSingers.filter((s) => !s.isDuetPlus);
    } else if (duetFilter === "duetsOnly") {
      // Only duet singers
      filtered = allSingers.filter((s) => s.isDuetPlus === true);
    }

    // Sort by song count descending, format as options
    const options = filtered
      .sort((a, b) => b.songCount - a.songCount)
      .map((s) => ({
        label: `${s.singer} (${s.songCount})`,
        value: s.singer,
        isDuetPlus: s.isDuetPlus,
      }));

    setSingerOptions(options);

    // Clear selected singers that no longer match the filter
    if (selectedSingers.length > 0) {
      const validValues = new Set(options.map((o) => o.value));
      const stillValid = selectedSingers.filter((s) => validValues.has(s.value));
      if (stillValid.length !== selectedSingers.length) {
        setSelectedSingers(stillValid);
        updateConfig("singers", stillValid);
      }
    }
  }, [allSingers, config.duetFilter]);

  // ---------------------------------------------
  // Revalidate config on every change
  // ---------------------------------------------
  useEffect(() => {
    const error = validateInputs(config);
    setValidationMessage(error);
  }, [config, validateInputs]);

  // ---------------------------------------------
  // Handlers
  // ---------------------------------------------
  const handleNumSongsChange = (value) => {
    updateConfig("numSongs", value);
  };

  const handleTimeLimitChange = (value) => {
    updateConfig("timeLimit", value);
  };

  const handleLevelsChange = (newLevels) => {
    // If singers are selected and we're adding levels, clear singers
    if (selectedSingers.length > 0 && newLevels.length > 0) {
      setSelectedSingers([]);
      updateConfig("singers", []);
    }
    updateConfig("levels", newLevels);
  };

  const handleStylesChange = (updatedStylesObj) => {
    updateConfig("styles", updatedStylesObj);
  };

  const handleSingersChange = (newSelected) => {
    // newSelected is now an array of {label, value} objects
    // If levels are selected and we're adding singers, clear levels
    if (newSelected.length > 0 && (config.levels || []).length > 0) {
      updateConfig("levels", []);
    }
    setSelectedSingers(newSelected);
    // Store the full objects in config for the selector
    updateConfig("singers", newSelected);
  };

  const handleArtistsChange = (newSelected) => {
    updateConfig("artists", newSelected);
  };

  // ---------------------------------------------
  // Additional placeholders
  // ---------------------------------------------
  const toggleAutoNext = (boolVal) => {
    setAutoNext(boolVal);
  };

  return {
    // State & config
    config,
    validationMessage,
    singerOptions,
    artistOptions,
    primaryStyles,
    selectedSingers,

    // Derived
    onIOS,
    autoNext,

    // Exposed handlers
    toggleAutoNext,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleLevelsChange,
    handleStylesChange,
    handleSingersChange,
    handleArtistsChange,
  };
}
