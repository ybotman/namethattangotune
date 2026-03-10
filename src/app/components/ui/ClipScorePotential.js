//
// src/app/components/ui/ClipScorePotential.js
// Shows the max possible score per song based on clip config
//
"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

// Get base score from clip length (non-linear, heavily weighted to short clips)
// 1s=1000 (max), halving each second, 30s=10 (min)
function getClipBaseScore(clipLength) {
  const scoreMap = [
    [1, 1000],
    [2, 500],
    [3, 250],
    [4, 125],
    [5, 60],
    [10, 20],
    [30, 10],
  ];

  // Exact match or below minimum
  if (clipLength <= scoreMap[0][0]) return scoreMap[0][1];

  // Find range and interpolate
  for (let i = 0; i < scoreMap.length - 1; i++) {
    const [x1, y1] = scoreMap[i];
    const [x2, y2] = scoreMap[i + 1];
    if (clipLength <= x2) {
      // Linear interpolation between points
      const t = (clipLength - x1) / (x2 - x1);
      return Math.round(y1 + t * (y2 - y1));
    }
  }

  // Beyond 30s
  return scoreMap[scoreMap.length - 1][1];
}

/**
 * ClipScorePotential - Displays max possible score per song for clip games
 */
export default function ClipScorePotential({ config }) {
  const { clipLength = 5, recognitionTiers = [1], numSongs = 10 } = config;

  const scoring = useMemo(() => {
    const baseMax = getClipBaseScore(clipLength);

    // Calculate average tier level (1=Iconic easiest, 5=Deep hardest)
    // Higher average = harder songs = higher multiplier
    const avgTier = recognitionTiers.length > 0
      ? recognitionTiers.reduce((a, b) => a + b, 0) / recognitionTiers.length
      : 1;

    // Average tier 1 = 1x, average tier 5 = 2x
    const tierMult = 1 + (avgTier - 1) * 0.25;

    const maxPerSong = Math.round(baseMax * tierMult);
    const sessionMax = maxPerSong * numSongs;

    return {
      baseMax,
      avgTier,
      tierMult,
      maxPerSong,
      sessionMax,
    };
  }, [clipLength, recognitionTiers, numSongs]);

  // Intensity level based on max per song
  const getIntensityLevel = (max) => {
    if (max >= 1500) return { label: "INSANE", color: "#ff1744", emoji: "🔥" };
    if (max >= 800) return { label: "Expert", color: "#ff9100", emoji: "💪" };
    if (max >= 400) return { label: "Hard", color: "#ffea00", emoji: "⚡" };
    if (max >= 150) return { label: "Medium", color: "#76ff03", emoji: "👍" };
    if (max >= 50) return { label: "Easy", color: "#69f0ae", emoji: "😎" };
    return { label: "Chill", color: "#81d4fa", emoji: "🎵" };
  };

  const intensity = getIntensityLevel(scoring.maxPerSong);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 1,
        px: 2,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        mb: 2,
      }}
    >
      {/* Max Score Display */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: intensity.color,
            fontFamily: "monospace",
          }}
        >
          {scoring.maxPerSong.toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
          pts/song
        </Typography>
      </Box>

      {/* Intensity label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
        <Typography sx={{ fontSize: "1rem" }}>{intensity.emoji}</Typography>
        <Typography
          variant="caption"
          sx={{
            color: intensity.color,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {intensity.label}
        </Typography>
      </Box>

      {/* Breakdown hint */}
      <Typography
        variant="caption"
        sx={{ color: "var(--foreground)", opacity: 0.4, mt: 0.5, fontSize: "0.65rem" }}
      >
        {clipLength}s clip × {scoring.tierMult.toFixed(2)}x (avg tier {scoring.avgTier.toFixed(1)})
      </Typography>
    </Box>
  );
}

ClipScorePotential.propTypes = {
  config: PropTypes.shape({
    clipLength: PropTypes.number,
    numSongs: PropTypes.number,
    recognitionTiers: PropTypes.arrayOf(PropTypes.number),
  }),
};

ClipScorePotential.defaultProps = {
  config: {},
};
