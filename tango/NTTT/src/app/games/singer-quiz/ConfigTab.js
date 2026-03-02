// ------------------------------------------------------------
// src/app/games/singer-quiz/ConfigTab.js
// Swipeable config UI for singer quiz
// Layout: ScorePotential → Mode Toggle → PoolCount → SwipeCards
// ------------------------------------------------------------
"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Divider } from "@mui/material";

import SwipeConfig from "@/components/ui/SwipeConfig";
import ScorePotential from "@/components/ui/ScorePotential";
import PoolCount from "@/components/ui/PoolCount";
import GameSetupDials from "@/components/ui/GameSetupDials";
import StylesSelector from "@/components/ui/StylesSelector";
import SingerDifficultyGrid, { singerGridToFilters } from "@/components/ui/SingerDifficultyGrid";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import useSingerQuiz from "@/hooks/useSingerQuiz";
import { useGameContext } from "@/contexts/GameContext";
import { getFilteredSongCount } from "@/utils/dataFetching";
import PropTypes from "prop-types";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

export default function ConfigTab({ isLandscape = false, onPoolCountChange = null }) {
  const {
    handleNumSongsChange,
    handleTimeLimitChange,
  } = useSingerQuiz();

  const { config, updateConfig } = useGameContext();

  const [poolCount, setPoolCount] = useState(0);
  const [poolLoading, setPoolLoading] = useState(false);

  const primaryFilterMode = config.primaryFilterMode || "level";

  // Grid selections for level mode (e.g., ["Iconic-Famous", "Essential-Known"])
  const singerGridCells = config.singerGridCells || ["Iconic-Famous"];

  // Get active styles
  const activeStyles = Object.keys(config.styles || {}).filter(s => config.styles[s]);

  // Handle grid cell changes
  const handleGridChange = (newCells) => {
    updateConfig("singerGridCells", newCells);
  };

  // Fetch pool count when config changes
  useEffect(() => {
    const fetchCount = async () => {
      setPoolLoading(true);
      try {
        const options = {
          requireSinger: true,
          primaryFilterMode,
          styles: activeStyles,
        };

        if (primaryFilterMode === "level") {
          const { singerLevels, subTiers } = singerGridToFilters(singerGridCells);
          options.singerLevels = singerLevels;
          options.subTiers = subTiers;
        } else {
          options.periods = config.periods || [];
        }

        const count = await getFilteredSongCount(options);
        setPoolCount(count);
        if (onPoolCountChange) onPoolCountChange(count);
      } catch (err) {
        console.error("Error fetching pool count:", err);
        setPoolCount(0);
        if (onPoolCountChange) onPoolCountChange(0);
      }
      setPoolLoading(false);
    };

    fetchCount();
  }, [singerGridCells, config.periods, config.styles, primaryFilterMode, activeStyles, onPoolCountChange]);

  // ─────────────────────────────────────────────────────────────
  // SWIPE CARDS
  // ─────────────────────────────────────────────────────────────

  // Card 1: Singer Grid (Level mode) or Periods (Era mode)
  const Card1 = primaryFilterMode === "level" ? (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1 }}>
      <SingerDifficultyGrid
        selectedCells={singerGridCells}
        onChange={handleGridChange}
        compact={!isLandscape}
      />
    </Box>
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
      <PeriodsSelector
        selectedPeriods={config.periods || []}
        onChange={(val) => updateConfig("periods", val)}
        label=""
        compact={true}
      />
    </Box>
  );

  // Card 2: Styles only (singers always required, no toggle needed)
  const Card2 = (
    <Box sx={{ py: 1, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <StylesSelector
        availableStyles={PRIMARY_STYLES}
        selectedStyles={config.styles || {}}
        onChange={(val) => updateConfig("styles", val)}
        showVocals={false}
      />
    </Box>
  );

  // Card 3: Dials (numSongs + timeLimit)
  const Card3 = (
    <Box sx={{ py: 1 }}>
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        timeLimit={config.timeLimit ?? 15}
        onTimeLimitChange={handleTimeLimitChange}
        secondsLabel="Time"
      />
    </Box>
  );

  const cards = [Card1, Card2, Card3];
  const cardLabels = [
    primaryFilterMode === "level" ? "GRID" : "ERA",
    "STYLE",
    "QTY"
  ];

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <Box sx={{ width: "100%" }}>
      {/* Score Potential */}
      <ScorePotential config={config} />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />

      {/* Mode Toggle: Sliding Switch */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            p: 0.5,
            position: "relative",
            width: 160,
          }}
        >
          {/* Sliding background */}
          <Box
            sx={{
              position: "absolute",
              width: "50%",
              height: "calc(100% - 8px)",
              backgroundColor: primaryFilterMode === "level" ? "#CE93D8" : "#4DD0E1",
              borderRadius: 2.5,
              transition: "transform 0.2s ease, background-color 0.2s ease",
              transform: primaryFilterMode === "level" ? "translateX(4px)" : "translateX(calc(100% - 4px))",
            }}
          />
          {/* LEVEL option */}
          <Box
            onClick={() => updateConfig("primaryFilterMode", "level")}
            sx={{
              flex: 1,
              textAlign: "center",
              py: 0.75,
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: primaryFilterMode === "level" ? "#000" : "var(--foreground)",
                transition: "color 0.2s ease",
              }}
            >
              LEVEL
            </Typography>
          </Box>
          {/* ERA option */}
          <Box
            onClick={() => updateConfig("primaryFilterMode", "era")}
            sx={{
              flex: 1,
              textAlign: "center",
              py: 0.75,
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: primaryFilterMode === "era" ? "#000" : "var(--foreground)",
                transition: "color 0.2s ease",
              }}
            >
              ERA
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Pool Count */}
      <PoolCount count={poolCount} loading={poolLoading} />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />

      {/* Swipeable Cards */}
      <SwipeConfig cards={cards} labels={cardLabels} />
    </Box>
  );
}

ConfigTab.propTypes = {
  isLandscape: PropTypes.bool,
  onPoolCountChange: PropTypes.func,
};
