//-----------------------------------------------------------------------------
//src/app/games/artist-learn/page.js
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

  const {
    config,
    bestScore,
    totalScore,
    completedGames,
    resetAll,
    validConfig,
  } = useGameContext();

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

    // Build vocal filter options based on vocalFilter toggle
    const vocalFilter = config.vocalFilter || "instrumental";
    let vocalOptions = {};

    if (vocalFilter === "instrumental") {
      // Only instrumental (no vocals)
      vocalOptions = { includeSinger: false };
    } else if (vocalFilter === "solo") {
      // Only songs with solo singers
      vocalOptions = { requireSinger: true, duetFilter: "solo" };
    } else if (vocalFilter === "duetsOnly") {
      // Only songs with duet singers
      vocalOptions = { requireSinger: true, duetFilter: "duetsOnly" };
    } else {
      // "all" - include everything
      vocalOptions = { includeSinger: true };
    }

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy, no longer used
      [], // composers
      activeStyles,
      "", // candombe - empty = no filter
      "", // alternative - empty = no filter
      "", // cancion - empty = no filter
      numSongs,
      { ...vocalOptions, yearRange: config.yearRange, recognitionTiers, periods, requireOrchestra: true },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs returned for this configuration. Try different settings.",
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
          Mastering Orchestras
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
      <ConfigTab />
    </Box>
  );
}
