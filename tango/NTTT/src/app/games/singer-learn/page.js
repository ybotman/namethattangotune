//-----------------------------------------------------------------------------
// src/app/games/singer-learn/page.js
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
    const artistLevels = config.levels || [];
    const recognitionTiers = config.recognitionTiers || [1, 2, 3];
    const chosenArtists = (config.artists || []).map((a) => a.value);
    // Extract singer values from objects
    const chosenSingers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : s.value
    );

    // Fetch songs with requireSinger: true for singer mode
    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      artistLevels,
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
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs with singers found for this configuration. Try different settings.",
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

      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          mt: 1,
          mb: 2,
        }}
      >
        {/* Game Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "var(--foreground)",
            mr: "auto",
          }}
        >
          Mastering
          <br />
          Singers
        </Typography>

        {/* Play Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            ml: "-7rem",
            flex: "1",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Image
              src={`/icons/IconLearnSinger.webp`}
              alt="Play Button"
              onClick={handlePlayClick}
              width={80}
              height={80}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 15px rgba(255, 165, 0, 0.5)",
                transition: "transform 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <Typography
              variant="h5"
              sx={{
                mt: 1,
                color: "var(--accent)",
              }}
            >
              Play
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Configuration Tab */}
      <ConfigTab />
    </Box>
  );
}
