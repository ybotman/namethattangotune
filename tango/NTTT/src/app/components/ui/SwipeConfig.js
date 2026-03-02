// ------------------------------------------------------------
// src/components/ui/SwipeConfig.js
// Swipeable card container with pagination dots
// Used for game configuration (Grid, Styles, Dials)
// ------------------------------------------------------------
"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * SwipeConfig - Horizontal swipeable cards with dots navigation
 * Shows vertical labels on arrows indicating next/prev card
 */
export default function SwipeConfig({ cards, labels = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = (index) => {
    if (index < 0 || index >= cards.length) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

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
        {/* Left arrow with vertical label */}
        <Box
          onClick={goPrev}
          sx={{
            position: "absolute",
            left: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: activeIndex === 0 ? "default" : "pointer",
            opacity: activeIndex === 0 ? 0.2 : 0.7,
            transition: "opacity 0.2s",
            "&:hover": { opacity: activeIndex === 0 ? 0.2 : 1 },
          }}
        >
          <ChevronLeftIcon sx={{ color: "var(--foreground)", fontSize: 28 }} />
          {activeIndex > 0 && labels[activeIndex - 1] && (
            <Typography
              sx={{
                fontSize: "0.5rem",
                color: "var(--foreground)",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                letterSpacing: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                mt: -0.5,
              }}
            >
              {labels[activeIndex - 1]}
            </Typography>
          )}
        </Box>

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

        {/* Right arrow with vertical label */}
        <Box
          onClick={goNext}
          sx={{
            position: "absolute",
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: activeIndex === cards.length - 1 ? "default" : "pointer",
            opacity: activeIndex === cards.length - 1 ? 0.2 : 0.7,
            transition: "opacity 0.2s",
            "&:hover": { opacity: activeIndex === cards.length - 1 ? 0.2 : 1 },
          }}
        >
          <ChevronRightIcon sx={{ color: "var(--foreground)", fontSize: 28 }} />
          {activeIndex < cards.length - 1 && labels[activeIndex + 1] && (
            <Typography
              sx={{
                fontSize: "0.5rem",
                color: "var(--foreground)",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                letterSpacing: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                mt: -0.5,
              }}
            >
              {labels[activeIndex + 1]}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Card label */}
      {labels[activeIndex] && (
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "0.65rem",
            color: "var(--foreground)",
            opacity: 0.6,
            textTransform: "uppercase",
            letterSpacing: 1,
            mt: 0.5,
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
