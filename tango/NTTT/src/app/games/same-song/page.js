//-----------------------------------------------------------------------------
// src/app/games/same-song/page.js
// Same Song Comparison - Compare different recordings of the same song
// Uses local state only - does NOT persist to localStorage
//-----------------------------------------------------------------------------

"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  Divider,
  useMediaQuery,
} from "@mui/material";
import CompareTab from "./CompareTab";
import ConfigTab from "./ConfigTab";
import BackButton from "@/components/ui/BackButton";
import PlayButton from "@/components/ui/PlayButton";
import HelpButton from "@/components/ui/HelpButton";
import PulsingArrow from "@/components/ui/PulsingArrow";
import ResetButton from "@/components/ui/ResetButton";
import { fetchSongsGroupedByTitle } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import { enterGameMode, exitGameMode } from "@/hooks/useFullscreen";
import styles from "../styles.module.css";

// All periods and tiers - no filtering by default (except DNP which is handled in dataFetching)
const ALL_PERIODS = ["Old Guard", "New Guard", "Golden Age", "Decline", "Renaissance"];
const ALL_TIERS = [1, 2, 3, 4, 5];

export default function SameSongPage() {
  const [songGroups, setSongGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCompareTab, setShowCompareTab] = useState(false);
  const [loading, setLoading] = useState(true);

  // Detect landscape mode (min-width 768px AND landscape orientation)
  const isLandscape = useMediaQuery("(min-width: 768px) and (orientation: landscape)", { noSsr: true });

  // Enter fullscreen + back button trap on page load
  useEffect(() => {
    enterGameMode();
    return () => exitGameMode();
  }, []);

  // Local config state - always starts with all selected, never persisted
  const [config, setConfig] = useState({
    recognitionTiers: ALL_TIERS,
    periods: ALL_PERIODS,
    timeLimit: 15,
  });

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setConfig({
      recognitionTiers: ALL_TIERS,
      periods: ALL_PERIODS,
      timeLimit: 15,
    });
    setSelectedGroup(null);
  };

  // Fetch song groups on mount and when config changes
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      const groups = await fetchSongsGroupedByTitle({
        recognitionTiers: config.recognitionTiers,
        periods: config.periods,
        minRecordings: 2,
      });
      setSongGroups(groups);
      setLoading(false);
    };
    loadGroups();
  }, [config.recognitionTiers, config.periods]);

  // Validation: need song selection + at least 1 familiarity and 1 era
  const canPlay = selectedGroup && config.recognitionTiers?.length >= 1 && config.periods?.length >= 1;

  const handlePlayClick = useCallback(() => {
    if (!selectedGroup) {
      alert("Please select a song to compare");
      return;
    }
    if (!config.recognitionTiers?.length || !config.periods?.length) {
      alert("Please select at least 1 Familiarity and 1 Era to play.");
      return;
    }
    // Track game setup and start
    trackGameSetup("same-song", { ...config, selectedSong: selectedGroup.title });
    trackGameStart("same-song", { ...config, selectedSong: selectedGroup.title });
    setShowCompareTab(true);
  }, [selectedGroup, config]);

  const handleCloseCompareTab = () => {
    setShowCompareTab(false);
  };

  // Format option label with count
  const getOptionLabel = (option) => {
    if (!option) return "";
    return `${option.title} (${option.count} recordings)`;
  };

  // Song selector component (reused in both layouts)
  const SongSelector = () => (
    <Box sx={{ px: 2, mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, color: "var(--foreground)" }}>
        Select a song to compare recordings:
      </Typography>
      <Autocomplete
        options={songGroups}
        getOptionLabel={getOptionLabel}
        value={selectedGroup}
        onChange={(e, newValue) => setSelectedGroup(newValue)}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={loading ? "Loading songs..." : "Search for a song..."}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--foreground)",
                "& fieldset": { borderColor: "var(--accent)" },
                "&:hover fieldset": { borderColor: "var(--accent)" },
              },
              "& .MuiInputLabel-root": { color: "var(--foreground)" },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.title}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>{option.title}</Typography>
              <Chip
                label={`${option.count}`}
                size="small"
                color="warning"
              />
            </Box>
          </li>
        )}
        sx={{
          "& .MuiAutocomplete-paper": {
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          },
        }}
      />

      {selectedGroup && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedGroup.count} recordings by different orchestras
          </Typography>
        </Box>
      )}

      {!loading && songGroups.length > 0 && (
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "gray" }}>
          {songGroups.length} songs available with 2+ recordings
        </Typography>
      )}
    </Box>
  );

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
      <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <PulsingArrow gameId="same-song" />
        <HelpButton
          title="Same Song Compare"
          description="Compare different recordings of the same song! Select a song title, then hear how different orchestras interpreted it. Great for understanding orchestral styles."
        />
        <ResetButton onClick={handleReset} />
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
      {showCompareTab && selectedGroup && (
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
          <CompareTab
            songGroup={selectedGroup}
            config={config}
            onCancel={handleCloseCompareTab}
          />
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
          Same Song Compare
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
          {/* Left: Song Selector + Config */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              pr: 2,
            }}
          >
            <SongSelector />
            <ConfigTab config={config} updateConfig={updateConfig} />
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
                <PulsingArrow gameId="same-song" />
                <HelpButton
                  title="Same Song Compare"
                  description="Compare different recordings of the same song! Select a song title, then hear how different orchestras interpreted it. Great for understanding orchestral styles."
                />
              </Box>
              <PlayButton onClick={handlePlayClick} disabled={!canPlay} />
              <Box sx={{ position: "absolute", right: -65, display: "flex", alignItems: "center" }}>
                <ResetButton onClick={handleReset} />
              </Box>
            </Box>
            {!canPlay && (
              <Typography variant="caption" sx={{ color: "#FF9800", textAlign: "center", mt: 1 }}>
                {!selectedGroup
                  ? "Select a song to compare"
                  : `Select at least 1 ${[
                      !config.recognitionTiers?.length && "Familiarity",
                      !config.periods?.length && "Era"
                    ].filter(Boolean).join(", 1 ")}`
                }
              </Typography>
            )}
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Song Selector */}
          <Box sx={{ width: "100%" }}>
            <SongSelector />
          </Box>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Configuration Tab */}
          <Box sx={{ width: "100%" }}>
            <ConfigTab config={config} updateConfig={updateConfig} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
