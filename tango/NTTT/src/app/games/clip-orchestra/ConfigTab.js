"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import FilterSection from "@/components/ui/FilterSection";
import RecognitionSelector, { TIER_CONFIG } from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
import useClipQuiz from "@/hooks/useClipQuiz";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab() {
  const {
    primaryStyles,
    artistOptions,
    validationMessage,
    handleNumSongsChange,
    handleClipLengthChange,
    handleLevelsChange,
    handleStylesChange,
    handleArtistsChange,
    handleIncludeSingerChange,
  } = useClipQuiz();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    setIsConfigValid(!validationMessage && hasEnoughSongs);
  }, [validationMessage, hasEnoughSongs]);

  // Summary helpers
  const tierSummary = useMemo(() => {
    const tiers = config.recognitionTiers || [1];
    return tiers.map(t => TIER_CONFIG[t]?.name || t);
  }, [config.recognitionTiers]);

  const styleSummary = useMemo(() => {
    return Object.keys(config.styles || {}).filter(k => config.styles[k]);
  }, [config.styles]);

  const periodSummary = useMemo(() => {
    return config.periods || [];
  }, [config.periods]);

  const artistSummary = useMemo(() => {
    const artists = config.artists || [];
    if (artists.length === 0) return "All";
    return artists.map(a => a.label || a.value);
  }, [config.artists]);

  return (
    <Box className={styles.configurationContainer}>
      {/* Dial Controls - Songs and Clip Length */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        showSeconds={false}
        showClipLength
        clipLength={config.clipLength ?? 5}
        onClipLengthChange={handleClipLengthChange}
      />

      {/* Info + Singer Toggle */}
      <Box sx={{ textAlign: "center", mb: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
          No time limit - score drops with each replay
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.includeSinger ?? false}
              onChange={(e) => handleIncludeSingerChange(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "var(--foreground)", fontSize: "0.85rem" }}>
              Include vocals
            </Typography>
          }
        />
      </Box>

      {/* Filters */}
      <FilterSection title="Difficulty" summary={tierSummary} defaultExpanded>
        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={handleLevelsChange}
          compact
        />
      </FilterSection>

      <FilterSection title="Style" summary={styleSummary.length > 0 ? styleSummary : ["Tango"]}>
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

      {/* Validation */}
      {!isConfigValid && (
        <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
          {validationMessage || `Not enough songs (need ${numSongs}, have ${availableCount})`}
        </Box>
      )}
    </Box>
  );
}
