//--------
//src/app/games/clip-orchestra/page.js
//--------

"use client";

import React, { useState, useCallback } from "react";
import { Box, Typography, Divider, useMediaQuery } from "@mui/material";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import PulsingArrow from "@/components/ui/PulsingArrow";
import ResetButton from "@/components/ui/ResetButton";
import ClipScorePotential from "@/components/ui/ClipScorePotential";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function ClipOrchestraPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Detect landscape mode (min-width 768px AND landscape orientation)
  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Validation: need at least 1 familiarity, 1 style, 1 era
  const recognitionTiers = config.recognitionTiers || [1];
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];

  const canPlay = recognitionTiers.length >= 1 && activeStyles.length >= 1 && periods.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      alert("Please select at least 1 Familiarity level, 1 Style, and 1 Era to play.");
      return;
    }

    console.log("Clip Orchestra config:", config);

    const numSongs = config.numSongs ?? 10;
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const includeSinger = config.includeSinger ?? false;

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [], // artistLevels - legacy, no longer used
      [], // composers
      activeStyles,
      "", // candombe - empty = no filter
      "", // alternative - empty = no filter
      "", // cancion - empty = no filter
      numSongs,
      { includeSinger, recognitionTiers, periods, requireOrchestra: true },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert(
        "No songs returned for this configuration. Try different settings.",
      );
      return;
    }

    // Track game setup and start
    trackGameSetup("clip-orchestra", config);
    trackGameStart("clip-orchestra", config);
    enterGameMode();

    setSongs(fetchedSongs);
    setShowPlayTab(true);
  }, [config]);

  const handleClosePlayTab = () => {
    exitGameMode();
    setShowPlayTab(false);
  };

  // Build validation message
  const getValidationMessage = () => {
    const missing = [];
    if (recognitionTiers.length === 0) missing.push("Familiarity");
    if (activeStyles.length === 0) missing.push("Style");
    if (periods.length === 0) missing.push("Era");
    if (missing.length === 0) return null;
    return `Select at least 1 ${missing.join(", 1 ")}`;
  };

  // Play area component (reused in both layouts)
  const PlayArea = ({ showScore = false }) => (
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
      {showScore && <ClipScorePotential config={config} />}
      <PlayButton onClick={handlePlayClick} disabled={!canPlay || (!isLandscape && showFilters)} />
      {!canPlay && (
        <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center" }}>
          {getValidationMessage()}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="clip-orchestra" />
        <HelpButton
          title="Clip Quiz: Orchestra"
          description="Short 5-second clips! Identify the orchestra quickly. No time countdown - just fast pattern recognition. Filter by era or style."
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
          <BackButton href="/games/gamehub?page=1" />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "var(--foreground)",
            textAlign: "center",
          }}
        >
          Clip Quiz: Orchestra
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
          {/* Left: Config (all filters visible) */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              pr: 2,
            }}
          >
            <ConfigTab showFilters={true} setShowFilters={() => {}} isLandscape={true} />
          </Box>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 1 }}
          />

          {/* Right: Play Area with Score */}
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
            <PlayArea showScore={true} />
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
                <PulsingArrow gameId="clip-orchestra" />
                <HelpButton
                  title="Clip Quiz: Orchestra"
                  description="Short 5-second clips! Identify the orchestra quickly. No time countdown - just fast pattern recognition. Filter by era or style."
                />
              </Box>
              <PlayButton onClick={handlePlayClick} disabled={!canPlay || showFilters} />
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

          {/* Config with animated Levels toggle */}
          <Box sx={{ width: "100%" }}>
            <ConfigTab showFilters={showFilters} setShowFilters={setShowFilters} isLandscape={false} />
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />
        </Box>
      )}
    </Box>
  );
}
