"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ConfigTab from "./ConfigTab";
import PlayButton from "@/components/ui/PlayButton";
import ListenTab from "./ListenTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs, fetchAllArtists, shuffleArray } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function ListenPage() {
  const [songs, setSongs] = useState([]);
  const [showListenTab, setShowListenTab] = useState(false);
  const [artistOptions, setArtistOptions] = useState([]);
  const [singerOptions, setSingerOptions] = useState([]);

  const { config } = useGameContext();

  // Load artist and singer options on mount
  useEffect(() => {
    (async () => {
      try {
        const artists = await fetchAllArtists();
        const activeArtists = artists
          .filter((a) => a.active === "true")
          .map((a) => ({ label: a.artist, value: a.artist }));
        setArtistOptions(activeArtists);

        // Load singers (no active filter - all singers available)
        const singerData = await fetch("/songData/SingerMaster.json").then((r) => r.json());
        const singerOpts = singerData
          .map((s) => ({ label: s.singer, value: s.singer }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setSingerOptions(singerOpts);
      } catch (err) {
        console.error("Error loading options:", err);
      }
    })();
  }, []);

  const handlePlayClick = useCallback(async () => {
    const numSongs = config.numSongs ?? 50;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key],
    );
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const chosenSingers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : s.value
    );
    const includeSinger = config.includeSinger ?? true;

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - not used in listen mode
      [], // composers
      activeStyles,
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      {
        includeSinger: includeSinger,
        requireSinger: chosenSingers.length > 0,
        singers: chosenSingers,
        periods: config.periods || [],
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs found for this configuration. Try different settings.");
      return;
    }

    // Track game setup and start
    trackGameSetup("listen", config);
    trackGameStart("listen", config);
    enterGameMode();

    // Shuffle for random order
    const shuffled = shuffleArray(fetchedSongs);
    setSongs(shuffled);
    setShowListenTab(true);
  }, [config]);

  const handleClose = () => {
    exitGameMode();
    setShowListenTab(false);
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
      {showListenTab && (
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
          <ListenTab songs={songs} onCancel={handleClose} />
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
          Listen Mode
        </Typography>

        {/* Play Button */}
        <PlayButton onClick={handlePlayClick} />
      </Box>

      {/* Configuration */}
      <ConfigTab artistOptions={artistOptions} singerOptions={singerOptions} />
    </Box>
  );
}
