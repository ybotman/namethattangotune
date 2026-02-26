// ------------------------------------------------------------
// src/components/ui/StylesSelector.js
// Style selector - tile buttons for Tango, Vals, Milonga + optional Vocals toggle
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

// Style configuration with colors
const STYLE_CONFIG = {
  Tango: { color: "#E53935" },    // Red
  Vals: { color: "#5C6BC0" },     // Indigo
  Milonga: { color: "#43A047" },  // Green
};

export default function StylesSelector({
  availableStyles,
  selectedStyles,
  onChange,
  disabled,
  // Optional vocals toggle
  showVocals = false,
  includeSinger = false,
  onVocalsChange,
}) {
  const toggleStyle = (style) => {
    if (disabled) return;
    const newStyles = { ...selectedStyles, [style]: !selectedStyles[style] };
    onChange(newStyles);
  };

  const toggleVocals = () => {
    if (disabled || !onVocalsChange) return;
    onVocalsChange(!includeSinger);
  };

  // Use availableStyles if provided, otherwise default to the 3 main styles
  const styles = availableStyles?.length > 0
    ? availableStyles.map(s => s.style)
    : ["Tango", "Vals", "Milonga"];

  const blockWidth = 60;
  const blockHeight = 40;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Title */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "var(--foreground)",
          opacity: 0.6,
          mb: 1,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.65rem",
        }}
      >
        Style
      </Typography>

      {/* Tile buttons row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1.5,
        }}
      >
        {styles.map((style) => {
          const config = STYLE_CONFIG[style] || { color: "#888" };
          const isSelected = selectedStyles?.[style] ?? false;

          return (
            <Box
              key={style}
              onClick={() => toggleStyle(style)}
              sx={{
                width: blockWidth,
                height: blockHeight,
                display: "flex",
                flexDirection: "column",
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
                      transform: "scale(1.05)",
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
                  color: isSelected ? "#fff" : "var(--foreground)",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {style}
              </Typography>
            </Box>
          );
        })}

        {/* Vocals toggle button - separated */}
        {showVocals && (
          <Box
            onClick={toggleVocals}
            sx={{
              width: blockWidth,
              height: blockHeight,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.5 : 1,
              backgroundColor: includeSinger ? "#9C27B0" : "transparent",
              border: `2px solid #9C27B0`,
              transition: "all 0.15s ease",
              ml: 3, // 25% more gap before vocals
              "&:hover": disabled
                ? {}
                : {
                    backgroundColor: includeSinger ? "#9C27B0" : "rgba(156, 39, 176, 0.2)",
                    transform: "scale(1.05)",
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
                fontSize: "0.65rem",
                fontWeight: "bold",
                color: includeSinger ? "#fff" : "var(--foreground)",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              Vocals
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

StylesSelector.propTypes = {
  availableStyles: PropTypes.arrayOf(
    PropTypes.shape({
      style: PropTypes.string.isRequired,
    }),
  ),
  selectedStyles: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showVocals: PropTypes.bool,
  includeSinger: PropTypes.bool,
  onVocalsChange: PropTypes.func,
};

StylesSelector.defaultProps = {
  availableStyles: [],
  selectedStyles: {},
  disabled: false,
  showVocals: false,
  includeSinger: false,
  onVocalsChange: null,
};
