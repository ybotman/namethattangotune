"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Divider } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { motion, AnimatePresence } from "motion/react";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import FilterModeToggle from "@/components/ui/FilterModeToggle";
import PoolCount, { MIN_POOL_SIZE } from "@/components/ui/PoolCount";
import ScorePotential from "@/components/ui/ScorePotential";
import useSongQuiz from "@/hooks/useSongQuiz";
import { useGameContext } from "@/contexts/GameContext";
import { getFilteredSongCount } from "@/utils/dataFetching";
import PropTypes from "prop-types";

export default function ConfigTab({ showFilters, setShowFilters, isLandscape = false }) {
  const {
    primaryStyles,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
    handleIncludeSingerChange,
  } = useSongQuiz();

  const { config, updateConfig } = useGameContext();

  const [poolCount, setPoolCount] = useState(null);
  const [poolLoading, setPoolLoading] = useState(false);

  const numSongs = config.numSongs ?? 10;
  const primaryFilterMode = config.primaryFilterMode || "level";
  const hasEnoughSongs = poolCount === null || poolCount >= MIN_POOL_SIZE;

  // Handle filter mode change
  const handleFilterModeChange = useCallback((mode) => {
    updateConfig("primaryFilterMode", mode);
  }, [updateConfig]);

  // Fetch pool count when config changes
  useEffect(() => {
    const fetchCount = async () => {
      setPoolLoading(true);
      try {
        // Build filter options based on current mode
        const options = {
          primaryFilterMode,
          styles: Object.keys(config.styles || {}).filter(s => config.styles[s]),
          includeSinger: config.includeSinger ?? true,
        };

        // Add recognition filters only in level mode
        if (primaryFilterMode === "level") {
          options.recognitionTiers = config.recognitionTiers || [1];
        }

        // Add period filters only in era mode
        if (primaryFilterMode === "era") {
          options.periods = config.periods || [];
        }

        const count = await getFilteredSongCount(options);
        setPoolCount(count);
      } catch (err) {
        console.error("Error fetching pool count:", err);
        setPoolCount(0);
      }
      setPoolLoading(false);
    };

    fetchCount();
  }, [config.recognitionTiers, config.periods, config.styles, config.includeSinger, primaryFilterMode]);

  // LANDSCAPE: Show everything, no animation, evenly distributed
  if (isLandscape) {
    const dividerStyle = { borderColor: "rgba(255,255,255,0.15)", my: 1 };

    return (
      <Box
        className={styles.configurationContainer}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          height: "100%",
          py: 2,
        }}
      >
        <GameSetupDials
          numSongs={config.numSongs ?? 10}
          onNumSongsChange={handleNumSongsChange}
          timeLimit={config.timeLimit ?? 15}
          onTimeLimitChange={handleTimeLimitChange}
          secondsLabel="Time"
        />

        <Divider sx={dividerStyle} />

        {/* SWAP not STACK: Filter mode toggle */}
        <FilterModeToggle
          mode={primaryFilterMode}
          onChange={handleFilterModeChange}
          levelLabel="Familiarity"
          levelIcon="🎵"
        />

        {/* Conditional: Familiarity OR Era */}
        {primaryFilterMode === "level" ? (
          <RecognitionSelector
            selectedTiers={config.recognitionTiers || [1]}
            onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
            compact
          />
        ) : (
          <PeriodsSelector
            selectedPeriods={config.periods || []}
            onChange={(val) => updateConfig("periods", val)}
          />
        )}

        <Divider sx={dividerStyle} />

        <StylesSelector
          availableStyles={primaryStyles}
          selectedStyles={config.styles || {}}
          onChange={handleStylesChange}
          showVocals={true}
          includeSinger={config.includeSinger ?? true}
          onVocalsChange={handleIncludeSingerChange}
        />

        <Divider sx={dividerStyle} />

        <PoolCount count={poolCount ?? 0} loading={poolLoading} />

        {!hasEnoughSongs && (
          <Box sx={{ color: "#FF9800", textAlign: "center", fontSize: "0.75rem" }}>
            Need {MIN_POOL_SIZE} songs to play
          </Box>
        )}
      </Box>
    );
  }

  // PORTRAIT: Animated toggle between quick and levels
  return (
    <Box className={styles.configurationContainer} sx={{ overflow: "hidden", py: 1 }}>
      <ScorePotential config={config} />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />

      <AnimatePresence mode="wait">
        {!showFilters ? (
          <motion.div
            key="quick"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <GameSetupDials
              numSongs={config.numSongs ?? 10}
              onNumSongsChange={handleNumSongsChange}
              timeLimit={config.timeLimit ?? 15}
              onTimeLimitChange={handleTimeLimitChange}
              secondsLabel="Time"
            />

            <PoolCount count={poolCount ?? 0} loading={poolLoading} />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={() => setShowFilters(true)}
                sx={{
                  borderColor: "var(--accent)",
                  color: "var(--foreground)",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    borderColor: "var(--accent)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Filters
              </Button>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Button
                variant="contained"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={() => setShowFilters(false)}
                sx={{
                  backgroundColor: "var(--accent)",
                  color: "#000",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "var(--accent)",
                    filter: "brightness(1.1)",
                  },
                }}
              >
                Ready
              </Button>
            </Box>

            {/* SWAP not STACK: Filter mode toggle */}
            <FilterModeToggle
              mode={primaryFilterMode}
              onChange={handleFilterModeChange}
              levelLabel="Familiarity"
              levelIcon="🎵"
            />

            {/* Conditional: Familiarity OR Era */}
            {primaryFilterMode === "level" ? (
              <RecognitionSelector
                selectedTiers={config.recognitionTiers || [1]}
                onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
                compact
              />
            ) : (
              <PeriodsSelector
                selectedPeriods={config.periods || []}
                onChange={(val) => updateConfig("periods", val)}
              />
            )}

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <StylesSelector
              availableStyles={primaryStyles}
              selectedStyles={config.styles || {}}
              onChange={handleStylesChange}
              showVocals={true}
              includeSinger={config.includeSinger ?? true}
              onVocalsChange={handleIncludeSingerChange}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <PoolCount count={poolCount ?? 0} loading={poolLoading} />

            {!hasEnoughSongs && (
              <Box sx={{ color: "#FF9800", textAlign: "center", fontSize: "0.75rem", mt: 1 }}>
                Need {MIN_POOL_SIZE} songs to play
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

ConfigTab.propTypes = {
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  isLandscape: PropTypes.bool,
};
