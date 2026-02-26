//-----------------------------------------------------------------------------
// src/app/games/same-song/page.js
// Same Song Comparison - Compare different recordings of the same song
// Uses local state only - does NOT persist to localStorage
//-----------------------------------------------------------------------------

"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
} from "@mui/material";
import CompareTab from "./CompareTab";
import ConfigTab from "./ConfigTab";
import { fetchSongsGroupedByTitle } from "@/utils/dataFetching";
import { trackGameSetup, trackGameStart } from "@/utils/analytics";
import styles from "../styles.module.css";

// All periods and tiers - no filtering by default (except DNP which is handled in dataFetching)
const ALL_PERIODS = ["Old Guard", "New Guard", "Golden Age", "Decline", "Renaissance"];
const ALL_TIERS = [1, 2, 3, 4, 5];

export default function SameSongPage() {
  const [songGroups, setSongGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCompareTab, setShowCompareTab] = useState(false);
  const [loading, setLoading] = useState(true);

  // Local config state - always starts with all selected, never persisted
  const [config, setConfig] = useState({
    recognitionTiers: ALL_TIERS,
    periods: ALL_PERIODS,
    timeLimit: 15,
  });

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
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

  const handlePlayClick = useCallback(() => {
    if (!selectedGroup) {
      alert("Please select a song to compare");
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

  return (
    <Box
      className={styles.container}
      sx={{
        color: "var(--foreground)",
        background: "var(--background)",
        minHeight: "100vh",
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
          Same Song Compare
        </Typography>

        {/* Play Button - pulsing icon */}
        <Box
          onClick={handlePlayClick}
          sx={{
            cursor: selectedGroup ? "pointer" : "not-allowed",
            animation: selectedGroup ? "pulse 2s ease-in-out infinite" : "none",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 15px rgba(255, 165, 0, 0.5)" },
              "50%": { transform: "scale(1.08)", boxShadow: "0 0 25px rgba(255, 165, 0, 0.8)" },
            },
            borderRadius: "50%",
            display: "inline-block",
            opacity: selectedGroup ? 1 : 0.5,
          }}
        >
          <Image
            src={`/icons/IconLearnSongs.webp`}
            alt="Play"
            width={70}
            height={70}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      </Box>

      {/* Song Selector */}
      <Box sx={{ px: 2, mb: 3 }}>
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

      {/* Configuration Tab - receives local config */}
      <ConfigTab config={config} updateConfig={updateConfig} />
    </Box>
  );
}
