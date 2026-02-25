"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import useSongQuiz from "@/hooks/useSongQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    artistOptions,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
    handleArtistsChange,
  } = useSongQuiz();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    setIsConfigValid(!validationMessage && hasEnoughSongs);
  }, [validationMessage, hasEnoughSongs]);

  return (
    <Box className={styles.configurationContainer}>
      {/* Sliders */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <SongsSlider
            label="# Songs"
            min={3}
            max={25}
            step={1}
            value={config.numSongs ?? 10}
            onChange={handleNumSongsChange}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SecondsSlider
            label="Seconds (affects score)"
            min={3}
            max={29}
            step={1}
            value={config.timeLimit ?? 15}
            onChange={handleTimeLimitChange}
          />
        </Box>
      </Box>

      {/* Main Grid */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        {/* First Column: Recognition Tier & Periods */}
        <Box sx={{ flex: 1 }}>
          <RecognitionSelector
            label="Recognition Tier:"
            selectedTiers={config.recognitionTiers || [1]}
            onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          />
          <PeriodsSelector
            label="Periods:"
            selectedPeriods={config.periods || []}
            onChange={(val) => updateConfig("periods", val)}
          />
        </Box>
        {/* Second Column: Styles & Artists */}
        <Box sx={{ flex: 1 }}>
          <StylesSelector
            label="Styles:"
            availableStyles={primaryStyles}
            selectedStyles={config.styles || {}}
            onChange={handleStylesChange}
          />
          <ArtistsSelector
            label="Filter by Artists (Optional)"
            availableArtists={artistOptions}
            selectedArtists={config.artists || []}
            onChange={handleArtistsChange}
          />
        </Box>
      </Box>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="general"
        onCountChange={setAvailableCount}
      />

      {/* Instructions */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: "var(--input-bg)", borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
          <strong>How to play:</strong> Listen to a clip and guess the song title
          from 4 choices. Higher recognition tiers = more obscure songs = harder!
        </Typography>
      </Box>

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>
          {validationMessage ||
            `Not enough songs available (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
