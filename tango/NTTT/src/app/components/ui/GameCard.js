//------------------------------------------------------------
// src/app/components/ui/GameCard.js
// Game tile for swipe menu - Quiz, Clip, Learn, etc.
//------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

const modeIcons = {
  quiz: "⏱️",
  clip: "🔁",
  learn: "📚",
  listen: "🎧",
  compare: "🔀",
  year: "📅",
  setup: "⚙️",
  contest: "🏆",
};

const modeColors = {
  quiz: "#FF6B6B",
  clip: "#4ECDC4",
  learn: "#45B7D1",
  listen: "#96CEB4",
  compare: "#DDA0DD",
  year: "#FFD93D",
  setup: "#A0A0A0",
  contest: "#FFD700",
};

export default function GameCard({ title, subtitle, mode, path, disabled = false, comingSoon = false }) {
  const icon = modeIcons[mode] || "🎵";
  const color = modeColors[mode] || "#66AAFF";

  const card = (
    <Box
      sx={{
        width: 100,
        height: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--input-bg)",
        borderRadius: 2,
        border: `2px solid ${disabled ? "var(--border-color)" : color}`,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s ease",
        position: "relative",
        ...(!disabled && {
          "&:hover": {
            transform: "scale(1.05)",
            borderColor: "var(--accent)",
            boxShadow: `0 0 16px ${color}44`,
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }),
      }}
    >
      {/* Icon */}
      <Typography sx={{ fontSize: "2rem", mb: 0.5 }}>{icon}</Typography>

      {/* Title */}
      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--foreground)",
          textAlign: "center",
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          sx={{
            fontSize: "0.6rem",
            color: "var(--foreground)",
            opacity: 0.6,
            textAlign: "center",
          }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Coming Soon Badge */}
      {comingSoon && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: "#FFD700",
            color: "#000",
            fontSize: "0.5rem",
            fontWeight: "bold",
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            transform: "rotate(15deg)",
          }}
        >
          SOON
        </Box>
      )}
    </Box>
  );

  if (disabled || !path) {
    return card;
  }

  return (
    <Link href={path} style={{ textDecoration: "none" }}>
      {card}
    </Link>
  );
}

GameCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  mode: PropTypes.oneOf(["quiz", "clip", "learn", "listen", "compare", "year", "setup", "contest"]),
  path: PropTypes.string,
  disabled: PropTypes.bool,
  comingSoon: PropTypes.bool,
};
