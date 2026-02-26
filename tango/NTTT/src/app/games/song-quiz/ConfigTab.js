"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import ScorePotential from "@/components/ui/ScorePotential";
import useSongQuiz from "@/hooks/useSongQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
    handleIncludeSingerChange,
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
      {/* Dial Controls */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        timeLimit={config.timeLimit ?? 15}
        onTimeLimitChange={handleTimeLimitChange}
        secondsLabel="Time"
      />

      {/* Score Potential Display */}
      <ScorePotential config={config} />

      {/* Familiarity - tile buttons */}
      <RecognitionSelector
        selectedTiers={config.recognitionTiers || [1]}
        onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
        compact
      />

      {/* Style - tile buttons + Vocals toggle */}
      <StylesSelector
        availableStyles={primaryStyles}
        selectedStyles={config.styles || {}}
        onChange={handleStylesChange}
        showVocals={true}
        includeSinger={config.includeSinger ?? true}
        onVocalsChange={handleIncludeSingerChange}
      />

      {/* Era - 2 rows of tile buttons */}
      <PeriodsSelector
        selectedPeriods={config.periods || []}
        onChange={(val) => updateConfig("periods", val)}
      />

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
          {validationMessage || `Not enough songs (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
