// ------------------------------------------------------------
// src/components/ui/DifficultyGrid.js
// 3x3 grid for selecting Song Familiarity x Orchestra Level
// Rows: Song Recognition (Famous/Known/Obscure)
// Cols: Orchestra (Icons/Core/Niche)
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

// Orchestra Level (columns) - maps to ArtistMaster levels
const ORCHESTRA_LEVELS = {
  Icons: { levels: [1], label: "Icons", color: "#4DD0E1" },
  Core: { levels: [2], label: "Core", color: "#81C784" },
  Niche: { levels: [3, 4, 5], label: "Niche", color: "#FFD54F" },
};

// Song Familiarity (rows) - percentile within pool
const SONG_FAMILIARITY = {
  Famous: { min: 0.7, max: 1.0, label: "Famous" },
  Known: { min: 0.3, max: 0.7, label: "Known" },
  Obscure: { min: 0.0, max: 0.3, label: "Obscure" },
};

// Difficulty colors (diagonal gradient: cool top-left → hot bottom-right)
// Uses diagonal "heat" score: 0 = easiest, 4 = hardest
const DIFFICULTY_COLORS = {
  "Icons-Famous":  "#00E676",   // Bright green - easiest (heat 0)
  "Icons-Known":   "#69F0AE",   // Light green (heat 1)
  "Icons-Obscure": "#B2FF59",   // Lime (heat 2)
  "Core-Famous":   "#69F0AE",   // Light green (heat 1)
  "Core-Known":    "#FFEE58",   // Yellow (heat 2)
  "Core-Obscure":  "#FFB74D",   // Orange (heat 3)
  "Niche-Famous":  "#B2FF59",   // Lime (heat 2)
  "Niche-Known":   "#FFB74D",   // Orange (heat 3)
  "Niche-Obscure": "#FF5252",   // Red - hardest (heat 4)
};

// Glow colors for selected cells (more vibrant)
const GLOW_COLORS = {
  "Icons-Famous":  "0 0 12px #00E676",
  "Icons-Known":   "0 0 12px #69F0AE",
  "Icons-Obscure": "0 0 12px #B2FF59",
  "Core-Famous":   "0 0 12px #69F0AE",
  "Core-Known":    "0 0 12px #FFEE58",
  "Core-Obscure":  "0 0 12px #FFB74D",
  "Niche-Famous":  "0 0 12px #B2FF59",
  "Niche-Known":   "0 0 12px #FFB74D",
  "Niche-Obscure": "0 0 12px #FF5252",
};

export { ORCHESTRA_LEVELS, SONG_FAMILIARITY };

/**
 * Convert grid selections to filter options
 * @param {string[]} selectedCells - e.g., ["Icons-Famous", "Core-Known"]
 * @returns {Object} - { orchestraLevels: number[], subTiers: string[] }
 */
export function gridToFilters(selectedCells) {
  const orchestraLevels = new Set();
  const subTiers = new Set();

  selectedCells.forEach(cell => {
    const [orchestra, familiarity] = cell.split("-");

    // Map orchestra to levels
    const orchConfig = ORCHESTRA_LEVELS[orchestra];
    if (orchConfig) {
      orchConfig.levels.forEach(l => orchestraLevels.add(l));
    }

    // Map familiarity to subTier name
    // Famous -> Classics, Known -> Standards, Obscure -> DeepCuts
    const subTierMap = { Famous: "Classics", Known: "Standards", Obscure: "DeepCuts" };
    if (subTierMap[familiarity]) {
      subTiers.add(subTierMap[familiarity]);
    }
  });

  return {
    orchestraLevels: Array.from(orchestraLevels).sort((a, b) => a - b),
    subTiers: Array.from(subTiers),
  };
}

/**
 * DifficultyGrid - 3x3 clickable grid for Level mode
 * Rows: Song Familiarity (Famous/Known/Obscure)
 * Cols: Orchestra Level (Icons/Core/Niche)
 */
export default function DifficultyGrid({
  selectedCells = ["Icons-Famous"],
  onChange,
  disabled = false,
  compact = false,
}) {
  const orchestraKeys = Object.keys(ORCHESTRA_LEVELS);
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
      {/* Top axis label: ORCHESTRA */}
      <Typography
        sx={{
          fontSize: "0.5rem",
          fontWeight: 700,
          color: "var(--foreground)",
          opacity: 0.5,
          textTransform: "uppercase",
          letterSpacing: 2,
          mb: 0.5,
          ml: compact ? 5 : 6,
        }}
      >
        ORCHESTRA
      </Typography>

      {/* Column headers (Orchestra levels) */}
      <Box sx={{ display: "flex", ml: compact ? 5 : 6 }}>
        {orchestraKeys.map(orch => (
          <Typography
            key={orch}
            sx={{
              width: cellSize,
              textAlign: "center",
              fontSize: "0.6rem",
              fontWeight: 600,
              color: ORCHESTRA_LEVELS[orch].color,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {ORCHESTRA_LEVELS[orch].label}
          </Typography>
        ))}
      </Box>

      {/* Main grid area with vertical label */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Left axis label: SONG RECOGNITION (vertical) */}
        <Typography
          sx={{
            fontSize: "0.5rem",
            fontWeight: 700,
            color: "var(--foreground)",
            opacity: 0.5,
            textTransform: "uppercase",
            letterSpacing: 2,
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            mr: 0.5,
          }}
        >
          SONG
        </Typography>

        {/* Grid rows (Song Familiarity) */}
        <Box>
          {familiarityKeys.map(fam => (
            <Box key={fam} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              {/* Row label */}
              <Typography
                sx={{
                  width: compact ? 36 : 44,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  opacity: 0.7,
                  textAlign: "right",
                  pr: 1,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {SONG_FAMILIARITY[fam].label}
              </Typography>

              {/* Cells (Orchestra columns) */}
              {orchestraKeys.map(orch => {
                // Cell key format stays Orchestra-Familiarity for filter compatibility
                const cellKey = `${orch}-${fam}`;
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

DifficultyGrid.propTypes = {
  selectedCells: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
};
