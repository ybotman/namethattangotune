"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import ClipScorePotential from "@/components/ui/ClipScorePotential";
import useSingerQuiz from "@/hooks/useSingerQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    validationMessage,
    handleNumSongsChange,
    handleLevelsChange,
  } = useSingerQuiz();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    setIsConfigValid(!validationMessage && hasEnoughSongs);
  }, [validationMessage, hasEnoughSongs]);

  const handleClipLengthChange = (val) => {
    updateConfig("clipLength", val);
  };

  return (
    <Box className={styles.configurationContainer}>
      {/* Dial Controls - Songs and Clip Length */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        showSeconds={false}
        showClipLength
        clipLength={config.clipLength ?? 5}
        onClipLengthChange={handleClipLengthChange}
      />

      {/* Score Potential Display */}
      <ClipScorePotential config={config} />

      {/* Familiarity */}
      <RecognitionSelector
        selectedTiers={config.recognitionTiers || [1]}
        onChange={handleLevelsChange}
        compact
      />

      {/* Era */}
      <PeriodsSelector
        selectedPeriods={config.periods || []}
        onChange={(val) => updateConfig("periods", val)}
      />

      {/* Validation */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
          {validationMessage || `Not enough songs (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
