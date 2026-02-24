"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ConfigTab from "./ConfigTab";
import QuizTab from "./QuizTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs, shuffleArray } from "@/utils/dataFetching";
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
        includeSinger: true,
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

    setSongs(shuffleArray(songsWithYear));
    setShowPlayTab(true);
  }, [config]);

  const handleClose = () => {
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

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          mt: 1,
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "var(--foreground)",
            mr: "auto",
          }}
        >
          Guess
          <br />
          the Year
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
              src="/icons/IconLearnDecade.webp"
              alt="Play"
              onClick={handlePlayClick}
              width={80}
              height={80}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 15px rgba(200, 150, 50, 0.5)",
                transition: "transform 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
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

      {/* Configuration */}
      <ConfigTab />
    </Box>
  );
}
