// ------------------------------------------------------------
// src/components/ui/FilterModeToggle.js
// Toggle between LEVEL (🌶/🎵) and ERA filtering modes
// SWAP not STACK - prevents impossible filter combinations
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

export default function FilterModeToggle({
  mode = "level",
  onChange,
  levelLabel = "Level",
  levelIcon = "🌶",
  disabled = false,
}) {
  const handleChange = (event, newMode) => {
    // Don't allow deselection - one must always be active
    if (newMode !== null) {
      onChange(newMode);
    }
  };

  return (
    <Box sx={{ mb: 1.5 }}>
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
        Filter By
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleChange}
          disabled={disabled}
          sx={{
            "& .MuiToggleButton-root": {
              color: "var(--foreground)",
              borderColor: "var(--border-color)",
              px: 3,
              py: 0.75,
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                backgroundColor: "var(--accent)",
                color: "#000",
                borderColor: "var(--accent)",
                "&:hover": {
                  backgroundColor: "var(--accent)",
                  filter: "brightness(1.1)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            },
          }}
        >
          <ToggleButton value="level">
            {levelIcon} {levelLabel}
          </ToggleButton>
          <ToggleButton value="era">
            📅 Era
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}

FilterModeToggle.propTypes = {
  mode: PropTypes.oneOf(["level", "era"]),
  onChange: PropTypes.func.isRequired,
  levelLabel: PropTypes.string,
  levelIcon: PropTypes.string,
  disabled: PropTypes.bool,
};
