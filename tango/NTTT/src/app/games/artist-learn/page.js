//-----------------------------------------------------------------------------
//src/app/games/artist-learn/page.js
// Mastering Orchestras - Learn mode with orchestra selection
//-----------------------------------------------------------------------------

"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ConfigTab from "./ConfigTab";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
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
          Mastering Orchestras
        </Typography>

        {/* Play Button - pulsing only when valid */}
        <Box
          onClick={configValid ? handlePlayClick : undefined}
          sx={{
            cursor: configValid ? "pointer" : "not-allowed",
            animation: configValid ? "pulse 2s ease-in-out infinite" : "none",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 15px rgba(0, 123, 255, 0.5)" },
              "50%": { transform: "scale(1.08)", boxShadow: "0 0 25px rgba(0, 123, 255, 0.8)" },
            },
            borderRadius: "50%",
            display: "inline-block",
            opacity: configValid ? 1 : 0.4,
            filter: configValid ? "none" : "grayscale(50%)",
          }}
        >
          <Image
            src={`/icons/IconLearnOrch.webp`}
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
      <ConfigTab onConfigValid={setConfigValid} />
    </Box>
  );
}
