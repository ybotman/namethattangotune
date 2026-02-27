//--------
//src/app/games/singer-quiz/page.js
//--------

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

export default function SingerQuizPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const { config } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    console.log("Singer Quiz config:", config);

    const numSongs = config.numSongs ?? 10;
    const recognitionTiers = config.recognitionTiers || [1];
    const periods = config.periods || [];
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const chosenSingers = config.singers || [];

    // Fetch songs with singers (requireSinger = true)
    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy, no longer used
      [], // composers
      [], // styles - not used for singer quiz
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      { requireSinger: true, singers: chosenSingers, recognitionTiers, periods },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs with singers found for this configuration. Try different settings or wait for vocal analysis to complete.",
      );
      return;
    }

    // Track game setup and start
    trackGameSetup("singer-quiz", config);
    trackGameStart("singer-quiz", config);
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
          Singer Quiz
        </Typography>

        {/* Help + Play Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <HelpButton
            title="Singer Quiz"
            description="Identify the singer from a vocal clip. Filter by orchestra or specific singers. Clips start in vocal sections. Faster = more points."
          />
          <PlayButton onClick={handlePlayClick} />
        </Box>
      </Box>

      {/* Configuration Tab */}
      <ConfigTab />
    </Box>
  );
}
