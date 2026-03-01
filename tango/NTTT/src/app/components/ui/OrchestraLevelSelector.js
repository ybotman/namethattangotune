// ------------------------------------------------------------
// src/components/ui/OrchestraLevelSelector.js
// Orchestra level selector for orchestra games
// UI shows 3 tiers, maps to 5-level ArtistMaster data
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";

// UI shows 3 tiers with 🌶 icons, each maps to ArtistMaster level(s)
// More chilis = more orchestras = harder to identify
const ORCHESTRA_TIERS = {
  "Big4": {
    name: "Big 4",
    icon: "🌶",
    color: "#4DD0E1",
    levels: [1],  // ArtistMaster level 1
    tooltip: "The Big 4: D'Arienzo, Di Sarli, Troilo, Pugliese"
  },
  "Classic": {
    name: "Classic",
    icon: "🌶🌶",
    color: "#81C784",
    levels: [2],  // ArtistMaster level 2
    tooltip: "Golden Age Classics: Canaro, Biagi, Tanturi, Caló..."
  },
  "Deep": {
    name: "Deep",
    icon: "🌶🌶🌶",
    color: "#FFD54F",
    levels: [3, 4, 5],  // ArtistMaster levels 3, 4, 5 combined
    tooltip: "Deep Cuts: 40+ orchestras"
  },
};

// Sub-tiers for granular filtering within each level
const SUB_TIERS = {
  Classics: { label: "Classics", vibe: "Top 30%" },
  Standards: { label: "Standards", vibe: "Middle 40%" },
  DeepCuts: { label: "Deep Cuts", vibe: "Bottom 30%" },
};

export { ORCHESTRA_TIERS, SUB_TIERS };

/**
 * Convert UI tier selections to ArtistMaster level array
 * @param {string[]} selectedTiers - e.g., ["Big4", "Essential"]
 * @returns {number[]} - e.g., [1, 2]
 */
export function tiersToLevels(selectedTiers) {
  const levels = new Set();
  selectedTiers.forEach(tier => {
    const config = ORCHESTRA_TIERS[tier];
    if (config) {
      config.levels.forEach(l => levels.add(l));
    }
  });
  return Array.from(levels).sort((a, b) => a - b);
}

/**
 * OrchestraLevelSelector
 * - 3 UI tiers: Big 4, Essential, Deep
 * - Maps to 5-level ArtistMaster data internally
 * - Optional sub-tier selector: Classics, Standards, DeepCuts
 */
export default function OrchestraLevelSelector({
  selectedTiers = ["Big4"],
  onChange,
  selectedSubTier = null,
  onSubTierChange,
  showSubTiers = false,
  disabled = false,
  compact = false,
}) {
  const toggleTier = (tierKey) => {
    if (disabled) return;
    const newSelection = selectedTiers.includes(tierKey)
      ? selectedTiers.filter((t) => t !== tierKey)
      : [...selectedTiers, tierKey];

    // Ensure at least one tier is selected
    if (newSelection.length === 0) return;
    onChange(newSelection);
  };

  const handleSubTierChange = (event, newSubTier) => {
    if (onSubTierChange) {
      onSubTierChange(newSubTier);
    }
  };

  const blockSize = compact ? 36 : 44;

  return (
    <Box sx={{ mb: compact ? 1 : 2 }}>
      {/* Title */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "var(--foreground)",
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: 2,
          fontSize: "0.7rem",
          fontWeight: 700,
          opacity: 0.8,
        }}
      >
        Orchestra Level
      </Typography>

      {/* 3 Tier Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1.5,
          mb: showSubTiers ? 1.5 : 0,
        }}
      >
        {Object.entries(ORCHESTRA_TIERS).map(([tierKey, config]) => {
          const isSelected = selectedTiers.includes(tierKey);

          return (
            <Tooltip key={tierKey} title={config.tooltip} arrow placement="top">
              <Box
                onClick={() => toggleTier(tierKey)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: disabled ? "default" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {/* Block with chili icon */}
                <Box
                  sx={{
                    minWidth: blockSize,
                    height: blockSize,
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    backgroundColor: isSelected ? config.color : "transparent",
                    border: `2px solid ${config.color}`,
                    transition: "all 0.15s ease",
                    "&:hover": disabled
                      ? {}
                      : {
                          backgroundColor: isSelected ? config.color : `${config.color}33`,
                          transform: "scale(1.05)",
                        },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: compact ? "1rem" : "1.2rem",
                      filter: isSelected ? "none" : "grayscale(50%)",
                    }}
                  >
                    {config.icon}
                  </Typography>
                </Box>

                {/* Label */}
                <Typography
                  sx={{
                    fontSize: "0.55rem",
                    mt: 0.3,
                    color: isSelected ? config.color : "var(--foreground)",
                    opacity: isSelected ? 1 : 0.5,
                    fontWeight: isSelected ? 600 : 400,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {config.name}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Sub-Tier Selector (optional) */}
      {showSubTiers && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={selectedSubTier}
            exclusive
            onChange={handleSubTierChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: "var(--foreground)",
                borderColor: "rgba(255,255,255,0.3)",
                fontSize: "0.65rem",
                py: 0.3,
                px: 1.5,
                textTransform: "none",
                "&.Mui-selected": {
                  backgroundColor: "var(--accent)",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "var(--accent)",
                  },
                },
              },
            }}
          >
            <ToggleButton value="Classics">Classics</ToggleButton>
            <ToggleButton value="Standards">Standards</ToggleButton>
            <ToggleButton value="DeepCuts">Deep Cuts</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
    </Box>
  );
}

OrchestraLevelSelector.propTypes = {
  selectedTiers: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  selectedSubTier: PropTypes.string,
  onSubTierChange: PropTypes.func,
  showSubTiers: PropTypes.bool,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
};
