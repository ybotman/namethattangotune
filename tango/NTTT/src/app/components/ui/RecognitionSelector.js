// ------------------------------------------------------------
// src/components/ui/RecognitionSelector.js
// v3 - Updated for 4-tier familiarity system with discrete sub-tiers
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";

// NEW v3: 4-tier familiarity system with 🎵 icons
// More notes = deeper cuts = harder to recognize
const FAMILIARITY_TIERS = {
  Iconic: {
    icon: "🎵",
    color: "#4DD0E1",
    order: 1,
    tooltip: "Iconic: Every tango dancer knows these"
  },
  Essential: {
    icon: "🎵🎵",
    color: "#81C784",
    order: 2,
    tooltip: "Essential: Milonga staples"
  },
  DJ: {
    icon: "🎵🎵🎵",
    color: "#FFD54F",
    order: 3,
    tooltip: "DJ: For serious dancers"
  },
  Deep: {
    icon: "🎵🎵🎵🎵",
    color: "#E53935",
    order: 4,
    tooltip: "Deep: Specialists only"
  },
};

// Sub-tiers for granular filtering within each tier
const SUB_TIERS = {
  Classics: { label: "Classics", vibe: "Top 30%", color: "#4DD0E1" },
  Standards: { label: "Standards", vibe: "Middle 40%", color: "#FFD54F" },
  DeepCuts: { label: "Deep Cuts", vibe: "Bottom 30%", color: "#E53935" },
};

// LEGACY: Old 5-tier config for backward compatibility
const LEGACY_TIER_CONFIG = {
  1: { name: "Iconic", abbr: "I", vibe: "Everyone knows it", color: "#4DD0E1", pct: "10%" },
  2: { name: "Essential", abbr: "E", vibe: "Milonga staples", color: "#81C784", pct: "20%" },
  3: { name: "Familiar", abbr: "F", vibe: "You've heard it", color: "#FFD54F", pct: "30%" },
  4: { name: "Challenging", abbr: "C", vibe: "Tests your ears", color: "#FF8A65", pct: "25%" },
  5: { name: "Deep Cuts", abbr: "D", vibe: "DJ-level knowledge", color: "#E53935", pct: "15%" },
};

export { FAMILIARITY_TIERS, SUB_TIERS, LEGACY_TIER_CONFIG as TIER_CONFIG };

/**
 * NEW v3 RecognitionSelector
 * - 4 familiarity tiers: Iconic, Essential, DJ, Deep
 * - Optional sub-tier selector: Classics, Standards, DeepCuts
 * - Props:
 *   - selectedTiers: string[] (e.g., ['Iconic', 'Essential'])
 *   - onChange: (tiers: string[]) => void
 *   - selectedSubTier: string | null (e.g., 'Classics')
 *   - onSubTierChange: (subTier: string | null) => void
 *   - showSubTiers: boolean (default false)
 *   - legacyMode: boolean (use old 1-5 number system)
 */
export default function RecognitionSelector({
  selectedTiers = ["Iconic"],
  onChange,
  selectedSubTier = null,
  onSubTierChange,
  showSubTiers = false,
  disabled = false,
  compact = false,
  legacyMode = false,
}) {
  // LEGACY MODE: Use old 5-tier number system
  if (legacyMode) {
    return (
      <LegacyRecognitionSelector
        selectedTiers={selectedTiers}
        onChange={onChange}
        disabled={disabled}
        compact={compact}
      />
    );
  }

  const toggleTier = (tierName) => {
    if (disabled) return;
    const newSelection = selectedTiers.includes(tierName)
      ? selectedTiers.filter((t) => t !== tierName)
      : [...selectedTiers, tierName];

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
        Familiarity
      </Typography>

      {/* 4 Tier Buttons with 🎵 icons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1.5,
          mb: showSubTiers ? 1.5 : 0,
        }}
      >
        {Object.entries(FAMILIARITY_TIERS).map(([tierName, config]) => {
          const isSelected = selectedTiers.includes(tierName);

          return (
            <Tooltip key={tierName} title={config.tooltip} arrow placement="top">
              <Box
                onClick={() => toggleTier(tierName)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: disabled ? "default" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {/* Block with note icon */}
                <Box
                  sx={{
                    minWidth: blockSize,
                    height: blockSize,
                    px: 0.5,
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
                      fontSize: compact ? "0.8rem" : "1rem",
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
                  {tierName}
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

/**
 * Legacy 5-tier selector for backward compatibility
 */
function LegacyRecognitionSelector({ selectedTiers, onChange, disabled, compact }) {
  const toggleTier = (tier) => {
    if (disabled) return;
    const newSelection = selectedTiers.includes(tier)
      ? selectedTiers.filter((t) => t !== tier)
      : [...selectedTiers, tier].sort();
    if (newSelection.length === 0) return;
    onChange(newSelection);
  };

  const blockSize = compact ? 36 : 40;

  return (
    <Box sx={{ mb: compact ? 1 : 2 }}>
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
        Familiarity
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.8 }}>
        {[1, 2, 3, 4, 5].map((tier) => {
          const config = LEGACY_TIER_CONFIG[tier];
          const isSelected = selectedTiers.includes(tier);

          return (
            <Box
              key={tier}
              onClick={() => toggleTier(tier)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: disabled ? "default" : "pointer",
              }}
            >
              <Box
                sx={{
                  width: blockSize,
                  height: blockSize,
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
                    fontSize: compact ? "0.9rem" : "1rem",
                    fontWeight: "bold",
                    color: isSelected ? "#000" : "var(--foreground)",
                  }}
                >
                  {tier}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "0.5rem",
                  mt: 0.2,
                  color: isSelected ? config.color : "var(--foreground)",
                  opacity: isSelected ? 1 : 0.4,
                  textTransform: "uppercase",
                }}
              >
                {config.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

RecognitionSelector.propTypes = {
  selectedTiers: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string), // New: ['Iconic', 'Essential']
    PropTypes.arrayOf(PropTypes.number), // Legacy: [1, 2]
  ]),
  onChange: PropTypes.func.isRequired,
  selectedSubTier: PropTypes.string,
  onSubTierChange: PropTypes.func,
  showSubTiers: PropTypes.bool,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
  legacyMode: PropTypes.bool,
};
