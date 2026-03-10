// ------------------------------------------------------------
// src/app/games/song-quiz/ConfigTab.js
// Swipeable config UI for song title quiz
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
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import useSongQuiz from "@/hooks/useSongQuiz";
import { useGameContext } from "@/contexts/GameContext";
import { getFilteredSongCount } from "@/utils/dataFetching";
import PropTypes from "prop-types";

export default function ConfigTab({ isLandscape = false, onPoolCountChange = null }) {
  const {
    primaryStyles,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
    handleIncludeSingerChange,
  } = useSongQuiz();

  const { config, updateConfig } = useGameContext();

  const [poolCount, setPoolCount] = useState(0);
  const [poolLoading, setPoolLoading] = useState(false);

  const primaryFilterMode = config.primaryFilterMode || "level";
  const recognitionTiers = config.recognitionTiers || [1];

  // Get active styles
  const activeStyles = Object.keys(config.styles || {}).filter(s => config.styles[s]);

  // Handle recognition tiers change
  const handleRecognitionChange = (tiers) => {
    updateConfig("recognitionTiers", tiers);
  };

  // Fetch pool count when config changes
  useEffect(() => {
    const fetchCount = async () => {
      setPoolLoading(true);
      try {
        const options = {
          primaryFilterMode,
          styles: activeStyles,
          includeSinger: config.includeSinger ?? true,
        };

        if (primaryFilterMode === "level") {
          options.recognitionTiers = recognitionTiers;
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
  }, [recognitionTiers, config.periods, config.styles, config.includeSinger, primaryFilterMode, activeStyles, onPoolCountChange]);

  // ─────────────────────────────────────────────────────────────
  // SWIPE CARDS
  // ─────────────────────────────────────────────────────────────

  // Card 1: Recognition Selector (Familiarity) or Periods (Era)
  const Card1 = primaryFilterMode === "level" ? (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
      <RecognitionSelector
        selectedTiers={recognitionTiers}
        onChange={handleRecognitionChange}
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

  // Card 2: Styles + Singers toggle
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
          onClick={() => handleIncludeSingerChange(!(config.includeSinger ?? true))}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            border: `2px solid ${(config.includeSinger ?? true) ? "#CE93D8" : "rgba(255,255,255,0.3)"}`,
            backgroundColor: (config.includeSinger ?? true) ? "#CE93D8" : "transparent",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#CE93D8",
              backgroundColor: (config.includeSinger ?? true) ? "#CE93D8" : "rgba(206,147,216,0.2)",
            },
          }}
        >
          <Typography sx={{ fontSize: "1rem" }}>🎤</Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: (config.includeSinger ?? true) ? "#000" : "var(--foreground)",
            }}
          >
            Singers
          </Typography>
        </Box>
      </Box>
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
    primaryFilterMode === "level" ? "FAME" : "ERA",
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
              backgroundColor: primaryFilterMode === "level" ? "#81C784" : "#4DD0E1",
              borderRadius: 2.5,
              transition: "transform 0.2s ease, background-color 0.2s ease",
              transform: primaryFilterMode === "level" ? "translateX(4px)" : "translateX(calc(100% - 4px))",
            }}
          />
          {/* FAME option */}
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
              FAME
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
