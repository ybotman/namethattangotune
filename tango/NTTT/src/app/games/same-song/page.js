//-----------------------------------------------------------------------------
// src/app/games/same-song/page.js
// Same Song Comparison - Compare different recordings of the same song
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
import { useGameContext } from "@/contexts/GameContext";
import { fetchSongsGroupedByTitle } from "@/utils/dataFetching";
import styles from "../styles.module.css";

export default function SameSongPage() {
  const [songGroups, setSongGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCompareTab, setShowCompareTab] = useState(false);
  const [loading, setLoading] = useState(true);

  const { config } = useGameContext();

  // Fetch song groups on mount and when config changes
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      const groups = await fetchSongsGroupedByTitle({
        recognitionTiers: config.recognitionTiers || [1],
        periods: config.periods || [],
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
    setShowCompareTab(true);
  }, [selectedGroup]);

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

      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          mt: 1,
          mb: 2,
        }}
      >
        {/* Game Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "var(--foreground)",
            mr: "auto",
          }}
        >
          Same Song
          <br />
          Compare
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
              src={`/icons/IconLearnSongs.webp`}
              alt="Compare Button"
              onClick={handlePlayClick}
              width={80}
              height={80}
              style={{
                cursor: selectedGroup ? "pointer" : "not-allowed",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: selectedGroup
                  ? "0 0 15px rgba(255, 165, 0, 0.5)"
                  : "none",
                opacity: selectedGroup ? 1 : 0.5,
                transition: "transform 0.2s",
              }}
              onMouseOver={(e) =>
                selectedGroup && (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <Typography
              variant="h5"
              sx={{
                mt: 1,
                color: selectedGroup ? "var(--accent)" : "gray",
              }}
            >
              Compare
            </Typography>
          </Box>
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

      {/* Configuration Tab */}
      <ConfigTab />
    </Box>
  );
}
