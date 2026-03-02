// ------------------------------------------------------------
// src/app/games/clip-orchestra/ConfigTab.js
// Swipeable config UI for clip orchestra quiz
// Layout: ScorePotential → Mode Toggle → PoolCount → SwipeCards
// ------------------------------------------------------------
"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Divider } from "@mui/material";

import DifficultyGrid, { gridToFilters } from "@/components/ui/DifficultyGrid";
import SwipeConfig from "@/components/ui/SwipeConfig";
import ClipScorePotential from "@/components/ui/ClipScorePotential";
import PoolCount from "@/components/ui/PoolCount";
import GameSetupDials from "@/components/ui/GameSetupDials";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import useClipQuiz from "@/hooks/useClipQuiz";
import { useGameContext } from "@/contexts/GameContext";
import { getFilteredSongCount } from "@/utils/dataFetching";
import PropTypes from "prop-types";

export default function ConfigTab({ isLandscape = false }) {
  const {
    primaryStyles,
    handleNumSongsChange,
    handleClipLengthChange,
    handleStylesChange,
    handleIncludeSingerChange,
  } = useClipQuiz();

  const { config, updateConfig } = useGameContext();

  const [poolCount, setPoolCount] = useState(0);
  const [poolLoading, setPoolLoading] = useState(false);

  const primaryFilterMode = config.primaryFilterMode || "level";

  // Grid selections for level mode (e.g., ["Icons-Famous", "Core-Known"])
  const gridCells = config.gridCells || ["Icons-Famous"];

  // Get active styles
  const activeStyles = Object.keys(config.styles || {}).filter(s => config.styles[s]);

  // Handle grid cell changes
  const handleGridChange = (newCells) => {
    updateConfig("gridCells", newCells);

    // Also update orchestraTiers and subTier for compatibility
    const { orchestraLevels, subTiers } = gridToFilters(newCells);

    // Map levels back to tier names for existing code
    const tierMap = { 1: "Big4", 2: "Classic" };
    const tiers = orchestraLevels.map(l => tierMap[l] || "Deep").filter((v, i, a) => a.indexOf(v) === i);
    updateConfig("orchestraTiers", tiers.length > 0 ? tiers : ["Big4"]);

    // Map subTiers back to single subTier (take first for now)
    updateConfig("subTier", subTiers[0] || "Classics");
  };

  // Fetch pool count when config changes
  useEffect(() => {
    const fetchCount = async () => {
      setPoolLoading(true);
      try {
        const options = {
          requireOrchestra: true,
          primaryFilterMode,
          styles: activeStyles,
          includeSinger: config.includeSinger ?? false,
        };

        if (primaryFilterMode === "level") {
          const { orchestraLevels, subTiers } = gridToFilters(gridCells);
          options.orchestraLevels = orchestraLevels;
          options.subTier = subTiers[0] || null;
        } else {
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
  }, [gridCells, config.periods, config.styles, config.includeSinger, primaryFilterMode, activeStyles]);

  // ─────────────────────────────────────────────────────────────
  // SWIPE CARDS
  // ─────────────────────────────────────────────────────────────

  // Card 1: Grid (Level mode) or Periods (Era mode)
  const Card1 = primaryFilterMode === "level" ? (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1 }}>
      <DifficultyGrid
        selectedCells={gridCells}
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

  // Card 2: Styles (row 1) + Singers toggle (row 2) + Avoid Vocals (row 3)
  const Card2 = (
    <Box sx={{ py: 1, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Row 1: Style buttons */}
      <StylesSelector
        availableStyles={primaryStyles}
        selectedStyles={config.styles || {}}
        onChange={handleStylesChange}
        showVocals={false}
      />

      {/* Row 2: Include songs with Singers */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          py: 1,
          px: 2,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
          Include songs with
        </Typography>
        <Box
          onClick={() => handleIncludeSingerChange(!(config.includeSinger ?? false))}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            border: `2px solid ${config.includeSinger ? "#CE93D8" : "rgba(255,255,255,0.3)"}`,
            backgroundColor: config.includeSinger ? "#CE93D8" : "transparent",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#CE93D8",
              backgroundColor: config.includeSinger ? "#CE93D8" : "rgba(206,147,216,0.2)",
            },
          }}
        >
          <Typography sx={{ fontSize: "1rem" }}>🎤</Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: config.includeSinger ? "#000" : "var(--foreground)",
            }}
          >
            Singers
          </Typography>
        </Box>
      </Box>

      {/* Row 3: Avoid singing sections (only shown when singers included) */}
      {config.includeSinger && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            py: 1,
            px: 2,
            mt: 1,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
            Avoid singing sections
          </Typography>
          <Box
            onClick={() => updateConfig("avoidVocals", !(config.avoidVocals ?? true))}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              border: `2px solid ${(config.avoidVocals ?? true) ? "#4CAF50" : "rgba(255,255,255,0.3)"}`,
              backgroundColor: (config.avoidVocals ?? true) ? "#4CAF50" : "transparent",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#4CAF50",
                backgroundColor: (config.avoidVocals ?? true) ? "#4CAF50" : "rgba(76,175,80,0.2)",
              },
            }}
          >
            <Typography sx={{ fontSize: "1rem" }}>🔇</Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: (config.avoidVocals ?? true) ? "#000" : "var(--foreground)",
              }}
            >
              {(config.avoidVocals ?? true) ? "YES" : "NO"}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Card 3: Dials (numSongs + clipLength)
  const Card3 = (
    <Box sx={{ py: 1 }}>
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        showSeconds={false}
        showClipLength
        clipLength={config.clipLength ?? 5}
        onClipLengthChange={handleClipLengthChange}
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
      <ClipScorePotential config={config} />

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
              backgroundColor: primaryFilterMode === "level" ? "#4DD0E1" : "#CE93D8",
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
};
