//------------------------------------------------------------
// src/components/ui/AnimatedScore.js
// Animated score display with counting effect
//------------------------------------------------------------
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Typography, Box } from "@mui/material";
import PropTypes from "prop-types";

/**
 * AnimatedScore - Shows score with animated counting and celebration effects
 */
export default function AnimatedScore({
  score,
  label = "Score",
  size = "medium",
  showChange = true,
  isNewBest = false,
}) {
  const [displayScore, setDisplayScore] = useState(score);
  const [scoreChange, setScoreChange] = useState(null);
  const prevScoreRef = useRef(score);

  // Animate score counting
  useEffect(() => {
    const prevScore = prevScoreRef.current;
    const diff = score - prevScore;

    if (diff !== 0 && showChange) {
      setScoreChange(diff);
      // Clear change indicator after animation
      const timer = setTimeout(() => setScoreChange(null), 1500);
      return () => clearTimeout(timer);
    }

    // Animate the number counting up/down
    const duration = 500; // ms
    const steps = 20;
    const increment = diff / steps;
    let current = prevScore;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    prevScoreRef.current = score;
    return () => clearInterval(interval);
  }, [score, showChange]);

  const fontSize = {
    small: "1.5rem",
    medium: "2rem",
    large: "3rem",
  }[size];

  return (
    <Box sx={{ position: "relative", display: "inline-block", textAlign: "center" }}>
      {/* Label */}
      {label && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </Typography>
      )}

      {/* Main score */}
      <motion.div
        key={score}
        initial={{ scale: 1 }}
        animate={
          isNewBest
            ? {
                scale: [1, 1.3, 1],
                color: ["inherit", "#ffd700", "inherit"],
              }
            : { scale: 1 }
        }
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            fontSize,
            fontFamily: "monospace",
            color: isNewBest ? "warning.main" : "text.primary",
          }}
        >
          {Math.floor(displayScore)}
        </Typography>
      </motion.div>

      {/* Score change indicator */}
      <AnimatePresence>
        {scoreChange !== null && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              right: -30,
              color: scoreChange > 0 ? "#4caf50" : "#f44336",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New best indicator */}
      <AnimatePresence>
        {isNewBest && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Typography
              sx={{
                color: "warning.main",
                fontSize: "0.75rem",
                fontWeight: "bold",
                mt: 0.5,
              }}
            >
              NEW BEST!
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

AnimatedScore.propTypes = {
  score: PropTypes.number.isRequired,
  label: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  showChange: PropTypes.bool,
  isNewBest: PropTypes.bool,
};
