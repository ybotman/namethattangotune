"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ContiguousPeriodSelector from "@/components/ui/ContiguousPeriodSelector";
import { useGameContext } from "@/contexts/GameContext";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

const DEFAULT_PERIODS = ["New Guard", "Golden Age"];

export default function ConfigTab() {
  const { config, updateConfig } = useGameContext();
  const [availableCount, setAvailableCount] = useState(null);
  const [isConfigValid, setIsConfigValid] = useState(true);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    if (!config.periods || config.periods.length === 0) {
      updateConfig("periods", DEFAULT_PERIODS);
    }
  }, []);

  useEffect(() => {
    setIsConfigValid(hasEnoughSongs);
  }, [hasEnoughSongs]);

  const handleYearRangeChange = (range) => {
    updateConfig("yearDialRange", range);
  };

  return (
    <Box className={styles.configurationContainer}>
      {/* Dial Controls */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={(val) => updateConfig("numSongs", val)}
        timeLimit={config.timeLimit ?? 15}
        onTimeLimitChange={(val) => updateConfig("timeLimit", val)}
        secondsLabel="Time"
      />

      {/* Info */}
      <Box sx={{ textAlign: "center", mb: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.6 }}>
          Guess the year - within 3 years = 1 point
        </Typography>
      </Box>

      {/* Familiarity */}
      <RecognitionSelector
        selectedTiers={config.recognitionTiers || [1]}
        onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
        compact
      />

      {/* Era */}
      <ContiguousPeriodSelector
        selectedPeriods={config.periods || DEFAULT_PERIODS}
        onChange={(val) => updateConfig("periods", val)}
        onYearRangeChange={handleYearRangeChange}
      />

      {/* Style */}
      <StylesSelector
        availableStyles={PRIMARY_STYLES}
        selectedStyles={config.styles || { Tango: true }}
        onChange={(val) => updateConfig("styles", val)}
      />

      {/* Validation */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
          Not enough songs (need {numSongs}, have {availableCount})
        </Box>
      )}
    </Box>
  );
}
