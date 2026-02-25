"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGameContext } from "@/contexts/GameContext";

/**
 * Provide quiz-specific logic & validations for Song Title Quiz:
 *  - load styles/artists
 *  - validate config
 *  - compute scoring parameters
 */
export default function useSongQuiz() {
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

      const timeLimit = theConfig.timeLimit ?? 15;
      if (timeLimit < 3 || timeLimit > 30) {
        return "Time Limit must be between 3 and 30 seconds.";
      }

      const stylesSelected = Object.keys(theConfig.styles || {}).filter(
        (k) => theConfig.styles[k]
      );
      if (stylesSelected.length === 0) {
        return "At least one style must be selected.";
      }

      const hasTiers = (theConfig.recognitionTiers || []).length > 0;
      if (!hasTiers) {
        return "You must select at least one Recognition Tier.";
      }

      return "";
    },
    [config]
  );

  // Scoring: same polynomial as artist quiz
  const calculateMaxScore = useCallback((timeLimit) => {
    const clamped = Math.max(3, Math.min(timeLimit, 30));
    const a = 705.39;
    const b = 79.0;
    const c = 3.69;
    const d = 0.0595;
    const val = a - b * clamped + c * clamped ** 2 - d * clamped ** 3;
    return Math.round(val);
  }, []);

  const WRONG_PENALTY = 0.1;
  const INTERVAL_MS = 100;

  // One-time fetch for Styles & Artists
  useEffect(() => {
    if (hasFetchedDataRef.current) return;
    hasFetchedDataRef.current = true;

    const fetchStyles = async () => {
      try {
        const styleData = await fetch(`/songData/StyleMaster.json`).then((r) =>
          r.json()
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
          (r) => r.json()
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

    fetchStyles();
    fetchArtists();
  }, [config.styles, updateConfig]);

  // Re-validate on config change
  useEffect(() => {
    const error = validateInputs(config);
    setValidationMessage(error);
  }, [config, validateInputs]);

  // Handlers
  const handleNumSongsChange = (val) => updateConfig("numSongs", val);
  const handleTimeLimitChange = (val) => updateConfig("timeLimit", val);
  const handleStylesChange = (updated) => updateConfig("styles", updated);
  const handleArtistsChange = (arr) => updateConfig("artists", arr);

  return {
    config,
    validationMessage,
    primaryStyles,
    artistOptions,
    calculateMaxScore,
    WRONG_PENALTY,
    INTERVAL_MS,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
    handleArtistsChange,
  };
}
