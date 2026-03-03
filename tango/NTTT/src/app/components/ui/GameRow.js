//------------------------------------------------------------
// src/app/components/ui/GameRow.js
// Compact clickable game card with title, PLAY badge, and help
//------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import HelpButton from "@/components/ui/HelpButton";

const modeColors = {
  quiz: "#FF6B6B",
  clip: "#4ECDC4",
  learn: "#45B7D1",
  listen: "#96CEB4",
  compare: "#DDA0DD",
  year: "#FFD93D",
  song: "#FF9F43",
};

export default function GameRow({
  title,
  subtitle, // kept for help but not displayed
  mode,
  path,
  helpTitle,
  helpDescription,
}) {
  const router = useRouter();
  const color = modeColors[mode] || "#66AAFF";

  const handlePlay = (e) => {
    // Don't navigate if clicking help button
    if (e.target.closest('[data-help-button]')) return;
    router.push(path);
  };

  return (
    <Box
      onClick={handlePlay}
      sx={{
        width: "100%",
        maxWidth: "min(100%, 360px)",
        p: 1.5,
        backgroundColor: "var(--input-bg)",
        border: `2px solid ${color}`,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: `${color}15`,
          transform: "scale(1.02)",
          boxShadow: `0 0 12px ${color}40`,
        },
        "&:active": {
          transform: "scale(0.98)",
        },
      }}
    >
      {/* Title */}
      <Typography
        sx={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--foreground)",
          flex: 1,
        }}
      >
        {title}
      </Typography>

      {/* PLAY badge */}
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          backgroundColor: color,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#000",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          PLAY
        </Typography>
      </Box>

      {/* Help button */}
      <Box data-help-button onClick={(e) => e.stopPropagation()}>
        <HelpButton
          title={helpTitle || title}
          description={helpDescription || subtitle || `Learn more about ${title}`}
        />
      </Box>
    </Box>
  );
}

GameRow.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  mode: PropTypes.oneOf(["quiz", "clip", "learn", "listen", "compare", "year", "song"]),
  path: PropTypes.string.isRequired,
  helpTitle: PropTypes.string,
  helpDescription: PropTypes.string,
};
