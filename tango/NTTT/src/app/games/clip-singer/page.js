// ------------------------------------------------------------
// src/app/games/clip-singer/page.js
// Swipeable config layout for clip singer quiz
// Layout: Banner → Play → SwipeConfig
// ------------------------------------------------------------

"use client";

import React, { useState, useCallback } from "react";
import { Box, Divider, useMediaQuery } from "@mui/material";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import ResetButton from "@/components/ui/ResetButton";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function ClipSingerPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);

  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Get current filter settings
  const primaryFilterMode = config.primaryFilterMode || "level";
  const recognitionTiers = config.recognitionTiers || [1];
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];

  // Validation
  const hasPrimaryFilter = primaryFilterMode === "level"
    ? recognitionTiers.length >= 1
    : periods.length >= 1;
  const canPlay = hasPrimaryFilter && activeStyles.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      const missing = [];
      if (primaryFilterMode === "level" && recognitionTiers.length === 0) missing.push("Familiarity level");
      if (primaryFilterMode === "era" && periods.length === 0) missing.push("Era");
      if (activeStyles.length === 0) missing.push("Style");
      alert(`Please select: ${missing.join(", ")}`);
      return;
    }

    const numSongs = config.numSongs ?? 10;
    const chosenSingers = config.singers || [];

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      [], // artistMasters
      [], // artistLevels
      [], // composers
      activeStyles,
      "", // candombe
      "", // alternative
      "", // cancion
      numSongs,
      {
        requireSinger: true,
        singers: chosenSingers,
        primaryFilterMode,
        recognitionTiers: primaryFilterMode === "level" ? recognitionTiers : [],
        periods: primaryFilterMode === "era" ? periods : [],
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs with singers found. Try different settings.");
      return;
    }

    trackGameSetup("clip-singer", config);
    trackGameStart("clip-singer", config);
    enterGameMode();

    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config, canPlay, primaryFilterMode, recognitionTiers, periods, activeStyles]);

  const handleClosePlayTab = () => {
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
      {/* PlayTab Overlay */}
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
          <PlayTab songs={songs} config={config} onCancel={handleClosePlayTab} />
        </Box>
      )}

      {/* Banner Image */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          pt: 1,
        }}
      >
        <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
          <BackButton href="/games/gamehub?page=2" />
        </Box>
        <img
          src="/Banner/Type2__SINGER.png"
          alt="Clip Singer Quiz"
          style={{
            width: "70%",
            maxWidth: 320,
            height: "auto",
            display: "block",
            maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskComposite: "source-in",
          }}
        />
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2,
          pb: 2,
        }}
      >
        {/* Play Button Area */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            my: 2,
          }}
        >
          <HelpButton
            title="Clip Quiz: Singer"
            description="Short vocal clips! Identify the singer from brief snippets. No time countdown - replay as needed. Great for training your ear on voice recognition."
          />
          <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
          <ResetButton onClick={resetAll} />
        </Box>

        {/* Config Area */}
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <ConfigTab isLandscape={isLandscape} />
        </Box>

        {/* Footer dash */}
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
            mt: 3,
          }}
        />
      </Box>
    </Box>
  );
}
