//
// src/app/components/ui/ScorePotential.js
// Shows the max possible score per song based on config
//
"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import {
  getDifficultyMultiplier,
  getSingerMultiplier,
  getTotalMultiplier,
} from "@/utils/scoringUtils";

/**
 * Calculate max base score from time limit using the cubic polynomial
 */
function calculateBaseMaxScore(timeLimit) {
  const clamped = Math.max(3, Math.min(timeLimit, 30));
  const a = 705.39;
  const b = 79.0;
  const c = 3.69;
  const d = 0.0595;
  const val = a - b * clamped + c * clamped ** 2 - d * clamped ** 3;
  return Math.round(val);
}

/**
 * ScorePotential - Displays max possible score per song
 */
export default function ScorePotential({ config }) {
  const { timeLimit = 15, recognitionTiers = [1], includeSinger = false, numSongs = 10 } = config;

  const scoring = useMemo(() => {
    const baseMax = calculateBaseMaxScore(timeLimit);
    const tierMult = getDifficultyMultiplier(recognitionTiers);
    const singerMult = getSingerMultiplier(includeSinger);
    const totalMult = tierMult * singerMult;
    const maxPerSong = Math.round(baseMax * totalMult);
    const sessionMax = maxPerSong * numSongs;

    return {
      baseMax,
      tierMult,
      singerMult,
      totalMult,
      maxPerSong,
      sessionMax,
    };
  }, [timeLimit, recognitionTiers, includeSinger, numSongs]);

  // Intensity level based on max per song
  const getIntensityLevel = (max) => {
    if (max >= 2000) return { label: "INSANE", color: "#ff1744", emoji: "🔥" };
    if (max >= 1000) return { label: "Expert", color: "#ff9100", emoji: "💪" };
    if (max >= 500) return { label: "Hard", color: "#ffea00", emoji: "⚡" };
    if (max >= 250) return { label: "Medium", color: "#76ff03", emoji: "👍" };
    return { label: "Chill", color: "#69f0ae", emoji: "😎" };
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
    </Box>
  );
}

ScorePotential.propTypes = {
  config: PropTypes.shape({
    timeLimit: PropTypes.number,
    numSongs: PropTypes.number,
    recognitionTiers: PropTypes.arrayOf(PropTypes.number),
    includeSinger: PropTypes.bool,
  }),
};

ScorePotential.defaultProps = {
  config: {},
};
