"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGameContext } from "@/contexts/GameContext";

/**
 * Hook for Clip Quiz - no timer, replay allowed
 */
export default function useClipQuiz() {
  const { config, updateConfig } = useGameContext();

  const [artistOptions, setArtistOptions] = useState([]);
  const [primaryStyles, setPrimaryStyles] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const hasFetchedDataRef = useRef(false);

  // Validation
  const validateInputs = useCallback(
    (c) => {
      const theConfig = c || config;
      const numSongs = theConfig.numSongs ?? 10;
      if (numSongs < 3 || numSongs > 25) {
        return "Number of Songs must be between 3 and 25.";
      }

      const clipLength = theConfig.clipLength ?? 5;
      if (clipLength < 1 || clipLength > 7) {
        return "Clip Length must be between 1 and 7 seconds.";
      }

      const stylesSelected = Object.keys(theConfig.styles || {}).filter(
        (k) => theConfig.styles[k],
      );
      if (stylesSelected.length === 0) {
        return "At least one style must be selected.";
      }

      const hasTiers = (theConfig.recognitionTiers || []).length > 0;
      const hasArtists = (theConfig.artists || []).length > 3;
      if (!hasTiers && !hasArtists) {
        return "You must select at least 4 Artists or one Recognition Tier.";
      }
      if (hasTiers && hasArtists) {
        return "Cannot select both Artists and Recognition Tiers. Clear one of them.";
      }
      return "";
    },
    [config],
  );

  // Fetch data
  useEffect(() => {
    if (hasFetchedDataRef.current) return;
    hasFetchedDataRef.current = true;

    const fetchStyles = async () => {
      try {
        const styleData = await fetch(`/songData/StyleMaster.json`).then((r) =>
          r.json(),
        );
        setPrimaryStyles(styleData.primaryStyles || []);

        if (!config.styles || Object.keys(config.styles).length === 0) {
          updateConfig("styles", { Tango: true });
        }
      } catch (err) {
        console.error("Error fetching StyleMaster:", err);
      }
    };

    const fetchArtists = async () => {
      try {
        const artistData = await fetch(`/songData/ArtistMaster.json`).then(
          (r) => r.json(),
        );
        const activeArtists = artistData
          .filter((a) => a.active === "true")
          .sort((a, b) => {
            const levelA = parseInt(a.level, 10);
            const levelB = parseInt(b.level, 10);
            if (levelA !== levelB) return levelA - levelB;
            return a.artist.localeCompare(b.artist);
          })
          .map((artist) => ({
            label: artist.artist,
            value: artist.artist,
          }));
        setArtistOptions(activeArtists);
      } catch (err) {
        console.error("Error fetching ArtistMaster:", err);
      }
    };

    // Set default clip length
    if (!config.clipLength) {
      updateConfig("clipLength", 5);
    }

    fetchStyles();
    fetchArtists();
  }, [config.styles, config.clipLength, updateConfig]);

  // Re-validate on config change
  useEffect(() => {
    const error = validateInputs(config);
    setValidationMessage(error);
  }, [config, validateInputs]);

  // Handlers
  const handleNumSongsChange = (val) => updateConfig("numSongs", val);
  const handleClipLengthChange = (val) => updateConfig("clipLength", val);

  // Legacy: recognition tiers (1-5 numbers)
  const handleLevelsChange = (newTiers) => {
    updateConfig("recognitionTiers", newTiers);
  };

  // NEW: Orchestra tiers (Big4/Classic/Deep)
  const handleOrchestraTiersChange = (tiers) => {
    updateConfig("orchestraTiers", tiers);
  };

  const handleStylesChange = (updated) => {
    updateConfig("styles", updated);
  };

  const handleArtistsChange = (arr) => {
    updateConfig("artists", arr);
  };

  const handleIncludeSingerChange = (val) => {
    updateConfig("includeSinger", val);
  };

  return {
    config,
    validationMessage,
    primaryStyles,
    artistOptions,
    handleNumSongsChange,
    handleClipLengthChange,
    handleLevelsChange,
    handleOrchestraTiersChange,
    handleStylesChange,
    handleArtistsChange,
    handleIncludeSingerChange,
  };
}
