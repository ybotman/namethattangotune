//-----------------------------------------------------------------------------
//src/app/games/orchestra-learn/page.js
// Mastering Orchestras - Learn mode with orchestra selection
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

export default function ArtistLearnPage() {
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

  const handlePlayClick = useCallback(async () => {
    if (!config.selectedOrchestra) {
      alert("Please select an orchestra first");
      return;
    }

    const numSongs = config.numSongs ?? 10;
    const selectedStyle = config.selectedStyle || "Tango";
    const selectedEra = config.selectedEra || "Golden Age";
    const selectedOrchestra = config.selectedOrchestra;

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      [selectedOrchestra], // Single orchestra
      [],
      [],
      [selectedStyle], // Single style
      "",
      "",
      "",
      numSongs,
      {
        includeSinger: false, // Instrumental only
        periods: [selectedEra],
        requireOrchestra: true,
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs found for this configuration. Try a different orchestra.");
      return;
    }

    // Sort by year if option is enabled
    let finalSongs = fetchedSongs;
    if (config.sortByYear) {
      finalSongs = [...fetchedSongs].sort((a, b) => {
        const yearA = parseInt(a.Year, 10) || 0;
        const yearB = parseInt(b.Year, 10) || 0;
        return yearA - yearB;
      });
    }

    // Track game setup and start
    trackGameSetup("orchestra-learn", config);
    trackGameStart("orchestra-learn", config);

    setSongs(finalSongs);
    setShowPlayTab(true);
  }, [config]);

  const handleClosePlayTab = () => {
    setShowPlayTab(false);
  };

  // Play area component (reused in both layouts)
  const PlayArea = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        height: "100%",
      }}
    >
      <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.6, textAlign: "center" }}>
        Learn mode - no scoring!
      </Typography>
      <PlayButton onClick={handlePlayClick} disabled={!configValid} />
      {config.selectedOrchestra ? (
        <Typography
          variant="h6"
          sx={{
            color: "var(--accent)",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Selected: {config.selectedOrchestra}
        </Typography>
      ) : (
        <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center" }}>
          Select an Orchestra in Filters
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="orchestra-learn" />
        <HelpButton
          title="Mastering Orchestras"
          description="Learn mode - no scoring! Select ONE orchestra to focus on. Listen to their songs with title and year displayed. Use style/era filters to narrow down."
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
            // iOS PWA fix: explicitly capture all touch/pointer events
            touchAction: "auto",
            pointerEvents: "auto",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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
          Mastering Orchestras
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
                <PulsingArrow gameId="orchestra-learn" />
                <HelpButton
                  title="Mastering Orchestras"
                  description="Learn mode - no scoring! Select ONE orchestra to focus on. Listen to their songs with title and year displayed. Use style/era filters to narrow down."
                />
              </Box>
              <PlayButton onClick={handlePlayClick} disabled={!configValid} />
              <Box sx={{ position: "absolute", right: -65, display: "flex", alignItems: "center" }}>
                <ResetButton onClick={resetAll} />
              </Box>
            </Box>
            {config.selectedOrchestra ? (
              <Typography
                variant="h6"
                sx={{
                  color: "var(--accent)",
                  textAlign: "center",
                  fontWeight: "bold",
                  mt: 1,
                }}
              >
                Selected: {config.selectedOrchestra}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center", mt: 1 }}>
                Select an Orchestra in Filters
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
