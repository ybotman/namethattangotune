// ------------------------------------------------------------
// src/app/games/orchestra-quiz/page.js
// Swipeable config layout for orchestra quiz
// Layout: Title → Play → Mode → Summary → SwipeCards → Dots
// ------------------------------------------------------------

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Divider, useMediaQuery } from "@mui/material";
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
import styles from "./styles.module.css";

const MIN_POOL_SIZE = 20;

export default function OrchestraQuizPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);
  const [poolCount, setPoolCount] = useState(0);

  console.log("[OrchestraQuizPage] Render - showPlayTab:", showPlayTab);

  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Enter fullscreen + back button trap on page load
  useEffect(() => {
    enterGameMode();
    return () => exitGameMode();
  }, []);

  // Callback for ConfigTab to report pool count
  const handlePoolCountChange = useCallback((count) => {
    setPoolCount(count);
  }, []);

  // Get current filter settings
  const primaryFilterMode = config.primaryFilterMode || "level";
  const gridCells = config.gridCells || ["Icons-Famous"];
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];

  // Validation
  const hasPrimaryFilter = primaryFilterMode === "level"
    ? gridCells.length >= 1
    : periods.length >= 1;
  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = poolCount >= numSongs;
  const canPlay = hasPrimaryFilter && activeStyles.length >= 1 && hasEnoughSongs;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      const missing = [];
      if (primaryFilterMode === "level" && gridCells.length === 0) missing.push("Difficulty cell");
      if (primaryFilterMode === "era" && periods.length === 0) missing.push("Era");
      if (activeStyles.length === 0) missing.push("Style");
      if (!hasEnoughSongs) missing.push(`${numSongs} songs (only ${poolCount} available)`);
      alert(`Please select: ${missing.join(", ")}`);
      return;
    }

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

    trackGameSetup("orchestra-quiz", config);
    trackGameStart("orchestra-quiz", config);

    console.log("[OrchestraQuizPage] handlePlayClick: Got", fetchedSongs.length, "songs, setting showPlayTab=true");
    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config, canPlay, primaryFilterMode, gridCells, periods, activeStyles, hasEnoughSongs, numSongs, poolCount]);

  const handleClosePlayTab = () => {
    console.log("[OrchestraQuizPage] handleClosePlayTab: setting showPlayTab=false");
    setShowPlayTab(false);
  };

  return (
    <Box
      className={styles.container}
      sx={{
        color: "var(--foreground)",
        background: "var(--background)",
        minHeight: "100dvh",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
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
          <BackButton />
        </Box>
        <img
          src="/Banner/Type2__ORCHESTRA.png"
          alt="Orchestra Quiz"
          style={{
            width: "70%",
            maxWidth: 320,
            height: "auto",
            display: "block",
            maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskComposite: "source-in",
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
            title="Orchestra Quiz"
            description="Listen to a clip and guess which orchestra is playing. Select difficulty cells to control which orchestras and songs appear. Faster correct answers = higher scores."
          />
          <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
          <ResetButton onClick={resetAll} />
        </Box>

        {/* Config Area */}
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <ConfigTab isLandscape={isLandscape} onPoolCountChange={handlePoolCountChange} />
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
