"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import FilterSection from "@/components/ui/FilterSection";
import StylesSelector from "@/components/ui/StylesSelector";
import SingersSelector from "@/components/ui/SingersSelector";
import RecognitionSelector, { TIER_CONFIG } from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import useSingerLearn from "@/hooks/useSingerLearn";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    singerOptions,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
    handleSingersChange,
  } = useSingerLearn();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

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
    setIsConfigValid(!validationMessage && hasEnoughSongs);
  }, [validationMessage, hasEnoughSongs]);

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
    return config.periods || [];
  }, [config.periods]);

  const singerSummary = useMemo(() => {
    const singers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : (s.label || s.value)
    );
    return singers.length > 0 ? singers : "All";
  }, [config.singers]);

  const duetLabel = {
    solo: "Solo",
    duetsOnly: "Duets+",
    all: "Both"
  }[config.duetFilter || "solo"];

  return (
    <Box className={styles.configurationContainer}>
      {/* Dial Controls */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        timeLimit={config.timeLimit ?? 15}
        onTimeLimitChange={handleTimeLimitChange}
        secondsLabel="Time"
      />

      {/* Singer Type Toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={config.duetFilter || "solo"}
          exclusive
          onChange={(e, val) => val && updateConfig("duetFilter", val)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "var(--foreground)",
              borderColor: "var(--accent)",
              fontSize: "0.75rem",
              py: 0.5,
              px: 1.5,
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

      {/* Filters */}
      <FilterSection title="Difficulty" summary={tierSummary} defaultExpanded>
        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          compact
        />
      </FilterSection>

      <FilterSection title="Singer" summary={singerSummary}>
        <SingersSelector
          availableSingers={singerOptions}
          selectedSingers={
            (config.singers || []).map((s) =>
              typeof s === "string" ? { label: s, value: s } : s
            )
          }
          onChange={handleSingersChange}
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
          availableStyles={primaryStyles}
          selectedStyles={config.styles || {}}
          onChange={handleStylesChange}
        />
      </FilterSection>

      <FilterSection title="Period" summary={periodSummary.length > 0 ? periodSummary : "All"}>
        <PeriodsSelector
          selectedPeriods={config.periods || []}
          onChange={(val) => updateConfig("periods", val)}
        />
      </FilterSection>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="singer"
        onCountChange={setAvailableCount}
      />

      {/* Validation Message */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
          {validationMessage || `Not enough songs (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
