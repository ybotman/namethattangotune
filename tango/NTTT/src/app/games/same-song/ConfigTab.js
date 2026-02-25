"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import SecondsSlider from "@/components/ui/SecondsSlider";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const { config, updateConfig } = useGameContext();

  const handleTimeLimitChange = (value) => {
    updateConfig("timeLimit", value);
  };

  return (
    <Box className={styles.configurationContainer}>
      {/* Time Slider */}
      <Box sx={{ mb: 3, maxWidth: 300 }}>
        <SecondsSlider
          label="Clip Duration"
          min={5}
          max={30}
          step={1}
          value={config.timeLimit ?? 15}
          onChange={handleTimeLimitChange}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "var(--foreground)" }}>
            Filter by Recognition Tier:
          </Typography>
          <RecognitionSelector
            selectedTiers={config.recognitionTiers || [1]}
            onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "var(--foreground)" }}>
            Filter by Period:
          </Typography>
          <PeriodsSelector
            label=""
            selectedPeriods={config.periods || []}
            onChange={(val) => updateConfig("periods", val)}
          />
        </Box>
      </Box>

      {/* Instructions */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "var(--input-bg)", borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
          <strong>How to use:</strong> Select a song title above to see all recordings
          by different orchestras. Play each version to compare their unique styles
          and interpretations.
        </Typography>
      </Box>
    </Box>
  );
}
