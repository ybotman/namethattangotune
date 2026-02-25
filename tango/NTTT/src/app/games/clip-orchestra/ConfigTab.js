"use client";

import React, { useState, useEffect } from "react";
import { Box, FormControlLabel, Switch, Typography, Slider } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import useClipQuiz from "@/hooks/useClipQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    artistOptions,
    validationMessage,
    handleNumSongsChange,
    handleClipLengthChange,
    handleLevelsChange,
    handleStylesChange,
    handleArtistsChange,
    handleIncludeSingerChange,
  } = useClipQuiz();

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
          <Typography variant="body2" sx={{ color: "var(--foreground)", mb: 1 }}>
            Clip Length: {config.clipLength ?? 5} seconds
          </Typography>
          <Slider
            value={config.clipLength ?? 5}
            onChange={(_, val) => handleClipLengthChange(val)}
            min={1}
            max={7}
            step={1}
            marks={[
              { value: 1, label: "1s" },
              { value: 3, label: "3s" },
              { value: 5, label: "5s" },
              { value: 7, label: "7s" },
            ]}
            sx={{ color: "var(--accent)" }}
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
        <Box sx={{ flex: 1 }}>
          <StylesSelector
            label="Styles:"
            availableStyles={primaryStyles}
            selectedStyles={config.styles || {}}
            onChange={handleStylesChange}
          />
          <ArtistsSelector
            label="Select Orchestras (Optional)"
            availableArtists={artistOptions}
            selectedArtists={config.artists || []}
            onChange={handleArtistsChange}
          />
        </Box>
      </Box>

      {/* Info about scoring */}
      <Box sx={{ mb: 2, p: 2, backgroundColor: "var(--input-bg)", borderRadius: 1 }}>
        <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
          No time limit! Listen to the clip as many times as you need.
          Score decreases with each replay.
        </Typography>
      </Box>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="orchestra"
        onCountChange={setAvailableCount}
      />

      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>
          {validationMessage || `Not enough songs available (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
