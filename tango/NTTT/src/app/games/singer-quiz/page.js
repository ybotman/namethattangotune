//--------
//src/app/games/singer-quiz/page.js
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

export default function SingerQuizPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const { config } = useGameContext();

  const handlePlayClick = useCallback(async () => {
    console.log("Singer Quiz config:", config);

    const numSongs = config.numSongs ?? 10;
    const artistLevels = config.levels || [];
    const recognitionTiers = config.recognitionTiers || [1, 2, 3];
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const chosenSingers = config.singers || [];

    // Fetch songs with singers (requireSinger = true)
    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      artistLevels,
      [], // composers
      [], // styles - not used for singer quiz
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      { requireSinger: true, singers: chosenSingers, recognitionTiers },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs with singers found for this configuration. Try different settings or wait for vocal analysis to complete.",
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

      {/* Header Section */}
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
          Singer
          <br />
          &gt; QUIZ &lt;
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
              src={`/icons/IconSinger.webp`}
              alt="Play Button"
              onClick={handlePlayClick}
              width={80}
              height={80}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 15px rgba(0, 123, 255, 0.5)",
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
