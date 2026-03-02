// ------------------------------------------------------------
// src/components/ui/ConfigSummary.js
// Compact summary of current game configuration
// Shows: Mode | Selections | Pool count
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Chip } from "@mui/material";

/**
 * ConfigSummary - Single line summary of game config
 */
export default function ConfigSummary({
  mode = "level", // "level" or "era"
  selections = [],
  styles = [],
  poolCount = 0,
  minPool = 20,
  includeVocals = false,
}) {
  const isValid = poolCount >= minPool;

  // Format selections for display
  const selectionText = selections.length > 0
    ? selections.slice(0, 3).join(", ") + (selections.length > 3 ? "..." : "")
    : "None";

  const styleText = styles.length > 0
    ? styles.join(", ")
    : "None";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        py: 1,
        px: 2,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Mode + Selections */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <Chip
          label={mode.toUpperCase()}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.6rem",
            fontWeight: 700,
            backgroundColor: mode === "level" ? "#4DD0E1" : "#CE93D8",
            color: "#000",
          }}
        />
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--foreground)",
            opacity: 0.9,
          }}
        >
          {selectionText}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.5 }}>|</Typography>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--foreground)",
            opacity: 0.9,
          }}
        >
          {styleText}
        </Typography>
        {includeVocals && (
          <Typography sx={{ fontSize: "0.7rem" }}>🎤</Typography>
        )}
      </Box>

      {/* Pool count */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: isValid ? "#4CAF50" : "#FF9800",
          }}
        />
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: isValid ? "#4CAF50" : "#FF9800",
          }}
        >
          {poolCount} songs
        </Typography>
        {!isValid && (
          <Typography
            sx={{
              fontSize: "0.6rem",
              color: "#FF9800",
              opacity: 0.8,
            }}
          >
            (need {minPool})
          </Typography>
        )}
      </Box>
    </Box>
  );
}

ConfigSummary.propTypes = {
  mode: PropTypes.oneOf(["level", "era"]),
  selections: PropTypes.arrayOf(PropTypes.string),
  styles: PropTypes.arrayOf(PropTypes.string),
  poolCount: PropTypes.number,
  minPool: PropTypes.number,
  includeVocals: PropTypes.bool,
};
