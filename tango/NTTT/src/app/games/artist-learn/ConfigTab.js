"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import FilterSection from "@/components/ui/FilterSection";
import RecognitionSelector, { TIER_CONFIG } from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import useArtistLearn from "@/hooks/useArtistLearn";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
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

  const artistSummary = useMemo(() => {
    const artists = config.artists || [];
    if (artists.length === 0) return "All";
    return artists.map(a => a.label || a.value);
  }, [config.artists]);

  const vocalLabel = {
    instrumental: "Instrumental",
    solo: "Solo singer",
    duetsOnly: "Duets",
    all: "All vocals"
  }[config.vocalFilter || "instrumental"];

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

      {/* Vocals Toggle - compact horizontal buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={config.vocalFilter || "instrumental"}
          exclusive
          onChange={(e, val) => val && updateConfig("vocalFilter", val)}
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
          <ToggleButton value="instrumental">Inst</ToggleButton>
          <ToggleButton value="solo">Solo</ToggleButton>
          <ToggleButton value="duetsOnly">Duets</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <FilterSection title="Difficulty" summary={tierSummary} defaultExpanded>
        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={handleRecognitionTiersChange}
          compact
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

      <FilterSection title="Orchestra" summary={artistSummary}>
        <ArtistsSelector
          availableArtists={artistOptions}
          selectedArtists={config.artists || []}
          onChange={handleArtistsChange}
        />
      </FilterSection>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="orchestra"
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
