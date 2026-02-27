//--------
//src/app/games/song-quiz/page.js
// Song Title Quiz - Guess the song title
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

export default function SongQuizPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const { config } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    console.log("Song Quiz config:", config);

    const numSongs = config.numSongs ?? 10;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key]
    );
    const recognitionTiers = config.recognitionTiers || [1];
    const periods = config.periods || [];
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const includeSinger = config.includeSinger ?? true; // Default true for song quiz

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy
      [], // composers
      activeStyles,
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      { includeSinger, recognitionTiers, periods }
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs returned for this configuration. Try different settings."
      );
      return;
    }

    // Track game setup and start
    trackGameSetup("song-quiz", config);
    trackGameStart("song-quiz", config);
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
          Song Title Quiz
        </Typography>

        {/* Play Button (centered) + Help Button (left) */}
        <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <Box sx={{ position: "absolute", left: -50 }}>
            <HelpButton
              title="Song Title Quiz"
              description="Guess the song title from a clip. Filter by style, era, or orchestra. Great for learning classic tango repertoire."
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
