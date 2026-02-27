//------------------------------------------------------------
// src/app/components/ui/GameRow.js
// Compact game box with description, play button, and help
//------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import PlayButton from "@/components/ui/PlayButton";
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
  subtitle,
  mode,
  path,
  helpTitle,
  helpDescription,
}) {
  const router = useRouter();
  const color = modeColors[mode] || "#66AAFF";

  const handlePlay = () => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 360,
        p: 1.5,
        backgroundColor: "var(--input-bg)",
        border: `2px solid ${color}`,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {/* Play button */}
      <PlayButton onClick={handlePlay} size={50} />

      {/* Title + Description */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--foreground)",
            mb: 0.25,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "var(--foreground)",
            opacity: 0.7,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Help button */}
      <HelpButton
        title={helpTitle || title}
        description={helpDescription || `Learn more about ${title}`}
      />
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
