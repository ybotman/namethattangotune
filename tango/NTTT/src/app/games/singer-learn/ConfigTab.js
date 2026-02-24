"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import LevelsSelector from "@/components/ui/LevelsSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import SingersSelector from "@/components/ui/SingersSelector";
import useSingerLearn from "@/hooks/useSingerLearn";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  // Fetch data from useSingerLearn
  const {
    primaryStyles,
    singerOptions,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleLevelsChange,
    handleStylesChange,
    handleSingersChange,
  } = useSingerLearn();

  // Access final config from GameContext
  const { config } = useGameContext();

  // Local state to track whether the config is valid
  const [isConfigValid, setIsConfigValid] = useState(true);

  useEffect(() => {
    // If validationMessage is non-empty => invalid
    setIsConfigValid(!validationMessage);
  }, [validationMessage]);

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
            label="Seconds"
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
        {/* First Column: Levels */}
        <Box sx={{ flex: 1 }}>
          <LevelsSelector
            label="Levels:"
            availableLevels={[1, 2, 3, 4, 5]}
            selectedLevels={config.levels || []}
            onChange={handleLevelsChange}
          />
          <StylesSelector
            label="Styles:"
            availableStyles={primaryStyles}
            selectedStyles={config.styles || {}}
            onChange={handleStylesChange}
          />
        </Box>
        {/* Second Column: Singers */}
        <Box sx={{ flex: 1 }}>
          <SingersSelector
            label="Select Singers:"
            availableSingers={singerOptions}
            selectedSingers={
              // Ensure we pass objects to the Autocomplete
              (config.singers || []).map((s) =>
                typeof s === "string" ? { label: s, value: s } : s
              )
            }
            onChange={handleSingersChange}
          />
        </Box>
      </Box>

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>{validationMessage}</Box>
      )}
    </Box>
  );
}
