//--------
//src/app/games/song-quiz/page.js
// Song Title Quiz - Guess the song title
//--------

"use client";

import React, { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import ConfigTab from "./ConfigTab";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
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

    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config]);

  const handleClosePlayTab = () => {
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

        {/* Play Button - pulsing icon */}
        <Box
          onClick={handlePlayClick}
          sx={{
            cursor: "pointer",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 15px rgba(0, 123, 255, 0.5)" },
              "50%": { transform: "scale(1.08)", boxShadow: "0 0 25px rgba(0, 123, 255, 0.8)" },
            },
            borderRadius: "50%",
            display: "inline-block",
          }}
        >
          <Image
            src={`/icons/IconLearnSongs.webp`}
            alt="Play"
            width={70}
            height={70}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      </Box>

      {/* Configuration Tab */}
      <ConfigTab />
    </Box>
  );
}
