//-----------------------------------------------------------------------------
// src/app/games/singer-learn/page.js
//-----------------------------------------------------------------------------

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Divider, useMediaQuery } from "@mui/material";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import PulsingArrow from "@/components/ui/PulsingArrow";
import ResetButton from "@/components/ui/ResetButton";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function SingerLearnPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);
  const [configValid, setConfigValid] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Detect landscape mode (min-width 768px AND landscape orientation)
  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Enter fullscreen + back button trap on page load
  useEffect(() => {
    enterGameMode();
    return () => exitGameMode();
  }, []);

  // Validation: need singer selected + at least 1 familiarity, 1 style, 1 era
  const recognitionTiers = config.recognitionTiers || [1];
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];
  const hasSinger = (config.singers || []).length >= 1;

  const canPlay = configValid && hasSinger && recognitionTiers.length >= 1 && activeStyles.length >= 1 && periods.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      alert("Please select a Singer, at least 1 Familiarity level, 1 Style, and 1 Era to play.");
      return;
    }
    console.log("Singer Learn config:", config);

    const numSongs = config.numSongs ?? 10;
    const activeStyles = Object.keys(config.styles || {}).filter(
      (key) => config.styles[key],
    );
    const recognitionTiers = config.recognitionTiers || [1];
    const periods = config.periods || [];
    const chosenArtists = (config.artists || []).map((a) => a.value);
    // Extract singer values from objects
    const chosenSingers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : s.value
    );

    // Fetch songs with requireSinger: true for singer mode
    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy, no longer used
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
        periods,
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs with singers found for this configuration. Try different settings.",
      );
      return;
    }

    // Track game setup and start
    trackGameSetup("singer-learn", config);
    trackGameStart("singer-learn", config);

    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config]);

  const handleClosePlayTab = () => {
    setShowPlayTab(false);
  };

  // Build validation message
  const getValidationMessage = () => {
    const missing = [];
    if (!hasSinger) missing.push("Singer");
    if (recognitionTiers.length === 0) missing.push("Familiarity");
    if (activeStyles.length === 0) missing.push("Style");
    if (periods.length === 0) missing.push("Era");
    if (missing.length === 0) return null;
    return `Select ${missing.join(", ")}`;
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
        Learn mode - no scoring!
      </Typography>
      <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
      {!canPlay && (
        <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center" }}>
          {getValidationMessage()}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="singer-learn" />
        <HelpButton
          title="Mastering Singers"
          description="Learn mode for singers - no scoring! Clips start in vocal sections. Singer name displayed prominently. Filter by orchestra or specific singers."
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
          Mastering Singers
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
            <ConfigTab onConfigValid={setConfigValid} showFilters={showFilters} setShowFilters={setShowFilters} isLandscape={isLandscape} />
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
                <PulsingArrow gameId="singer-learn" />
                <HelpButton
                  title="Mastering Singers"
                  description="Learn mode for singers - no scoring! Clips start in vocal sections. Singer name displayed prominently. Filter by orchestra or specific singers."
                />
              </Box>
              <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
              <Box sx={{ position: "absolute", right: -65, display: "flex", alignItems: "center" }}>
                <ResetButton onClick={resetAll} />
              </Box>
            </Box>
            {!canPlay && (
              <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center", mt: 1 }}>
                {getValidationMessage()}
              </Typography>
            )}
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Configuration Tab */}
          <Box sx={{ width: "100%" }}>
            <ConfigTab onConfigValid={setConfigValid} showFilters={showFilters} setShowFilters={setShowFilters} isLandscape={isLandscape} />
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />
        </Box>
      )}
    </Box>
  );
}
