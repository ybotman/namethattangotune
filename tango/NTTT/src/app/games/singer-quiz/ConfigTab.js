"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import SingersSelector from "@/components/ui/SingersSelector";
import useSingerQuiz from "@/hooks/useSingerQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    artistOptions,
    singerOptions,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleLevelsChange,
    handleArtistsChange,
    handleSingersChange,
  } = useSingerQuiz();

  const { config } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);

  useEffect(() => {
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
            label="Seconds to guess"
            min={3}
            max={29}
            step={1}
            value={config.timeLimit ?? 15}
            onChange={handleTimeLimitChange}
          />
        </Box>
      </Box>

      {/* Main Grid - Orchestra and Singer filters */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        {/* First Column: Recognition Tier */}
        <Box sx={{ flex: 1 }}>
          <RecognitionSelector
            label="Recognition Tier:"
            selectedTiers={config.recognitionTiers || [1, 2, 3]}
            onChange={(tiers) => handleLevelsChange(tiers)}
          />
        </Box>
        {/* Second Column: Artists (Orchestra filter) */}
        <Box sx={{ flex: 1 }}>
          <ArtistsSelector
            label="Filter by Orchestra (Optional)"
            availableArtists={artistOptions}
            selectedArtists={config.artists || []}
            onChange={handleArtistsChange}
          />
        </Box>
      </Box>

      {/* Singer filter */}
      <Box sx={{ mb: 3 }}>
        <SingersSelector
          label="Filter by Singer (Optional)"
          availableSingers={singerOptions}
          selectedSingers={config.singers || []}
          onChange={handleSingersChange}
        />
        {singerOptions.length === 0 && (
          <Typography variant="body2" sx={{ color: "var(--accent)", mt: 1 }}>
            Singer data is being analyzed. All detected singers will be included.
          </Typography>
        )}
      </Box>

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>{validationMessage}</Box>
      )}
    </Box>
  );
}
