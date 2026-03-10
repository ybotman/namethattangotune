"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Divider, useMediaQuery } from "@mui/material";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import PulsingArrow from "@/components/ui/PulsingArrow";
import ResetButton from "@/components/ui/ResetButton";
import QuizTab from "./QuizTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs, shuffleArray } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

export default function YearLearnPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Detect landscape mode (min-width 768px AND landscape orientation)
  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Enter fullscreen + back button trap on page load
  useEffect(() => {
    enterGameMode();
    return () => exitGameMode();
  }, []);

  // Validation: need at least 1 familiarity and 1 style (no era - that would be cheating!)
  const recognitionTiers = config.recognitionTiers || [1];
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);

  const canPlay = recognitionTiers.length >= 1 && activeStyles.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      alert("Please select at least 1 Familiarity level and 1 Style to play.");
      return;
    }

    const numSongs = config.numSongs ?? 10;

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
        includeSinger: config.includeSinger ?? true,
        recognitionTiers,
        // No era filter - would be a cheat for year guessing
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

    // Track game setup and start
    trackGameSetup("year-learn", config);
    trackGameStart("year-learn", config);

    setSongs(shuffleArray(songsWithYear));
    setShowPlayTab(true);
  }, [config]);

  const handleClose = () => {
    setShowPlayTab(false);
  };

  // Build validation message
  const getValidationMessage = () => {
    const missing = [];
    if (recognitionTiers.length === 0) missing.push("Familiarity");
    if (activeStyles.length === 0) missing.push("Style");
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
        Guess the year - within 3 years = 1 point
      </Typography>
      <PlayButton onClick={handlePlayClick} disabled={!canPlay || (!isLandscape && showFilters)} />
      {!canPlay && (
        <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center" }}>
          {getValidationMessage()}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="year-learn" />
        <HelpButton
          title="Guess the Year"
          description="Slide to guess the recording year! Uses a timeline slider. Points based on how close you get. Great for learning era characteristics."
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
            // iOS PWA fix: explicitly capture all touch/pointer events
            touchAction: "auto",
            pointerEvents: "auto",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <QuizTab songs={songs} config={config} onCancel={handleClose} />
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
          Guess the Year
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
                <PulsingArrow gameId="year-learn" />
                <HelpButton
                  title="Guess the Year"
                  description="Slide to guess the recording year! Uses a timeline slider. Points based on how close you get. Great for learning era characteristics."
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
