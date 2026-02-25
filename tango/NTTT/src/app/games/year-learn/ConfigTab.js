"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import StylesSelector from "@/components/ui/StylesSelector";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import ContiguousPeriodSelector from "@/components/ui/ContiguousPeriodSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import { useGameContext } from "@/contexts/GameContext";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

// Default periods for year quiz
const DEFAULT_PERIODS = ["New Guard", "Golden Age"];

export default function ConfigTab() {
  const { config, updateConfig } = useGameContext();
  const [availableCount, setAvailableCount] = useState(null);
  const [isConfigValid, setIsConfigValid] = useState(true);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  // Set default periods on mount if not set
  useEffect(() => {
    if (!config.periods || config.periods.length === 0) {
      updateConfig("periods", DEFAULT_PERIODS);
    }
  }, []);

  useEffect(() => {
    setIsConfigValid(hasEnoughSongs);
  }, [hasEnoughSongs]);

  // Handle year range change from period selector
  const handleYearRangeChange = (range) => {
    updateConfig("yearDialRange", range);
  };

  // All styles toggle
  const allStylesSelected = PRIMARY_STYLES.every(
    (s) => config.styles?.[s.style] === true
  );

  const handleAllStylesToggle = (checked) => {
    if (checked) {
      const allStyles = {};
      PRIMARY_STYLES.forEach((s) => {
        allStyles[s.style] = true;
      });
      updateConfig("styles", allStyles);
    } else {
      updateConfig("styles", { Tango: true });
    }
  };

  const handleStylesChange = (newStyles) => {
    updateConfig("styles", newStyles);
  };

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
            onChange={(val) => updateConfig("numSongs", val)}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SecondsSlider
            label="Seconds"
            min={5}
            max={30}
            step={1}
            value={config.timeLimit ?? 15}
            onChange={(val) => updateConfig("timeLimit", val)}
          />
        </Box>
      </Box>

      {/* Main Config */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        {/* Recognition Tier + Instructions */}
        <Box sx={{ flex: 1 }}>
          <RecognitionSelector
            label="Recognition Tier:"
            selectedTiers={config.recognitionTiers || [1]}
            onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          />
          <ContiguousPeriodSelector
            label="Periods (contiguous only):"
            selectedPeriods={config.periods || DEFAULT_PERIODS}
            onChange={(val) => updateConfig("periods", val)}
            onYearRangeChange={handleYearRangeChange}
          />
          <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.7, mt: 2 }}>
            Listen to each song and click on the year dial to guess when it was recorded.
            <br /><br />
            Scoring: Within 3 years = 1 point
          </Typography>
        </Box>

        {/* Styles */}
        <Box sx={{ flex: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={allStylesSelected}
                onChange={(e) => handleAllStylesToggle(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "var(--accent)",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "var(--accent)",
                  },
                }}
              />
            }
            label="All Styles"
            sx={{ color: "var(--foreground)", mb: 1 }}
          />
          <StylesSelector
            label="Styles:"
            availableStyles={PRIMARY_STYLES}
            selectedStyles={config.styles || { Tango: true }}
            onChange={handleStylesChange}
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

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>
          Not enough songs available (need {numSongs}, have {availableCount})
        </Box>
      )}
    </Box>
  );
}
