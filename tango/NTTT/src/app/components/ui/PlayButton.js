"use client";

import React from "react";
import { Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

/**
 * Round PLAY button with pulsing animation
 * Used on all game config pages to start gameplay
 */
export default function PlayButton({ onClick, size = 80, color = "#4CAF50", disabled = false }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: disabled ? "#666" : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 4px 20px ${color}66`,
        opacity: disabled ? 0.5 : 1,
        animation: disabled ? "none" : "playPulse 2s ease-in-out infinite",
        "@keyframes playPulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: `0 4px 20px ${color}66`,
          },
          "50%": {
            transform: "scale(1.08)",
            boxShadow: `0 6px 30px ${color}99`,
          },
        },
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: disabled ? "#666" : color,
          filter: disabled ? "none" : "brightness(1.1)",
        },
        "&:active": {
          transform: disabled ? "none" : "scale(0.95)",
        },
      }}
    >
      <PlayArrowIcon
        sx={{
          fontSize: size * 0.6,
          color: "white",
          marginLeft: size * 0.05, // Slight offset to center the triangle visually
        }}
      />
    </Box>
  );
}
