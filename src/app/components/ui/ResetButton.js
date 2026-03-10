"use client";

import React from "react";
import { Box, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * 3D Reset button - resets game config to defaults
 * Highlights when config differs from defaults
 */
export default function ResetButton({ onClick, isModified = false, size = 40 }) {
  return (
    <Tooltip title="Reset to defaults" arrow placement="top">
      <Box
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          // Blue gradient, shifts to orange when modified
          background: isModified
            ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 40%, #E65100 100%)"
            : "linear-gradient(135deg, #90CAF9 0%, #42A5F5 40%, #1565C0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: isModified
            ? `
              0 4px 15px rgba(255, 152, 0, 0.4),
              0 2px 6px rgba(0, 0, 0, 0.25),
              inset 0 2px 4px rgba(255, 255, 255, 0.4),
              inset 0 -2px 4px rgba(0, 0, 0, 0.15)
            `
            : `
              0 4px 15px rgba(66, 165, 245, 0.4),
              0 2px 6px rgba(0, 0, 0, 0.25),
              inset 0 2px 4px rgba(255, 255, 255, 0.4),
              inset 0 -2px 4px rgba(0, 0, 0, 0.15)
            `,
          border: "2px solid rgba(255, 255, 255, 0.3)",
          transition: "all 0.15s ease",
          "&:hover": {
            filter: "brightness(1.1)",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <RefreshIcon
          sx={{
            fontSize: size * 0.55,
            color: isModified ? "#4E342E" : "#1A237E",
            filter: "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.2))",
          }}
        />
      </Box>
    </Tooltip>
  );
}
