"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import FilterSection from "@/components/ui/FilterSection";
import StylesSelector from "@/components/ui/StylesSelector";
import RecognitionSelector, { TIER_CONFIG } from "@/components/ui/RecognitionSelector";
import ContiguousPeriodSelector from "@/components/ui/ContiguousPeriodSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import { useGameContext } from "@/contexts/GameContext";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

const DEFAULT_PERIODS = ["New Guard", "Golden Age"];

export default function ConfigTab() {
  const { config, updateConfig } = useGameContext();
  const [availableCount, setAvailableCount] = useState(null);
  const [isConfigValid, setIsConfigValid] = useState(true);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    if (!config.periods || config.periods.length === 0) {
      updateConfig("periods", DEFAULT_PERIODS);
    }
  }, []);

  useEffect(() => {
    setIsConfigValid(hasEnoughSongs);
  }, [hasEnoughSongs]);

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
      PRIMARY_STYLES.forEach((s) => { allStyles[s.style] = true; });
      updateConfig("styles", allStyles);
    } else {
      updateConfig("styles", { Tango: true });
    }
  };

  const handleStylesChange = (newStyles) => {
    updateConfig("styles", newStyles);
  };

  // Summary helpers
  const tierSummary = useMemo(() => {
    const tiers = config.recognitionTiers || [1];
    return tiers.map(t => TIER_CONFIG[t]?.name || t);
  }, [config.recognitionTiers]);

  const styleSummary = useMemo(() => {
    const styles = Object.keys(config.styles || {}).filter(k => config.styles[k]);
    return styles.length > 0 ? styles : ["Tango"];
  }, [config.styles]);

  const periodSummary = useMemo(() => {
    return config.periods || DEFAULT_PERIODS;
  }, [config.periods]);

  return (
    <Box className={styles.configurationContainer}>
      {/* Dial Controls */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={(val) => updateConfig("numSongs", val)}
        timeLimit={config.timeLimit ?? 15}
        onTimeLimitChange={(val) => updateConfig("timeLimit", val)}
        secondsLabel="Time"
      />

      {/* Info */}
      <Box sx={{ textAlign: "center", mb: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
          Guess the year - within 3 years = 1 point
        </Typography>
      </Box>

      {/* Filters */}
      <FilterSection title="Difficulty" summary={tierSummary} defaultExpanded>
        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          compact
        />
      </FilterSection>

      <FilterSection title="Period" summary={periodSummary}>
        <ContiguousPeriodSelector
          selectedPeriods={config.periods || DEFAULT_PERIODS}
          onChange={(val) => updateConfig("periods", val)}
          onYearRangeChange={handleYearRangeChange}
        />
      </FilterSection>

      <FilterSection title="Style" summary={styleSummary}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={allStylesSelected}
                onChange={(e) => handleAllStylesToggle(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="caption">All styles</Typography>}
            sx={{ mr: 0 }}
          />
        </Box>
        <StylesSelector
          availableStyles={PRIMARY_STYLES}
          selectedStyles={config.styles || { Tango: true }}
          onChange={handleStylesChange}
        />
      </FilterSection>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="general"
        onCountChange={setAvailableCount}
      />

      {/* Validation */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
          Not enough songs (need {numSongs}, have {availableCount})
        </Box>
      )}
    </Box>
  );
}
