"use client";

import React, { useState, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import StylesSelector from "@/components/ui/StylesSelector";
import SingersSelector from "@/components/ui/SingersSelector";
import YearRangeSelector from "@/components/ui/YearRangeSelector";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
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
    handleStylesChange,
    handleSingersChange,
  } = useSingerLearn();

  // Access final config from GameContext
  const { config, updateConfig } = useGameContext();

  // Local state to track whether the config is valid
  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  // All styles toggle
  const allStylesSelected = primaryStyles.length > 0 &&
    primaryStyles.every((s) => config.styles?.[s.style] === true);

  const handleAllStylesToggle = (checked) => {
    if (checked) {
      // Select all styles
      const allStyles = {};
      primaryStyles.forEach((s) => { allStyles[s.style] = true; });
      handleStylesChange(allStyles);
    } else {
      // Deselect all, default to Tango
      handleStylesChange({ Tango: true });
    }
  };

  useEffect(() => {
    // If validationMessage is non-empty OR not enough songs => invalid
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
        {/* First Column: Singer Type, Singers, Year Range */}
        <Box sx={{ flex: 1 }}>
          {/* Singer Type Toggle */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, color: "var(--foreground)" }}>
              Singer Type:
            </Typography>
            <ToggleButtonGroup
              value={config.duetFilter || "solo"}
              exclusive
              onChange={(e, val) => val && updateConfig("duetFilter", val)}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  color: "var(--foreground)",
                  borderColor: "var(--accent)",
                  "&.Mui-selected": {
                    backgroundColor: "var(--accent)",
                    color: "white",
                  },
                },
              }}
            >
              <ToggleButton value="solo">Solo</ToggleButton>
              <ToggleButton value="duetsOnly">Duets+</ToggleButton>
              <ToggleButton value="all">Both</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Singers Selector */}
          <SingersSelector
            label="Select Singers:"
            availableSingers={singerOptions}
            selectedSingers={
              (config.singers || []).map((s) =>
                typeof s === "string" ? { label: s, value: s } : s
              )
            }
            onChange={handleSingersChange}
          />

          {/* Year Range */}
          <Box sx={{ mt: 2 }}>
            <YearRangeSelector
              label="Year Range:"
              value={config.yearRange}
              onChange={(val) => updateConfig("yearRange", val)}
            />
          </Box>
        </Box>

        {/* Second Column: Styles */}
        <Box sx={{ flex: 1 }}>
          {/* All Styles Toggle */}
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
            availableStyles={primaryStyles}
            selectedStyles={config.styles || {}}
            onChange={handleStylesChange}
          />

          <RecognitionSelector
            selectedTiers={config.recognitionTiers || [1]}
            onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          />

          <PeriodsSelector
            label="Periods:"
            selectedPeriods={config.periods || []}
            onChange={(val) => updateConfig("periods", val)}
          />
        </Box>
      </Box>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="singer"
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
