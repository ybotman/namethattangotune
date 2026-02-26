"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import useArtistLearn from "@/hooks/useArtistLearn";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleRecognitionTiersChange,
    handleStylesChange,
    handleIncludeSingerChange,
  } = useArtistLearn();

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

      {/* Familiarity */}
      <RecognitionSelector
        selectedTiers={config.recognitionTiers || [1]}
        onChange={handleRecognitionTiersChange}
        compact
      />

      {/* Style + Vocals - same as artist-quiz */}
      <StylesSelector
        availableStyles={primaryStyles}
        selectedStyles={config.styles || {}}
        onChange={handleStylesChange}
        showVocals={true}
        includeSinger={config.includeSinger ?? false}
        onVocalsChange={handleIncludeSingerChange}
      />

      {/* Era */}
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
