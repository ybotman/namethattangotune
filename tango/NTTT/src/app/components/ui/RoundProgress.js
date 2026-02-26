//src/app/components/ui/RoundProgress.js

"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

/**
 * Displays a row of dashes representing total rounds, with colors indicating progress:
 * - Completed rounds: colored by score (green=high, yellow=medium, red=low)
 * - Current round: blue with shimmer
 * - Remaining rounds: grey
 *
 * @param {number} totalRounds - total number of rounds (e.g. 10)
 * @param {number} currentRound - which round index we are on (0-based)
 * @param {Array<number>} roundScores - array of score percentages (0-100) for completed rounds
 * @param {number} dashWidth - optional dash width (px)
 * @param {number} dashHeight - optional dash height (px)
 */
export default function RoundProgress({
  totalRounds,
  currentRound,
  roundScores = [],
  dashWidth = 4,
  dashHeight = 24,
}) {
  // Get color based on score percentage (0-100)
  const getScoreColor = (scorePercent) => {
    if (scorePercent >= 70) return "#4CAF50"; // bright green
    if (scorePercent >= 50) return "#8BC34A"; // light green
    if (scorePercent >= 30) return "#FF9800"; // orange
    if (scorePercent > 0) return "#f44336";   // red
    return "#666";                             // dark grey for 0/timeout
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
      }}
    >
      {Array.from({ length: totalRounds }, (_, index) => {
        const isCompleted = index < currentRound;
        const isCurrent = index === currentRound;

        let dashColor = "#444"; // future rounds - dark grey
        if (isCompleted) {
          // Use score-based color if available
          const scorePercent = roundScores[index] ?? 0;
          dashColor = getScoreColor(scorePercent);
        }
        if (isCurrent) dashColor = "#2196F3"; // blue for current

        return (
          <Box
            key={index}
            sx={{
              width: dashWidth,
              height: dashHeight,
              backgroundColor: dashColor,
              borderRadius: 1,
              transition: "background-color 0.3s ease",
              // Shimmer animation for current round
              animation: isCurrent
                ? "shimmer 1.5s ease-in-out infinite"
                : "none",
              "@keyframes shimmer": {
                "0%": { opacity: 0.6 },
                "50%": { opacity: 1 },
                "100%": { opacity: 0.6 },
              },
            }}
          />
        );
      })}
    </Box>
  );
}

RoundProgress.propTypes = {
  totalRounds: PropTypes.number.isRequired,
  currentRound: PropTypes.number.isRequired,
  roundScores: PropTypes.arrayOf(PropTypes.number),
  dashWidth: PropTypes.number,
  dashHeight: PropTypes.number,
};
