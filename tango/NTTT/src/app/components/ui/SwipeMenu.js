//------------------------------------------------------------
// src/app/components/ui/SwipeMenu.js
// Swipeable menu with dot indicators - mobile-first navigation
//------------------------------------------------------------
"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";

const SWIPE_THRESHOLD = 50; // px needed to trigger page change

export default function SwipeMenu({ pages, initialPage = 0, onPageChange, externalPage }) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Allow external control of page
  useEffect(() => {
    if (externalPage !== undefined && externalPage !== currentPage) {
      setDirection(externalPage > currentPage ? 1 : -1);
      setCurrentPage(externalPage);
    }
  }, [externalPage]);
  const [direction, setDirection] = useState(0);
  const dragX = useMotionValue(0);

  // Notify parent when page changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  const handleDragEnd = (e, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe left (next page)
    if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      if (currentPage < pages.length - 1) {
        setDirection(1);
        setCurrentPage((p) => p + 1);
      }
    }
    // Swipe right (previous page)
    else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      if (currentPage > 0) {
        setDirection(-1);
        setCurrentPage((p) => p - 1);
      }
    }
  };

  const goToPage = (index) => {
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
  };

  // Animation variants
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const page = pages[currentPage];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      {/* Page Title with Arrows */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 1.5,
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Typography
          onClick={() => currentPage > 0 && goToPage(currentPage - 1)}
          sx={{
            fontSize: "1.5rem",
            color: currentPage > 0 ? "var(--accent)" : "var(--border-color)",
            cursor: currentPage > 0 ? "pointer" : "default",
            userSelect: "none",
            px: 1,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &lt;
        </Typography>
{page.image ? (
          <img
            src={page.image}
            alt={page.title}
            style={{
              height: 32,
              width: "auto",
              maxWidth: 160,
              objectFit: "contain",
              maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          />
        ) : (
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--foreground)",
              textTransform: "uppercase",
              letterSpacing: 2,
              minWidth: 140,
              textAlign: "center",
            }}
          >
            {page.title}
          </Typography>
        )}
        <Typography
          onClick={() => currentPage < pages.length - 1 && goToPage(currentPage + 1)}
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: currentPage < pages.length - 1 ? "var(--accent)" : "var(--border-color)",
            cursor: currentPage < pages.length - 1 ? "pointer" : "default",
            userSelect: "none",
            px: 1,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &gt;
        </Typography>
      </Box>

      {/* Swipeable Content Area */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{
              x: dragX,
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 2,
                overflowY: "auto",
              }}
            >
              {page.content}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Dot Indicators + Labels */}
      <Box
        sx={{
          py: 2,
          borderTop: "1px solid var(--border-color)",
        }}
      >
        {/* Dots - smaller for 10+ pages */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
            mb: 0.5,
          }}
        >
          {pages.map((p, i) => (
            <Box
              key={i}
              onClick={() => goToPage(i)}
              sx={{
                width: i === currentPage ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === currentPage ? "var(--accent)" : "var(--border-color)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </Box>

        {/* Labels - horizontal scroll for many pages */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 1.5,
            overflowX: "auto",
            px: 2,
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {pages.map((p, i) => (
            <Typography
              key={i}
              onClick={() => goToPage(i)}
              sx={{
                fontSize: "0.6rem",
                color: i === currentPage ? "var(--accent)" : "var(--foreground)",
                opacity: i === currentPage ? 1 : 0.5,
                fontWeight: i === currentPage ? 600 : 400,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
                minWidth: 44,
                textAlign: "center",
                py: 0.5,
              }}
            >
              {p.label || p.title}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

SwipeMenu.propTypes = {
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      label: PropTypes.string, // Short label for indicator (uses title if not provided)
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
  initialPage: PropTypes.number,
  onPageChange: PropTypes.func,
};
