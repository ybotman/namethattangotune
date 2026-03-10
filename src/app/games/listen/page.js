"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Divider, useMediaQuery } from "@mui/material";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import PulsingArrow from "@/components/ui/PulsingArrow";
import ResetButton from "@/components/ui/ResetButton";
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

  // Detect landscape mode (min-width 768px AND landscape orientation)
  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Enter fullscreen + back button trap on page load
  useEffect(() => {
    enterGameMode();
    return () => exitGameMode();
  }, []);

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
        if (Array.isArray(singerData)) {
          const singerOpts = singerData
            .map((s) => ({ label: s.singer, value: s.singer }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setSingerOptions(singerOpts);
        }
      } catch (err) {
        console.error("Error loading options:", err);
      }
    })();
  }, []);

  // Validation: need at least 1 style and 1 era
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];

  const canPlay = activeStyles.length >= 1 && periods.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      alert("Please select at least 1 Style and 1 Era to play.");
      return;
    }

    const numSongs = config.numSongs ?? 50;
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

    // Shuffle for random order
    const shuffled = shuffleArray(fetchedSongs);
    setSongs(shuffled);
    setShowListenTab(true);
  }, [config]);

  const handleClose = () => {
    setShowListenTab(false);
  };

  // Build validation message
  const getValidationMessage = () => {
    const missing = [];
    if (activeStyles.length === 0) missing.push("Style");
    if (periods.length === 0) missing.push("Era");
    if (missing.length === 0) return null;
    return `Select at least 1 ${missing.join(", 1 ")}`;
  };

  // Play area component (reused in both layouts)
  const PlayArea = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        height: "100%",
      }}
    >
      <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.6, textAlign: "center" }}>
        Pure listening - no quizzes!
      </Typography>
      <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
      {!canPlay && (
        <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center" }}>
          {getValidationMessage()}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="listen" />
        <HelpButton
          title="Listen Mode"
          description="Pure listening - no quizzes! Auto-plays through songs with full info displayed. Filter by orchestra, singer, style, or era. Great for passive learning."
        />
        <ResetButton onClick={resetAll} />
      </Box>
    </Box>
  );

  return (
    <Box
      className={styles.container}
      sx={{
        color: "var(--foreground)",
        background: "var(--background)",
        minHeight: "100dvh",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
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
            // iOS PWA fix: explicitly capture all touch/pointer events
            touchAction: "auto",
            pointerEvents: "auto",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <ListenTab songs={songs} onCancel={handleClose} />
        </Box>
      )}

      {/* Header: Back button + Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          pt: 1,
          mb: 1,
        }}
      >
        <Box sx={{ position: "absolute", left: 8 }}>
          <BackButton />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "var(--foreground)",
            textAlign: "center",
          }}
        >
          Listen Mode
        </Typography>
      </Box>

      {isLandscape ? (
        // LANDSCAPE LAYOUT: Two columns
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            height: "calc(100vh - 60px)",
            px: 2,
          }}
        >
          {/* Left: Config */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              pr: 2,
            }}
          >
            <ConfigTab artistOptions={artistOptions} singerOptions={singerOptions} />
          </Box>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 1 }}
          />

          {/* Right: Play Area */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pl: 2,
              height: "100%",
            }}
          >
            <PlayArea />
          </Box>
        </Box>
      ) : (
        // PORTRAIT LAYOUT: Vertical stack with justified spacing
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            minHeight: "calc(100vh - 60px)",
            px: 2,
          }}
        >
          {/* Play Button area */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <Box sx={{ position: "absolute", left: -65, display: "flex", alignItems: "center" }}>
                <PulsingArrow gameId="listen" />
                <HelpButton
                  title="Listen Mode"
                  description="Pure listening - no quizzes! Auto-plays through songs with full info displayed. Filter by orchestra, singer, style, or era. Great for passive learning."
                />
              </Box>
              <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
              <Box sx={{ position: "absolute", right: -65, display: "flex", alignItems: "center" }}>
                <ResetButton onClick={resetAll} />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Configuration */}
          <Box sx={{ width: "100%" }}>
            <ConfigTab artistOptions={artistOptions} singerOptions={singerOptions} />
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />
        </Box>
      )}
    </Box>
  );
}
