// ------------------------------------------------------------
// src/components/ui/SwipeConfig.js
// Swipeable card container with pagination dots
// Used for game configuration (Grid, Styles, Dials)
// ------------------------------------------------------------
"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const STORAGE_KEY = "nttt_swipe_seen";

/**
 * SwipeConfig - Horizontal swipeable cards with dots navigation
 * Shows horizontal labels on arrows indicating next/prev card
 * Pulses on first session visit to hint at swipeability
 */
export default function SwipeConfig({ cards, labels = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  // Check if first visit this session
  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setShowPulse(true);
      // Stop pulsing after 3 seconds or on first interaction
      const timer = setTimeout(() => {
        setShowPulse(false);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const goTo = (index) => {
    if (index < 0 || index >= cards.length) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    // Stop pulsing on first interaction
    if (showPulse) {
      setShowPulse(false);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  // Pulse animation for arrows
  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    static: {
      scale: 1,
      opacity: 1,
    },
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
    }),
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      {/* Card container with navigation arrows */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minHeight: 200,
        }}
      >
        {/* Left arrow with vertical label - hidden on first card */}
        {activeIndex > 0 && (
          <motion.div
            onClick={goPrev}
            style={{
              position: "absolute",
              left: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeftIcon sx={{ color: "var(--accent)", fontSize: 32 }} />
            {labels[activeIndex - 1] && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  letterSpacing: 2,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  mt: -0.5,
                }}
              >
                {labels[activeIndex - 1]}
              </Typography>
            )}
          </motion.div>
        )}

        {/* Card content */}
        <Box
          sx={{
            width: "calc(100% - 48px)",
            overflow: "hidden",
            position: "relative",
            minHeight: 180,
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {cards[activeIndex]}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Right arrow with vertical label - hidden on last card */}
        {activeIndex < cards.length - 1 && (
          <motion.div
            onClick={goNext}
            variants={pulseVariants}
            animate={showPulse && activeIndex === 0 ? "pulse" : "static"}
            style={{
              position: "absolute",
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRightIcon sx={{ color: "var(--accent)", fontSize: 32 }} />
            {labels[activeIndex + 1] && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  letterSpacing: 2,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  mt: -0.5,
                }}
              >
                {labels[activeIndex + 1]}
              </Typography>
            )}
          </motion.div>
        )}
      </Box>

      {/* Card label - current tab indicator */}
      {labels[activeIndex] && (
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "var(--accent)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            mt: 1,
          }}
        >
          {labels[activeIndex]}
        </Typography>
      )}

      {/* Pagination dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mt: 1.5,
        }}
      >
        {cards.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => goTo(idx)}
            sx={{
              width: idx === activeIndex ? 16 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === activeIndex ? "var(--accent)" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: idx === activeIndex ? "var(--accent)" : "rgba(255,255,255,0.5)",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

SwipeConfig.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.node).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string),
};
