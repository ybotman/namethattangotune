"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ConfigTab from "./ConfigTab";
import QuizTab from "./QuizTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs, shuffleArray } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function YearLearnPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const { config } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    const numSongs = config.numSongs ?? 10;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key],
    );

    const recognitionTiers = config.recognitionTiers || [1];

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      [], // artists
      [], // levels
      [], // composers
      activeStyles.length > 0 ? activeStyles : [], // styles
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      {
        includeSinger: config.includeSinger ?? true,
        recognitionTiers,
        // No era filter - would be a cheat for year guessing
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs found. Try different settings.");
      return;
    }

    // Filter out songs without year data
    const songsWithYear = fetchedSongs.filter((s) => {
      const year = parseInt(s.Year, 10);
      return !isNaN(year) && year >= 1916 && year <= 2023;
    });

    if (songsWithYear.length === 0) {
      alert("No songs with year data found. Try different settings.");
      return;
    }

    // Track game setup and start
    trackGameSetup("year-learn", config);
    trackGameStart("year-learn", config);
    enterGameMode();

    setSongs(shuffleArray(songsWithYear));
    setShowPlayTab(true);
  }, [config]);

  const handleClose = () => {
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
          }}
        >
          <QuizTab songs={songs} config={config} onCancel={handleClose} />
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
          Guess the Year
        </Typography>

        {/* Play Button - pulsing icon */}
        <Box
          onClick={handlePlayClick}
          sx={{
            cursor: "pointer",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 15px rgba(200, 150, 50, 0.5)" },
              "50%": { transform: "scale(1.08)", boxShadow: "0 0 25px rgba(200, 150, 50, 0.8)" },
            },
            borderRadius: "50%",
            display: "inline-block",
          }}
        >
          <Image
            src="/icons/IconLearnDecade.webp"
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

      {/* Configuration */}
      <ConfigTab />
    </Box>
  );
}
