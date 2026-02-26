// ------------------------------------------------------------
// src/app/components/ui/PeriodsSelector.js
// Period selector - alternating top/bottom labels like RecognitionSelector
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

// Period configuration - chronological order with colors
const PERIODS = [
  { name: "Old Guard", short: "OLD", color: "#8D6E63" },
  { name: "New Guard", short: "NEW", color: "#FF8A65" },
  { name: "Golden Age", short: "GOLD", color: "#FFD54F" },
  { name: "Decline", short: "DEC", color: "#90A4AE" },
  { name: "Renaissance", short: "REN", color: "#4DD0E1" },
];

export default function PeriodsSelector({
  selectedPeriods = [],
  onChange,
  disabled,
  singleSelect = false,
  label = "Era",
}) {
  const togglePeriod = (periodName) => {
    if (disabled) return;
    if (singleSelect) {
      // Single select mode - always set to clicked item
      onChange([periodName]);
    } else {
      // Multi select mode - toggle
      const newPeriods = selectedPeriods.includes(periodName)
        ? selectedPeriods.filter((p) => p !== periodName)
        : [...selectedPeriods, periodName];
      onChange(newPeriods);
    }
  };

  const blockSize = 40;

  return (
    <Box sx={{ mb: 1 }}>
      {/* Title */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "var(--foreground)",
          opacity: 0.6,
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.65rem",
        }}
      >
        {label}
      </Typography>

      {/* Container with fixed height for labels + blocks */}
      <Box
        sx={{
          position: "relative",
          height: blockSize + 28,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Blocks row - spread out */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "320px",
            width: "100%",
            position: "absolute",
            top: 14,
            px: 1,
          }}
        >
          {PERIODS.map((period, idx) => {
            const isSelected = selectedPeriods.includes(period.name);
            const labelAbove = idx % 2 === 0; // 0,2,4 above; 1,3 below

            return (
              <Box
                key={period.name}
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
                    color: isSelected ? period.color : "var(--foreground)",
                    opacity: isSelected ? 1 : 0.4,
                    fontWeight: isSelected ? 600 : 400,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {period.name}
                </Typography>

                {/* The clickable block */}
                <Box
                  onClick={() => togglePeriod(period.name)}
                  sx={{
                    width: blockSize,
                    height: blockSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                    backgroundColor: isSelected ? period.color : "transparent",
                    border: `2px solid ${period.color}`,
                    transition: "all 0.15s ease",
                    "&:hover": disabled
                      ? {}
                      : {
                          backgroundColor: isSelected ? period.color : `${period.color}33`,
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
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      color: isSelected ? "#000" : "var(--foreground)",
                      lineHeight: 1,
                    }}
                  >
                    {period.short}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

PeriodsSelector.propTypes = {
  selectedPeriods: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  singleSelect: PropTypes.bool,
  label: PropTypes.string,
};

PeriodsSelector.defaultProps = {
  selectedPeriods: [],
  disabled: false,
  singleSelect: false,
  label: "Era",
};
