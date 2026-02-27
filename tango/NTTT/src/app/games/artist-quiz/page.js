//--------
//src/app/games/artist-quiz/page.js
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
import styles from "./styles.module.css";

export default function ArtistQuizPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const { config } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    console.log(config);

    const numSongs = config.numSongs ?? 10;
    const timeLimit = config.timeLimit ?? 15;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key],
    );
    const recognitionTiers = config.recognitionTiers || [1];
    const periods = config.periods || [];
    const chosenArtists = (config.artists || []).map((a) => a.value);

    const includeSinger = config.includeSinger ?? false;

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy, no longer used
      [], // composers
      activeStyles,
      "", // candombe - empty = no filter
      "", // alternative - empty = no filter
      "", // cancion - empty = no filter
      numSongs,
      { includeSinger, recognitionTiers, periods, requireOrchestra: true },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs returned for this configuration. Try different settings.",
      );
      return;
    }

    // Track game setup and start
    trackGameSetup("artist-quiz", config);
    trackGameStart("artist-quiz", config);

    // Enter fullscreen + back trap for immersive gameplay
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
          Orchestra Quiz
        </Typography>

        {/* Play Button (centered) + Help Button (left) */}
        <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <Box sx={{ position: "absolute", left: -50 }}>
            <HelpButton
              title="Orchestra Quiz"
              description="Listen to a clip and guess which orchestra is playing. Filter by era, style, or specific orchestras. Faster correct answers = higher scores. Wrong guesses reduce points."
            />
          </Box>
          <PlayButton onClick={handlePlayClick} />
        </Box>
      </Box>

      {/* Configuration Tab */}
      <ConfigTab />
    </Box>
  );
}
