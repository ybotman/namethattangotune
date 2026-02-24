"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ConfigTab from "./ConfigTab";
import ListenTab from "./ListenTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs, fetchAllArtists, shuffleArray } from "@/utils/dataFetching";
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
    const numSongs = config.numSongs ?? 30;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key],
    );
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const chosenSingers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : s.value
    );
    const instrumentalOnly = config.instrumentalOnly ?? false;

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
        includeSinger: !instrumentalOnly,
        requireSinger: chosenSingers.length > 0,
        singers: chosenSingers,
        yearRange: config.yearRange ?? [1929, 1939],
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs found for this configuration. Try different settings.");
      return;
    }

    // Shuffle for random order
    const shuffled = shuffleArray(fetchedSongs);
    setSongs(shuffled);
    setShowListenTab(true);
  }, [config]);

  const handleClose = () => {
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
          Listen
          <br />
          Mode
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
              src="/icons/IconLearnOrch.webp"
              alt="Listen"
              onClick={handlePlayClick}
              width={80}
              height={80}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 15px rgba(100, 200, 100, 0.5)",
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
              Listen
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Configuration */}
      <ConfigTab artistOptions={artistOptions} singerOptions={singerOptions} />
    </Box>
  );
}
