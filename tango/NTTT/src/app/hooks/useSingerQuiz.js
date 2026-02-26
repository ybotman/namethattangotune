"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGameContext } from "@/contexts/GameContext";

/**
 * Hook for Singer Quiz - provides quiz-specific logic & validations
 */
export default function useSingerQuiz() {
  const { config, updateConfig } = useGameContext();

  const [artistOptions, setArtistOptions] = useState([]);
  const [singerOptions, setSingerOptions] = useState([]);
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

      const hasTiers = (theConfig.recognitionTiers || []).length > 0;
      const hasArtists = (theConfig.artists || []).length > 0;
      if (!hasTiers && !hasArtists) {
        return "Select at least one Recognition Tier or Orchestra to filter songs.";
      }

      return "";
    },
    [config],
  );

  // Scoring calculation
  const calculateMaxScore = useCallback((timeLimit) => {
    const clamped = Math.max(3, Math.min(timeLimit, 30));
    const a = 705.39;
    const b = 79.0;
    const c = 3.69;
    const d = 0.0595;
    const val = a - b * clamped + c * clamped ** 2 - d * clamped ** 3;
    return Math.round(val);
  }, []);

  // Interval => 100ms for score/time updates
  const INTERVAL_MS = 100;

  // Fetch artists and singers
  useEffect(() => {
    if (hasFetchedDataRef.current) return;
    hasFetchedDataRef.current = true;

    // Fetch artists (orchestras)
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

    // Fetch unique singers from songs
    const fetchSingers = async () => {
      try {
        const songsData = await fetch(`/songData/djSongs.json`).then((r) =>
          r.json(),
        );
        const uniqueSingers = [
          ...new Set(
            songsData.songs
              .map((s) => s.Singer)
              .filter((s) => s && s.trim() !== ""),
          ),
        ].sort();

        setSingerOptions(
          uniqueSingers.map((singer) => ({
            label: singer,
            value: singer,
          })),
        );
      } catch (err) {
        console.error("Error fetching singers:", err);
      }
    };

    // Set default recognition tiers if not set
    if (!config.recognitionTiers || config.recognitionTiers.length === 0) {
      updateConfig("recognitionTiers", [1, 2, 3]);
    }

    fetchArtists();
    fetchSingers();
  }, [config.recognitionTiers, updateConfig]);

  // Re-validate on config change
  useEffect(() => {
    const error = validateInputs(config);
    setValidationMessage(error);
  }, [config, validateInputs]);

  // Config handlers
  const handleNumSongsChange = (val) => updateConfig("numSongs", val);
  const handleTimeLimitChange = (val) => updateConfig("timeLimit", val);

  // Now handles recognition tiers instead of levels
  const handleLevelsChange = (newTiers) => {
    updateConfig("recognitionTiers", newTiers);
  };

  const handleArtistsChange = (arr) => {
    updateConfig("artists", arr);
  };

  const handleSingersChange = (arr) => {
    updateConfig("singers", arr);
  };

  return {
    config,
    validationMessage,
    artistOptions,
    singerOptions,
    calculateMaxScore,
    INTERVAL_MS,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleLevelsChange,
    handleArtistsChange,
    handleSingersChange,
  };
}
