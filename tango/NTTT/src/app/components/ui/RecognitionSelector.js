// ------------------------------------------------------------
// src/components/ui/RecognitionSelector.js
// Recognition Tier selector - compact 5-block row with alternating labels
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

// Tier configuration - gradient from light teal to deep red
const TIER_CONFIG = {
  1: { name: "Iconic", abbr: "I", vibe: "Everyone knows it", color: "#4DD0E1", pct: "10%" },
  2: { name: "Essential", abbr: "E", vibe: "Milonga staples", color: "#81C784", pct: "20%" },
  3: { name: "Familiar", abbr: "F", vibe: "You've heard it", color: "#FFD54F", pct: "30%" },
  4: { name: "Challenging", abbr: "C", vibe: "Tests your ears", color: "#FF8A65", pct: "25%" },
  5: { name: "Deep Cuts", abbr: "D", vibe: "DJ-level knowledge", color: "#E53935", pct: "15%" },
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

  const blockSize = 40;
  const gap = 8;

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
          fontSize: "0.75rem",
          fontWeight: 700,
        }}
      >
        Familiarity
      </Typography>

      {/* Container with fixed height for labels + blocks */}
      <Box
        sx={{
          position: "relative",
          height: blockSize + 28, // block + label space above and below
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Blocks row - spread out to match other selectors */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "320px",
            width: "100%",
            position: "absolute",
            top: 14, // space for top labels
            px: 1,
          }}
        >
          {[1, 2, 3, 4, 5].map((tier) => {
            const config = TIER_CONFIG[tier];
            const isSelected = selectedTiers.includes(tier);
            const labelAbove = tier % 2 === 1;

            return (
              <Box
                key={tier}
                sx={{
                  position: "relative",
                  width: blockSize,
                  height: blockSize,
                }}
              >
                {/* Label - positioned above or below */}
                <Typography
                  sx={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    ...(labelAbove
                      ? { bottom: blockSize + 2 }
                      : { top: blockSize + 2 }),
                    fontSize: "0.5rem",
                    color: isSelected ? config.color : "var(--foreground)",
                    opacity: isSelected ? 1 : 0.4,
                    fontWeight: isSelected ? 600 : 400,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {config.name}
                </Typography>

                {/* The clickable block */}
                <Box
                  onClick={() => toggleTier(tier)}
                  sx={{
                    width: blockSize,
                    height: blockSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                    backgroundColor: isSelected ? config.color : "transparent",
                    border: `2px solid ${config.color}`,
                    transition: "all 0.15s ease",
                    "&:hover": disabled
                      ? {}
                      : {
                          backgroundColor: isSelected ? config.color : `${config.color}33`,
                          transform: "scale(1.08)",
                        },
                    "&:active": disabled
                      ? {}
                      : {
                          transform: "scale(0.95)",
                        },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: isSelected ? "#000" : "var(--foreground)",
                      lineHeight: 1,
                    }}
                  >
                    {tier}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Optional vibe display */}
      {showVibe && selectedTiers.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
          {selectedTiers.map((t) => (
            <Typography
              key={t}
              variant="caption"
              sx={{
                color: TIER_CONFIG[t].color,
                fontSize: "0.65rem",
              }}
            >
              {TIER_CONFIG[t].vibe}
            </Typography>
          ))}
        </Box>
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
  selectedTiers: [1],
  disabled: false,
  showVibe: false,
  compact: false,
};
