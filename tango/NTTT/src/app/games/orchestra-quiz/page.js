//--------
//src/app/games/orchestra-quiz/page.js
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
import ScorePotential from "@/components/ui/ScorePotential";
import PlayTab from "./PlayTab";
import { useGameContext } from "@/contexts/GameContext";
import { fetchFilteredSongs } from "@/utils/dataFetching";
import { tiersToLevels } from "@/components/ui/OrchestraLevelSelector";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "./styles.module.css";

export default function ArtistQuizPage() {
  const [songs, setSongs] = useState([]);
  const [showPlayTab, setShowPlayTab] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Detect landscape mode (min-width 768px AND landscape orientation)
  // noSsr: true ensures it updates dynamically without needing refresh
  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  const { config, resetAll } = useGameContext();

  // Validation: need at least 1 orchestra tier, 1 style, 1 era
  // Orchestra mode uses orchestraTiers (Big4/Classic/Deep) which map to ArtistMaster levels
  const orchestraTiers = config.orchestraTiers?.length > 0 ? config.orchestraTiers : ["Big4"];
  const orchestraLevels = tiersToLevels(orchestraTiers); // Convert UI tiers to ArtistMaster levels
  const hasTiers = orchestraTiers.length >= 1;
  const activeStyles = Object.keys(config.styles || {}).filter((key) => config.styles[key]);
  const periods = config.periods || [];
  const subTier = config.subTier || null;

  const canPlay = hasTiers && activeStyles.length >= 1 && periods.length >= 1;

  const handlePlayClick = useCallback(async () => {
    if (!canPlay) {
      alert("Please select at least 1 Orchestra Level, 1 Style, and 1 Era to play.");
      return;
    }

    const numSongs = config.numSongs ?? 10;
    const chosenArtists = (config.artists || []).map((a) => a.value);
    const includeSinger = config.includeSinger ?? false;

    const { songs: fetchedSongs } = await fetchFilteredSongs(
      chosenArtists,
      [],
      [],
      activeStyles,
      "",
      "",
      "",
      numSongs,
      {
        includeSinger,
        // Orchestra mode: filter by ArtistMaster levels
        orchestraLevels,
        subTier,
        periods,
        requireOrchestra: true,
      },
    );

    if (!fetchedSongs || fetchedSongs.length === 0) {
      alert("No songs returned for this configuration. Try different settings.");
      return;
    }

    trackGameSetup("orchestra-quiz", config);
    trackGameStart("orchestra-quiz", config);
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
    if (!hasTiers) missing.push("Orchestra Level");
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
      {showScore && <ScorePotential config={config} />}
      <PlayButton onClick={handlePlayClick} disabled={!canPlay || (!isLandscape && showFilters)} />
      {!canPlay && (
        <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center" }}>
          {getValidationMessage()}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="orchestra-quiz" />
        <HelpButton
          title="Orchestra Quiz"
          description="Listen to a clip and guess which orchestra is playing. Filter by era, style, or specific orchestras. Faster correct answers = higher scores. Wrong guesses reduce points."
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
          Orchestra Quiz
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
                <PulsingArrow gameId="orchestra-quiz" />
                <HelpButton
                  title="Orchestra Quiz"
                  description="Listen to a clip and guess which orchestra is playing. Filter by era, style, or specific orchestras. Faster correct answers = higher scores. Wrong guesses reduce points."
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
