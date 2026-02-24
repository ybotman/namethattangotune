"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

// Year ranges for the bar (each segment is ~3 years)
const YEAR_SEGMENTS = [
  { start: 1916, end: 1919, label: "16-19" },
  { start: 1920, end: 1924, label: "20-24" },
  { start: 1925, end: 1929, label: "25-29" },
  { start: 1930, end: 1934, label: "30-34" },
  { start: 1935, end: 1939, label: "35-39" },
  { start: 1940, end: 1944, label: "40-44" },
  { start: 1945, end: 1949, label: "45-49" },
  { start: 1950, end: 1954, label: "50-54" },
  { start: 1955, end: 1960, label: "55-60" },
];

export default function YearBar({
  selectedSegment,
  onSegmentClick,
  correctYear,
  showResult,
  disabled,
}) {
  const getSegmentColor = (segment) => {
    if (!showResult) {
      // Before reveal
      if (selectedSegment === segment.label) {
        return "var(--accent)";
      }
      return "#444";
    }

    // After reveal
    const isCorrectSegment =
      correctYear >= segment.start && correctYear <= segment.end;

    if (isCorrectSegment) {
      return "#4caf50"; // Green for correct
    }
    if (selectedSegment === segment.label) {
      return "#f44336"; // Red for wrong guess
    }
    return "#333";
  };

  return (
    <Box sx={{ width: "100%", px: 1 }}>
      {/* Year labels above bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 0.5,
          px: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "var(--foreground)" }}>
          1916
        </Typography>
        <Typography variant="caption" sx={{ color: "var(--foreground)" }}>
          1960
        </Typography>
      </Box>

      {/* Year bar segments */}
      <Box
        sx={{
          display: "flex",
          gap: "2px",
          height: 60,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {YEAR_SEGMENTS.map((segment) => (
          <Box
            key={segment.label}
            onClick={() => !disabled && onSegmentClick(segment)}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: getSegmentColor(segment),
              cursor: disabled ? "default" : "pointer",
              transition: "all 0.2s",
              "&:hover": !disabled && {
                backgroundColor:
                  selectedSegment === segment.label
                    ? "var(--accent)"
                    : "#555",
                transform: "scaleY(1.05)",
              },
              borderRadius: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight:
                  selectedSegment === segment.label ? "bold" : "normal",
                fontSize: "0.7rem",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              {segment.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Show correct year after reveal */}
      {showResult && correctYear && (
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography
            variant="body1"
            sx={{ color: "#4caf50", fontWeight: "bold" }}
          >
            Recorded in {correctYear}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export { YEAR_SEGMENTS };
