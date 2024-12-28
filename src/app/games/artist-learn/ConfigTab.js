"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import LevelsSelector from "@/components/ui/LevelsSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";

import useArtistLearn from "@/hooks/useArtistLearn";  // for style data, etc.
import { useGameContext } from "@/contexts/GameContext";

function validateSimpleRules(config) {
  // 1) styles must not be blank
  const selectedStyles = Object.keys(config.styles || {}).filter(
    (k) => config.styles[k],
  );
  if (selectedStyles.length === 0) {
    return false; // no styles => invalid
  }

  // 2) either levels (<3) or artists (<4)
  const levelCount = (config.levels || []).length;
  const artistCount = (config.artists || []).length;

  // not both
  const hasBoth = levelCount > 0 && artistCount > 0;
  // not neither
  const hasNeither = levelCount === 0 && artistCount === 0;
  if (hasBoth || hasNeither) {
    return false; // invalid
  }

  // if using levels => must be < 3
  if (levelCount > 0 && levelCount >= 3) {
    return false;
  }
  // if using artists => must be < 4
  if (artistCount > 0 && artistCount >= 4) {
    return false;
  }

  return true; // passes all simple rules
}

export default function ConfigTab() {
  // A) fetch data from our custom hook
  const { primaryStyles, artistOptions } = useArtistLearn();

  // B) Access & update final config from GameContext
  const { config, updateConfig } = useGameContext();

  // Local state to track whether the config is valid (under these simple rules)
  const [isConfigValid, setIsConfigValid] = useState(false);

  const checkConfigValidity = useCallback(() => {
    const valid = validateSimpleRules(config);
    setIsConfigValid(valid);
  }, [config]);

  useEffect(() => {
    // Validate on mount & whenever config changes
    checkConfigValidity();
  }, [config, checkConfigValidity]);

  // Handlers: Auto-save each change
  const handleNumSongsChange = (value) => {
    updateConfig("numSongs", value);
  };

  const handleTimeLimitChange = (value) => {
    updateConfig("timeLimit", value);
  };

  const handleLevelsChange = (newLevels) => {
    updateConfig("levels", newLevels);
  };

  const handleStylesChange = (updatedStylesObj) => {
    updateConfig("styles", updatedStylesObj);
  };

  const handleArtistsChange = (newSelected) => {
    updateConfig("artists", newSelected);
  };

  return (
    <Box className={styles.configurationContainer}>
      {/* We remove any inline error display—no FormHelperText, etc. */}

      {/* Sliders */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        <SongsSlider
          label="Number of Songs"
          min={3}
          max={25}
          step={1}
          value={config.numSongs ?? 10}
          onChange={handleNumSongsChange}
        />

        <SecondsSlider
          label="Time Limit (Seconds)"
          min={3}
          max={29}
          step={1}
          value={config.timeLimit ?? 15}
          onChange={handleTimeLimitChange}
        />
      </Box>

      {/* Levels & Styles */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
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

      {/* Artists */}
      <ArtistsSelector
        label="Select Artists (Optional)"
        availableArtists={artistOptions}
        selectedArtists={config.artists || []}
        onChange={handleArtistsChange}
      />
    </Box>
  );
}
