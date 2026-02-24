"use client";

import React, { useState, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import YearRangeSelector from "@/components/ui/YearRangeSelector";
import useArtistLearn from "@/hooks/useArtistLearn";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  // A) fetch data from useArtistLearn (now also from GameContext)
  const {
    primaryStyles,
    artistOptions,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleRecognitionTiersChange,
    handleStylesChange,
    handleArtistsChange,
  } = useArtistLearn();

  // B) Access & update final config from GameContext
  const { config, updateConfig } = useGameContext();

  // Local state to track whether the config is valid
  const [isConfigValid, setIsConfigValid] = useState(true);

  // All styles toggle
  const allStylesSelected = primaryStyles.length > 0 &&
    primaryStyles.every((s) => config.styles?.[s.style] === true);

  const handleAllStylesToggle = (checked) => {
    if (checked) {
      const allStyles = {};
      primaryStyles.forEach((s) => { allStyles[s.style] = true; });
      handleStylesChange(allStyles);
    } else {
      handleStylesChange({ Tango: true });
    }
  };

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
        {/* First Column: Recognition Tier, Artists, Singer Toggle */}
        <Box sx={{ flex: 1 }}>
          {/* 1. Recognition Tier */}
          <RecognitionSelector
            label="Recognition Tier:"
            selectedTiers={config.recognitionTiers || [1, 2, 3]}
            onChange={handleRecognitionTiersChange}
          />

          {/* 2. Artists */}
          <Box sx={{ mt: 2 }}>
            <ArtistsSelector
              label="Select Artists (Optional)"
              availableArtists={artistOptions}
              selectedArtists={config.artists || []}
              onChange={handleArtistsChange}
            />
          </Box>

          {/* 3. Singer Toggle */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, color: "var(--foreground)" }}>
              Vocals:
            </Typography>
            <ToggleButtonGroup
              value={config.vocalFilter || "instrumental"}
              exclusive
              onChange={(e, val) => val && updateConfig("vocalFilter", val)}
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
              <ToggleButton value="instrumental">Instrumental</ToggleButton>
              <ToggleButton value="solo">Solo</ToggleButton>
              <ToggleButton value="duetsOnly">Duets+</ToggleButton>
              <ToggleButton value="all">All</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Second Column: Styles, Year Range */}
        <Box sx={{ flex: 1 }}>
          {/* 4. Styles with All toggle */}
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

          {/* 5. Year Range (greyed out) */}
          <Box sx={{ mt: 2, opacity: 0.5, pointerEvents: "none" }}>
            <YearRangeSelector
              label="Year Range (coming soon):"
              value={config.yearRange}
              onChange={(val) => updateConfig("yearRange", val)}
            />
          </Box>
        </Box>
      </Box>

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>{validationMessage}</Box>
      )}
    </Box>
  );
}
