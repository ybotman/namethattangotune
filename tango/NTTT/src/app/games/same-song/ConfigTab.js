"use client";

import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import DialControl from "@/components/ui/DialControl";
import FilterSection from "@/components/ui/FilterSection";
import RecognitionSelector, { TIER_CONFIG } from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const { config, updateConfig } = useGameContext();

  const handleTimeLimitChange = (value) => {
    updateConfig("timeLimit", value);
  };

  // Summary helpers
  const tierSummary = useMemo(() => {
    const tiers = config.recognitionTiers || [1];
    return tiers.map(t => TIER_CONFIG[t]?.name || t);
  }, [config.recognitionTiers]);

  const periodSummary = useMemo(() => {
    return config.periods || [];
  }, [config.periods]);

  return (
    <Box className={styles.configurationContainer}>
      {/* Single Dial - Clip Duration */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <DialControl
          label="Clip"
          value={config.timeLimit ?? 15}
          min={5}
          max={30}
          onChange={handleTimeLimitChange}
          size={90}
          color="#2196F3"
          unit="sec"
        />
      </Box>

      {/* Filters */}
      <FilterSection title="Difficulty" summary={tierSummary} defaultExpanded>
        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          compact
        />
      </FilterSection>

      <FilterSection title="Period" summary={periodSummary.length > 0 ? periodSummary : "All"}>
        <PeriodsSelector
          selectedPeriods={config.periods || []}
          onChange={(val) => updateConfig("periods", val)}
        />
      </FilterSection>

      {/* Instructions */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: "var(--input-bg)", borderRadius: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.8 }}>
          Compare recordings of the same song by different orchestras
        </Typography>
      </Box>
    </Box>
  );
}
