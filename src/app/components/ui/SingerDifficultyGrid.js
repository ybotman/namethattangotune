// ------------------------------------------------------------
// src/components/ui/SingerDifficultyGrid.js
// 3x3 grid for selecting Song Familiarity x Singer Level
// Rows: Song Recognition (Famous/Known/Obscure)
// Cols: Singer Level (Iconic/Essential/Standard)
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

// Singer Level (columns) - maps to SingerMaster levels
const SINGER_LEVELS = {
  Iconic: { levels: [1], label: "Iconic", color: "#CE93D8" },
  Essential: { levels: [2], label: "Essential", color: "#81C784" },
  Standard: { levels: [3], label: "Standard", color: "#FFD54F" },
};

// Song Familiarity (rows) - percentile within pool
const SONG_FAMILIARITY = {
  Famous: { min: 0.7, max: 1.0, label: "Famous" },
  Known: { min: 0.3, max: 0.7, label: "Common" },
  Obscure: { min: 0.0, max: 0.3, label: "Obscure" },
};

// Difficulty colors (diagonal gradient: cool top-left → hot bottom-right)
const DIFFICULTY_COLORS = {
  "Iconic-Famous":    "#00E676",   // Bright green - easiest
  "Iconic-Known":     "#69F0AE",   // Light green
  "Iconic-Obscure":   "#B2FF59",   // Lime
  "Essential-Famous": "#69F0AE",   // Light green
  "Essential-Known":  "#FFEE58",   // Yellow
  "Essential-Obscure":"#FFB74D",   // Orange
  "Standard-Famous":  "#B2FF59",   // Lime
  "Standard-Known":   "#FFB74D",   // Orange
  "Standard-Obscure": "#FF5252",   // Red - hardest
};

// Glow colors for selected cells
const GLOW_COLORS = {
  "Iconic-Famous":    "0 0 12px #00E676",
  "Iconic-Known":     "0 0 12px #69F0AE",
  "Iconic-Obscure":   "0 0 12px #B2FF59",
  "Essential-Famous": "0 0 12px #69F0AE",
  "Essential-Known":  "0 0 12px #FFEE58",
  "Essential-Obscure":"0 0 12px #FFB74D",
  "Standard-Famous":  "0 0 12px #B2FF59",
  "Standard-Known":   "0 0 12px #FFB74D",
  "Standard-Obscure": "0 0 12px #FF5252",
};

export { SINGER_LEVELS, SONG_FAMILIARITY };

/**
 * Convert grid selections to filter options
 * @param {string[]} selectedCells - e.g., ["Iconic-Famous", "Essential-Known"]
 * @returns {Object} - { singerLevels: number[], subTiers: string[] }
 */
export function singerGridToFilters(selectedCells) {
  const singerLevels = new Set();
  const subTiers = new Set();

  selectedCells.forEach(cell => {
    const [singer, familiarity] = cell.split("-");

    // Map singer to levels
    const singerConfig = SINGER_LEVELS[singer];
    if (singerConfig) {
      singerConfig.levels.forEach(l => singerLevels.add(l));
    }

    // Map familiarity to subTier name
    const subTierMap = { Famous: "Classics", Known: "Standards", Obscure: "DeepCuts" };
    if (subTierMap[familiarity]) {
      subTiers.add(subTierMap[familiarity]);
    }
  });

  return {
    singerLevels: Array.from(singerLevels).sort((a, b) => a - b),
    subTiers: Array.from(subTiers),
  };
}

/**
 * SingerDifficultyGrid - 3x3 clickable grid for singer games
 * Rows: Song Familiarity (Famous/Known/Obscure)
 * Cols: Singer Level (Iconic/Essential/Standard)
 */
export default function SingerDifficultyGrid({
  selectedCells = ["Iconic-Famous"],
  onChange,
  disabled = false,
  compact = false,
}) {
  const singerKeys = Object.keys(SINGER_LEVELS);
  const familiarityKeys = Object.keys(SONG_FAMILIARITY);

  const toggleCell = (cellKey) => {
    if (disabled) return;

    const isSelected = selectedCells.includes(cellKey);
    let newSelection;

    if (isSelected) {
      // Don't allow deselecting the last cell
      if (selectedCells.length === 1) return;
      newSelection = selectedCells.filter(c => c !== cellKey);
    } else {
      newSelection = [...selectedCells, cellKey];
    }

    onChange(newSelection);
  };

  const cellSize = compact ? 44 : 52;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Top axis label: SINGER */}
      <Typography
        sx={{
          fontSize: "0.6rem",
          fontWeight: 800,
          color: "#CE93D8",
          textTransform: "uppercase",
          letterSpacing: 2,
          mb: 0.5,
          ml: compact ? 6 : 7,
        }}
      >
        SINGER
      </Typography>

      {/* Column headers (Singer levels) */}
      <Box sx={{ display: "flex", ml: compact ? 6 : 7, mb: 0.5 }}>
        {singerKeys.map(singer => (
          <Typography
            key={singer}
            sx={{
              width: cellSize,
              textAlign: "center",
              fontSize: "0.55rem",
              fontWeight: 700,
              color: SINGER_LEVELS[singer].color,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mx: 0.25,
            }}
          >
            {SINGER_LEVELS[singer].label}
          </Typography>
        ))}
      </Box>

      {/* Main grid area */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Grid rows (Song Familiarity) */}
        <Box>
          {familiarityKeys.map(fam => (
            <Box key={fam} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              {/* Row label - 2 lines */}
              <Box
                sx={{
                  width: compact ? 50 : 56,
                  textAlign: "right",
                  pr: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    color: "var(--foreground)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    lineHeight: 1.2,
                  }}
                >
                  {SONG_FAMILIARITY[fam].label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.5rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    opacity: 0.6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    lineHeight: 1.2,
                  }}
                >
                  Songs
                </Typography>
              </Box>

              {/* Cells (Singer columns) */}
              {singerKeys.map(singer => {
                const cellKey = `${singer}-${fam}`;
                const isSelected = selectedCells.includes(cellKey);
                const bgColor = DIFFICULTY_COLORS[cellKey];
                const glowEffect = GLOW_COLORS[cellKey];

                return (
                  <Box
                    key={cellKey}
                    onClick={() => toggleCell(cellKey)}
                    sx={{
                      width: cellSize,
                      height: cellSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1.5,
                      border: `2px solid ${isSelected ? bgColor : `${bgColor}66`}`,
                      backgroundColor: isSelected ? bgColor : `${bgColor}15`,
                      boxShadow: isSelected ? glowEffect : "none",
                      cursor: disabled ? "default" : "pointer",
                      opacity: disabled ? 0.5 : 1,
                      transition: "all 0.2s ease",
                      mx: 0.25,
                      "&:hover": disabled ? {} : {
                        backgroundColor: isSelected ? bgColor : `${bgColor}40`,
                        transform: "scale(1.08)",
                        boxShadow: glowEffect,
                      },
                    }}
                  >
                    {isSelected && (
                      <Typography sx={{ fontSize: "1rem", color: "#000", fontWeight: 700 }}>✓</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend - visual gradient bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1.5,
        }}
      >
        <Typography sx={{ fontSize: "0.55rem", color: "#00E676", fontWeight: 600 }}>
          EASY
        </Typography>
        <Box
          sx={{
            width: 60,
            height: 6,
            borderRadius: 3,
            background: "linear-gradient(90deg, #00E676 0%, #FFEE58 50%, #FF5252 100%)",
          }}
        />
        <Typography sx={{ fontSize: "0.55rem", color: "#FF5252", fontWeight: 600 }}>
          HARD
        </Typography>
      </Box>
    </Box>
  );
}

SingerDifficultyGrid.propTypes = {
  selectedCells: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
};
