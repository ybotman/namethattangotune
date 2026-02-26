"use client";

import React, { useState, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
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

      {/* Vocals Toggle */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "var(--foreground)",
            opacity: 0.6,
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontSize: "0.65rem",
          }}
        >
          Vocals
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={config.vocalFilter || "instrumental"}
            exclusive
            onChange={(e, val) => val && updateConfig("vocalFilter", val)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: "var(--foreground)",
                borderColor: "var(--accent)",
                fontSize: "0.7rem",
                py: 0.5,
                px: 1.5,
                "&.Mui-selected": {
                  backgroundColor: "var(--accent)",
                  color: "white",
                },
              },
            }}
          >
            <ToggleButton value="instrumental">Inst</ToggleButton>
            <ToggleButton value="solo">Solo</ToggleButton>
            <ToggleButton value="duetsOnly">Duets</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Familiarity */}
      <RecognitionSelector
        selectedTiers={config.recognitionTiers || [1]}
        onChange={handleRecognitionTiersChange}
        compact
      />

      {/* Style */}
      <StylesSelector
        availableStyles={primaryStyles}
        selectedStyles={config.styles || {}}
        onChange={handleStylesChange}
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
