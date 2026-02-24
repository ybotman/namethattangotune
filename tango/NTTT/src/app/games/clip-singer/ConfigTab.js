"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Slider } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import LevelsSelector from "@/components/ui/LevelsSelector";
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
    handleLevelsChange,
    handleArtistsChange,
    handleSingersChange,
  } = useSingerQuiz();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);

  useEffect(() => {
    setIsConfigValid(!validationMessage);
  }, [validationMessage]);

  const handleClipLengthChange = (val) => {
    updateConfig("clipLength", val);
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
            onChange={handleNumSongsChange}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: "var(--foreground)", mb: 1 }}>
            Clip Length: {config.clipLength ?? 5} seconds
          </Typography>
          <Slider
            value={config.clipLength ?? 5}
            onChange={(_, val) => handleClipLengthChange(val)}
            min={1}
            max={7}
            step={1}
            marks={[
              { value: 1, label: "1s" },
              { value: 3, label: "3s" },
              { value: 5, label: "5s" },
              { value: 7, label: "7s" },
            ]}
            sx={{ color: "var(--accent)" }}
          />
        </Box>
      </Box>

      {/* Orchestra and Singer filters */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <LevelsSelector
            label="Orchestra Levels:"
            availableLevels={[1, 2, 3, 4, 5]}
            selectedLevels={config.levels || []}
            onChange={handleLevelsChange}
          />
        </Box>
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

      {/* Info */}
      <Box sx={{ mb: 2, p: 2, backgroundColor: "var(--input-bg)", borderRadius: 1 }}>
        <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
          No time limit! Clip plays from a vocal section.
          Replay as many times as needed. Score decreases with each replay.
        </Typography>
      </Box>

      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2 }}>{validationMessage}</Box>
      )}
    </Box>
  );
}
