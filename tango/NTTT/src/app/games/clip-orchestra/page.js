// ------------------------------------------------------------
// src/app/games/clip-orchestra/page.js
// Swipeable config layout for clip orchestra quiz
// Layout: Banner → Play → SwipeConfig
// ------------------------------------------------------------

"use client";

import React, { useState, useCallback } from "react";
import { Box, Divider, useMediaQuery } from "@mui/material";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import ResetButton from "@/components/ui/ResetButton";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
import { gridToFilters } from "@/components/ui/DifficultyGrid";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function ClipOrchestraPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Get current filter settings
  const primaryFilterMode = config.primaryFilterMode || "level";
  const gridCells = config.gridCells || ["Icons-Famous"];
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];

  // Validation
  const hasPrimaryFilter = primaryFilterMode === "level"
    ? gridCells.length >= 1
    : periods.length >= 1;
  const canPlay = hasPrimaryFilter && activeStyles.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      const missing = [];
      if (primaryFilterMode === "level" && gridCells.length === 0) missing.push("Difficulty cell");
      if (primaryFilterMode === "era" && periods.length === 0) missing.push("Era");
      if (activeStyles.length === 0) missing.push("Style");
      alert(`Please select: ${missing.join(", ")}`);
      return;
    }

    const numSongs = config.numSongs ?? 10;
    const includeSinger = config.includeSinger ?? false;

    // Build filter options
    const options = {
      includeSinger,
      requireOrchestra: true,
      primaryFilterMode,
    };

    if (primaryFilterMode === "level") {
      const { orchestraLevels, subTiers } = gridToFilters(gridCells);
      options.orchestraLevels = orchestraLevels;
      options.subTier = subTiers[0] || "Classics";
    } else {
      options.periods = periods;
    }

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      [], // artistMasters
      [], // artistLevels
      [], // composers
      activeStyles,
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      options,
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs returned for this configuration. Try different settings.");
      return;
    }

    trackGameSetup("clip-orchestra", config);
    trackGameStart("clip-orchestra", config);
    enterGameMode();

    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config, canPlay, primaryFilterMode, gridCells, periods, activeStyles]);

  const handleClosePlayTab = () => {
    exitGameMode();
    setShowPlayTab(false);
  };

  return (
    <Box
      className={styles.container}
      sx={{
        color: "var(--foreground)",
        background: "var(--background)",
        minHeight: "100vh",
      }}
    >
      {/* PlayTab Overlay */}
      {showPlayTab && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "var(--background)",
            zIndex: 9999,
            overflow: "auto",
            p: 2,
          }}
        >
          <PlayTab songs={songs} config={config} onCancel={handleClosePlayTab} />
        </Box>
      )}

      {/* Banner Image - Smaller, centered, back button overlaid */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          pt: 1,
        }}
      >
        <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
          <BackButton href="/games/gamehub?page=1" />
        </Box>
        <img
          src="/Banner/Type1__ORCHESTRA.png"
          alt="Clip Orchestra Quiz"
          style={{
            width: "60%",
            maxWidth: 280,
            height: "auto",
            display: "block",
            borderRadius: 8,
          }}
        />
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2,
          pb: 2,
        }}
      >
        {/* Play Button Area */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            my: 2,
          }}
        >
          <HelpButton
            title="Clip Quiz: Orchestra"
            description="Short 5-second clips! Identify the orchestra quickly. No time countdown - just fast pattern recognition. Select difficulty cells to control which orchestras and songs appear."
          />
          <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
          <ResetButton onClick={resetAll} />
        </Box>

        <Divider sx={{ width: "80%", borderColor: "rgba(255,255,255,0.1)", mb: 2 }} />

        {/* Config Area */}
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <ConfigTab isLandscape={isLandscape} />
        </Box>

        {/* Footer dash */}
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
            mt: 3,
          }}
        />
      </Box>
    </Box>
  );
}
