"use client";

import React from "react";
import { Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

/**
 * 3D Raised shiny PLAY button with pulsing animation
 * Used on all game config pages to start gameplay
 */
export default function PlayButton({ onClick, size = 90, disabled = false }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        // Gradient for 3D raised/glossy effect
        background: disabled
          ? "linear-gradient(145deg, #555, #333)"
          : "linear-gradient(135deg, #6fdc6f 0%, #4CAF50 40%, #388E3C 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        position: "relative",
        // Multiple shadows for 3D depth
        boxShadow: disabled
          ? "2px 2px 5px rgba(0,0,0,0.3)"
          : `
            0 8px 25px rgba(76, 175, 80, 0.5),
            0 4px 10px rgba(0, 0, 0, 0.3),
            inset 0 3px 8px rgba(255, 255, 255, 0.4),
            inset 0 -3px 8px rgba(0, 0, 0, 0.2)
          `,
        // Shiny border
        border: disabled ? "2px solid #444" : "3px solid rgba(255, 255, 255, 0.3)",
        animation: disabled ? "none" : "playPulse 2s ease-in-out infinite",
        "@keyframes playPulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: `
              0 8px 25px rgba(76, 175, 80, 0.5),
              0 4px 10px rgba(0, 0, 0, 0.3),
              inset 0 3px 8px rgba(255, 255, 255, 0.4),
              inset 0 -3px 8px rgba(0, 0, 0, 0.2)
            `,
          },
          "50%": {
            transform: "scale(1.06)",
            boxShadow: `
              0 12px 35px rgba(76, 175, 80, 0.7),
              0 6px 15px rgba(0, 0, 0, 0.3),
              inset 0 3px 8px rgba(255, 255, 255, 0.5),
              inset 0 -3px 8px rgba(0, 0, 0, 0.2)
            `,
          },
        },
        transition: "all 0.15s ease",
        "&:hover": {
          filter: disabled ? "none" : "brightness(1.12)",
          transform: disabled ? "none" : "scale(1.03)",
        },
        "&:active": {
          transform: disabled ? "none" : "scale(0.94) translateY(2px)",
          boxShadow: disabled
            ? "none"
            : `
              0 3px 10px rgba(76, 175, 80, 0.4),
              0 2px 5px rgba(0, 0, 0, 0.3),
              inset 0 2px 6px rgba(0, 0, 0, 0.3)
            `,
        },
        // Glossy highlight overlay
        "&::before": disabled ? {} : {
          content: '""',
          position: "absolute",
          top: "8%",
          left: "15%",
          width: "35%",
          height: "25%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      {/* Play icon centered with drop shadow for depth */}
      <PlayArrowIcon
        sx={{
          fontSize: size * 0.55,
          color: "white",
          filter: "drop-shadow(2px 3px 3px rgba(0, 0, 0, 0.4))",
        }}
      />
    </Box>
  );
}
