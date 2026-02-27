//-----------------------------------------------------------------------------
// src/app/games/singer-learn/page.js
//-----------------------------------------------------------------------------

"use client";

import React, { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import ConfigTab from "./ConfigTab";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function SingerLearnPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const {
    config,
    bestScore,
    totalScore,
    completedGames,
    resetAll,
    validConfig,
  } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    console.log("Singer Learn config:", config);

    const numSongs = config.numSongs ?? 10;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key],
    );
    const recognitionTiers = config.recognitionTiers || [1];
    const periods = config.periods || [];
    const chosenArtists = (config.artists || []).map((a) => a.value);
    // Extract singer values from objects
    const chosenSingers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : s.value
    );

    // Fetch songs with requireSinger: true for singer mode
    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy, no longer used
      [], // composers (not used)
      activeStyles,
      "", // candombe - empty = no filter
      "", // alternative - empty = no filter
      "", // cancion - empty = no filter
      numSongs,
      {
        requireSinger: true,
        singers: chosenSingers,
        yearRange: config.yearRange,
        duetFilter: config.duetFilter || "solo",
        recognitionTiers,
        periods,
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs with singers found for this configuration. Try different settings.",
      );
      return;
    }

    // Track game setup and start
    trackGameSetup("singer-learn", config);
    trackGameStart("singer-learn", config);
    enterGameMode();

    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config]);

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
          <PlayTab
            songs={songs}
            config={config}
            onCancel={handleClosePlayTab}
          />
        </Box>
      )}

      {/* Header - Title + Play Button (compact) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2,
          pt: 1,
          mb: 0,
        }}
      >
        {/* Game Title - Centered */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "var(--foreground)",
            textAlign: "center",
            mb: 0.5,
          }}
        >
          Mastering Singers
        </Typography>

        {/* Help + Play Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <HelpButton
            title="Mastering Singers"
            description="Learn mode for singers - no scoring! Clips start in vocal sections. Singer name displayed prominently. Filter by orchestra or specific singers."
          />
          <PlayButton onClick={handlePlayClick} />
        </Box>
      </Box>

      {/* Configuration Tab */}
      <ConfigTab />
    </Box>
  );
}
