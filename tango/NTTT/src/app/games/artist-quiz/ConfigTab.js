"use client";

import React, { useState, useEffect } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import useArtistQuiz from "@/hooks/useArtistQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    artistOptions,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleLevelsChange,
    handleStylesChange,
    handleArtistsChange,
    handleIncludeSingerChange,
  } = useArtistQuiz();

  // B) Access & update final config from GameContext
  const { config, updateConfig } = useGameContext();

  // Local state to track whether the config is valid
  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    // Invalid if validation message OR not enough songs
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
            label="Changes Score: Seconds"
            min={3}
            max={29}
            step={1}
            value={config.timeLimit ?? 15}
            onChange={handleTimeLimitChange}
          />
        </Box>
      </Box>

      {/* Singer Toggle */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.includeSinger ?? false}
              onChange={(e) => handleIncludeSingerChange(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
              Include songs with singer
            </Typography>
          }
        />
      </Box>

      {/* Main Grid */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        {/* First Column: Recognition Tier & Periods */}
        <Box sx={{ flex: 1 }}>
          <RecognitionSelector
            label="Recognition Tier:"
            selectedTiers={config.recognitionTiers || [1]}
            onChange={(tiers) => handleLevelsChange(tiers)}
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
            label="Select Artists (Optional)"
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
        gameType="orchestra"
        onCountChange={setAvailableCount}
      />

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>
          {validationMessage || `Not enough songs available (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
