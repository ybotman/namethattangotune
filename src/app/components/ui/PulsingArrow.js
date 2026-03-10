"use client";

import React, { useState, useEffect } from "react";
import { Box, keyframes } from "@mui/material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import PropTypes from "prop-types";

// Pulsing animation for the arrow
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: translateX(0);
  }
  50% {
    opacity: 0.6;
    transform: translateX(-6px);
  }
`;

const VISIT_THRESHOLD = 3;

/**
 * Animated pulsing arrow pointing at the Help button
 * Shows for the first 3 visits per game, then hides permanently
 */
export default function PulsingArrow({ gameId }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const storageKey = `nttt_help_visits_${gameId}`;
    const visits = parseInt(localStorage.getItem(storageKey) || "0", 10);

    if (visits < VISIT_THRESHOLD) {
      setVisible(true);
      // Increment visit count
      localStorage.setItem(storageKey, String(visits + 1));
    } else {
      setVisible(false);
    }
  }, [gameId]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: -28,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        animation: `${pulse} 1.2s ease-in-out infinite`,
        pointerEvents: "none",
      }}
    >
      <KeyboardDoubleArrowRightIcon
        sx={{
          fontSize: "1.5rem",
          color: "#FFC107",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
        }}
      />
    </Box>
  );
}

PulsingArrow.propTypes = {
  gameId: PropTypes.string.isRequired,
};
