"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import FilterSection from "@/components/ui/FilterSection";
import RecognitionSelector, { TIER_CONFIG } from "@/components/ui/RecognitionSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import SingersSelector from "@/components/ui/SingersSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import SongCountDisplay from "@/components/ui/SongCountDisplay";
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
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    setIsConfigValid(!validationMessage && hasEnoughSongs);
  }, [validationMessage, hasEnoughSongs]);

  const handleClipLengthChange = (val) => {
    updateConfig("clipLength", val);
  };

  // Summary helpers
  const tierSummary = useMemo(() => {
    const tiers = config.recognitionTiers || [1];
    return tiers.map(t => TIER_CONFIG[t]?.name || t);
  }, [config.recognitionTiers]);

  const periodSummary = useMemo(() => {
    return config.periods || [];
  }, [config.periods]);

  const artistSummary = useMemo(() => {
    const artists = config.artists || [];
    if (artists.length === 0) return "All";
    return artists.map(a => a.label || a.value);
  }, [config.artists]);

  const singerSummary = useMemo(() => {
    const singers = config.singers || [];
    if (singers.length === 0) return "All";
    return singers.map(s => typeof s === 'string' ? s : (s.label || s.value));
  }, [config.singers]);

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

      {/* Info */}
      <Box sx={{ textAlign: "center", mb: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
          No time limit - clip plays from vocal section
        </Typography>
      </Box>

      {/* Filters */}
      <FilterSection title="Difficulty" summary={tierSummary} defaultExpanded>
        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={handleLevelsChange}
          compact
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

      <FilterSection title="Singer" summary={singerSummary}>
        <SingersSelector
          availableSingers={singerOptions}
          selectedSingers={config.singers || []}
          onChange={handleSingersChange}
        />
        {singerOptions.length === 0 && (
          <Typography variant="caption" sx={{ color: "var(--accent)", mt: 1, display: "block" }}>
            Singer data loading...
          </Typography>
        )}
      </FilterSection>

      {/* Song Count Display */}
      <SongCountDisplay
        config={config}
        numSongs={numSongs}
        gameType="singer"
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
