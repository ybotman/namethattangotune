//------------------------------------------------------------
// src/app/components/ui/ListenCountdown.js
// Countdown timer for clip games - shows "LISTEN!" with countdown
//------------------------------------------------------------
"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";

export default function ListenCountdown({
  duration,
  isPlaying,
  onStop,
  size = 120
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [visible, setVisible] = useState(false);

  // Reset and show when playing starts
  useEffect(() => {
    if (isPlaying) {
      setTimeLeft(duration);
      setVisible(true);
    }
  }, [isPlaying, duration]);

  // Countdown effect
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) {
      if (timeLeft <= 0) {
        // Hide after a brief delay when countdown finishes
        const hideTimer = setTimeout(() => setVisible(false), 300);
        return () => clearTimeout(hideTimer);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        return newTime > 0 ? newTime : 0;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  // Handle click to stop
  const handleClick = useCallback(() => {
    if (onStop && isPlaying) {
      onStop();
      setVisible(false);
    }
  }, [onStop, isPlaying]);

  // Calculate progress for circular indicator
  const progress = timeLeft / duration;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
          style={{ cursor: onStop ? "pointer" : "default" }}
        >
          <Box
            sx={{
              position: "relative",
              width: size,
              height: size,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Background circle */}
            <svg
              width={size}
              height={size}
              style={{ position: "absolute", transform: "rotate(-90deg)" }}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 8}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 8}
                fill="none"
                stroke="#4CAF50"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>

            {/* Center content */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#4CAF50",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Listen!
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                {Math.ceil(timeLeft)}
              </Typography>
              {onStop && (
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    color: "var(--foreground)",
                    opacity: 0.5,
                    mt: 0.5,
                  }}
                >
                  tap to stop
                </Typography>
              )}
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ListenCountdown.propTypes = {
  duration: PropTypes.number.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onStop: PropTypes.func,
  size: PropTypes.number,
};
