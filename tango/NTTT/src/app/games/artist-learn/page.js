//-----------------------------------------------------------------------------
//src/app/games/artist-learn/page.js
// Mastering Orchestras - Learn mode with orchestra selection
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

export default function ArtistLearnPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);
  const [configValid, setConfigValid] = useState(false);

  const { config } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    if (!config.selectedOrchestra) {
      alert("Please select an orchestra first");
      return;
    }

    const numSongs = config.numSongs ?? 10;
    const selectedStyle = config.selectedStyle || "Tango";
    const selectedEra = config.selectedEra || "Golden Age";
    const selectedOrchestra = config.selectedOrchestra;

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      [selectedOrchestra], // Single orchestra
      [],
      [],
      [selectedStyle], // Single style
      "",
      "",
      "",
      numSongs,
      {
        includeSinger: false, // Instrumental only
        periods: [selectedEra],
        requireOrchestra: true,
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs found for this configuration. Try a different orchestra.");
      return;
    }

    // Sort by year if option is enabled
    let finalSongs = fetchedSongs;
    if (config.sortByYear) {
      finalSongs = [...fetchedSongs].sort((a, b) => {
        const yearA = parseInt(a.Year, 10) || 0;
        const yearB = parseInt(b.Year, 10) || 0;
        return yearA - yearB;
      });
    }

    // Track game setup and start
    trackGameSetup("artist-learn", config);
    trackGameStart("artist-learn", config);
    enterGameMode();

    setSongs(finalSongs);
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
          Mastering Orchestras
        </Typography>

        {/* Play Button (centered) + Help Button (left) */}
        <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <Box sx={{ position: "absolute", left: -50 }}>
            <HelpButton
              title="Mastering Orchestras"
              description="Learn mode - no scoring! Select ONE orchestra to focus on. Listen to their songs with title and year displayed. Use style/era filters to narrow down."
            />
          </Box>
          <PlayButton onClick={handlePlayClick} disabled={!configValid} />
        </Box>
      </Box>

      {/* Configuration Tab */}
      <ConfigTab onConfigValid={setConfigValid} />
    </Box>
  );
}
