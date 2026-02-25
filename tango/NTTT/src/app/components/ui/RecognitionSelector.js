// ------------------------------------------------------------
// src/components/ui/RecognitionSelector.js
// Recognition Tier selector using chip-style buttons
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Chip } from "@mui/material";

// Tier configuration - matches add_recognition_scores.py
const TIER_CONFIG = {
  1: { name: "Iconic", vibe: "Everyone knows it", color: "#FFD700", pct: "10%" },
  2: { name: "Essential", vibe: "Milonga staples", color: "#C0C0C0", pct: "20%" },
  3: { name: "Familiar", vibe: "You've heard it", color: "#CD7F32", pct: "30%" },
  4: { name: "Challenging", vibe: "Tests your ears", color: "#4A90D9", pct: "25%" },
  5: { name: "Deep Cuts", vibe: "DJ-level knowledge", color: "#808080", pct: "15%" },
};

export { TIER_CONFIG };

export default function RecognitionSelector({
  label,
  selectedTiers,
  onChange,
  disabled,
  showVibe = false,
  compact = false,
}) {
  const toggleTier = (tier) => {
    if (disabled) return;
    const newSelection = selectedTiers.includes(tier)
      ? selectedTiers.filter((t) => t !== tier)
      : [...selectedTiers, tier].sort();
    onChange(newSelection);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: compact ? 0.5 : 1 }}>
        {[1, 2, 3, 4, 5].map((tier) => {
          const config = TIER_CONFIG[tier];
          const isSelected = selectedTiers.includes(tier);

          return (
            <Chip
              key={tier}
              label={
                showVibe
                  ? `${config.name} (${config.pct})`
                  : config.name
              }
              onClick={() => toggleTier(tier)}
              disabled={disabled}
              size={compact ? "small" : "medium"}
              sx={{
                background: isSelected ? config.color : "transparent",
                border: `2px solid ${config.color}`,
                color: isSelected ? "#000" : "var(--foreground)",
                fontWeight: isSelected ? "bold" : "normal",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.5 : 1,
                "&:hover": disabled
                  ? {}
                  : {
                      background: isSelected
                        ? config.color
                        : `${config.color}33`,
                    },
              }}
            />
          );
        })}
      </Box>

      {/* Show vibes as subtitle if showVibe is enabled */}
      {showVibe && selectedTiers.length > 0 && (
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
        >
          {selectedTiers.map((t) => TIER_CONFIG[t].vibe).join(" | ")}
        </Typography>
      )}
    </Box>
  );
}

RecognitionSelector.propTypes = {
  label: PropTypes.string,
  selectedTiers: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showVibe: PropTypes.bool,
  compact: PropTypes.bool,
};

RecognitionSelector.defaultProps = {
  label: "Recognition Tier:",
  selectedTiers: [1], // Default to Iconic only
  disabled: false,
  showVibe: false,
  compact: false,
};
