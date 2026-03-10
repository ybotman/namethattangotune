"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";

const MIN_YEAR = 1916;
const MAX_YEAR = 2023;

// Era markers for visual reference
const ERAS = [
  { year: 1916, label: "Old Guard", color: "#8B4513" },
  { year: 1935, label: "Golden Age", color: "#FFD700" },
  { year: 1955, label: "New Guard", color: "#4169E1" },
  { year: 1985, label: "Modern", color: "#9C27B0" },
];

export default function YearSlider({
  selectedYear,
  onYearChange,
  correctYear,
  showResult,
  disabled,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVertical, setIsVertical] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Detect orientation and size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
      // Portrait = vertical, Landscape = horizontal
      setIsVertical(window.innerHeight > window.innerWidth);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate year from position
  const positionToYear = useCallback((pos, size) => {
    const ratio = Math.max(0, Math.min(1, pos / size));
    // For vertical: top = old, bottom = new. For horizontal: left = old, right = new
    const year = Math.round(MIN_YEAR + ratio * (MAX_YEAR - MIN_YEAR));
    return Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
  }, []);

  // Calculate position from year
  const yearToPosition = useCallback((year, size) => {
    const ratio = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
    return ratio * size;
  }, []);

  // Handle drag/touch
  const handleInteraction = useCallback((clientX, clientY) => {
    if (disabled || showResult || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let pos, size;

    if (isVertical) {
      pos = clientY - rect.top;
      size = rect.height;
    } else {
      pos = clientX - rect.left;
      size = rect.width;
    }

    const year = positionToYear(pos, size);
    onYearChange(year);
  }, [disabled, showResult, isVertical, positionToYear, onYearChange]);

  const handleMouseDown = (e) => {
    if (disabled || showResult) return;
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (disabled || showResult) return;
    setIsDragging(true);
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  };

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, []);

  // Calculate positions for markers
  const trackSize = isVertical ? dimensions.height : dimensions.width;
  const selectedPos = selectedYear ? yearToPosition(selectedYear, trackSize) : null;
  const correctPos = correctYear ? yearToPosition(correctYear, trackSize) : null;
  const yearDiff = selectedYear && correctYear ? Math.abs(selectedYear - correctYear) : null;

  // Generate year tick marks (every 10 years)
  const ticks = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += 10) {
    const pos = yearToPosition(year, trackSize);
    ticks.push({ year, pos });
  }

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      sx={{
        position: "relative",
        width: isVertical ? 80 : "100%",
        height: isVertical ? "60vh" : 80,
        mx: "auto",
        cursor: disabled || showResult ? "default" : "pointer",
        opacity: showResult ? 0.7 : 1,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Track background with era colors */}
      <Box
        sx={{
          position: "absolute",
          ...(isVertical
            ? { left: "50%", transform: "translateX(-50%)", width: 20, height: "100%" }
            : { top: "50%", transform: "translateY(-50%)", height: 20, width: "100%" }),
          borderRadius: 2,
          background: `linear-gradient(${isVertical ? "to bottom" : "to right"},
            #8B4513 0%, #8B4513 18%,
            #FFD700 18%, #FFD700 37%,
            #4169E1 37%, #4169E1 65%,
            #9C27B0 65%, #9C27B0 100%)`,
          opacity: 0.3,
        }}
      />

      {/* Year ticks */}
      {ticks.map(({ year, pos }) => (
        <Box
          key={year}
          sx={{
            position: "absolute",
            ...(isVertical
              ? { top: pos, left: 0, width: "100%", height: 1 }
              : { left: pos, top: 0, width: 1, height: "100%" }),
            display: "flex",
            alignItems: "center",
            justifyContent: isVertical ? "flex-start" : "flex-end",
            flexDirection: isVertical ? "row" : "column",
          }}
        >
          <Box
            sx={{
              ...(isVertical
                ? { width: 15, height: 1, bgcolor: "var(--foreground)", opacity: 0.3 }
                : { height: 15, width: 1, bgcolor: "var(--foreground)", opacity: 0.3 }),
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: "0.6rem",
              ml: isVertical ? 0.5 : 0,
              mt: isVertical ? 0 : 0.5,
              position: "absolute",
              ...(isVertical ? { left: 20 } : { bottom: -18 }),
            }}
          >
            {year}
          </Typography>
        </Box>
      ))}

      {/* Selected year marker */}
      {selectedPos !== null && (
        <Box
          sx={{
            position: "absolute",
            ...(isVertical
              ? { top: selectedPos - 15, left: "50%", transform: "translateX(-50%)" }
              : { left: selectedPos - 15, top: "50%", transform: "translateY(-50%)" }),
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: showResult
              ? yearDiff <= 3
                ? "#4CAF50"
                : yearDiff <= 10
                ? "#FF9800"
                : "#f44336"
              : "var(--accent)",
            border: "3px solid white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.55rem" }}
          >
            {selectedYear}
          </Typography>
        </Box>
      )}

      {/* Correct year marker (shown after result) */}
      {showResult && correctPos !== null && (
        <Box
          sx={{
            position: "absolute",
            ...(isVertical
              ? { top: correctPos - 12, right: 0 }
              : { left: correctPos - 12, bottom: 0 }),
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#4CAF50",
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "white", fontWeight: "bold", fontSize: "0.5rem" }}
          >
            {correctYear}
          </Typography>
        </Box>
      )}

      {/* Year difference indicator */}
      {showResult && yearDiff !== null && (
        <Box
          sx={{
            position: "absolute",
            ...(isVertical
              ? { top: "50%", right: -60, transform: "translateY(-50%)" }
              : { left: "50%", top: -40, transform: "translateX(-50%)" }),
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: yearDiff <= 3 ? "#4CAF50" : yearDiff <= 10 ? "#FF9800" : "#f44336",
              fontWeight: "bold",
            }}
          >
            {yearDiff === 0 ? "EXACT!" : `±${yearDiff}`}
          </Typography>
          <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
            years
          </Typography>
        </Box>
      )}

      {/* Drag instruction */}
      {!selectedYear && !showResult && (
        <Box
          sx={{
            position: "absolute",
            ...(isVertical
              ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
              : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }),
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "var(--foreground)", opacity: 0.5 }}
          >
            {isVertical ? "Drag ↕" : "Drag ↔"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
