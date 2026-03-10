"use client";

import React, { useRef, useMemo } from "react";
import { Box, Typography } from "@mui/material";

// Default year range (fallback)
const DEFAULT_START_YEAR = 1920;
const DEFAULT_END_YEAR = 1955;

// Arc configuration
const ARC_START_ANGLE = -140; // degrees from top (left side)
const ARC_END_ANGLE = 140;    // degrees from top (right side)
const ARC_RANGE = ARC_END_ANGLE - ARC_START_ANGLE;

export default function YearDial({
  selectedYear,
  onYearClick,
  correctYear,
  showResult,
  disabled,
  startYear = DEFAULT_START_YEAR,
  endYear = DEFAULT_END_YEAR,
}) {
  const svgRef = useRef(null);

  // Calculate total years based on props
  const totalYears = endYear - startYear + 1;

  // Convert year to angle on the arc
  const yearToAngle = (year) => {
    const ratio = (year - startYear) / (totalYears - 1);
    return ARC_START_ANGLE + ratio * ARC_RANGE;
  };

  // Convert angle to SVG coordinates (center at 150, 140)
  const angleToXY = (angle, radius) => {
    const rad = (angle - 90) * (Math.PI / 180); // -90 to start from top
    return {
      x: 150 + radius * Math.cos(rad),
      y: 140 + radius * Math.sin(rad),
    };
  };

  // Handle click on SVG
  const handleClick = (e) => {
    if (disabled || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale to SVG coordinates
    const svgX = (x / rect.width) * 300;
    const svgY = (y / rect.height) * 180;

    // Calculate angle from center (150, 140)
    const dx = svgX - 150;
    const dy = svgY - 140;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    // Normalize angle
    if (angle < -180) angle += 360;
    if (angle > 180) angle -= 360;

    // Check if within arc range
    if (angle >= ARC_START_ANGLE && angle <= ARC_END_ANGLE) {
      const ratio = (angle - ARC_START_ANGLE) / ARC_RANGE;
      const year = Math.round(startYear + ratio * (totalYears - 1));
      onYearClick(year);
    }
  };

  // Generate tick marks for decades (within range)
  const decades = useMemo(() => {
    const ticks = [];
    // Start from nearest decade >= startYear
    const firstDecade = Math.ceil(startYear / 10) * 10;
    // End at nearest decade <= endYear
    const lastDecade = Math.floor(endYear / 10) * 10;

    for (let year = firstDecade; year <= lastDecade; year += 10) {
      if (year >= startYear && year <= endYear) {
        const angle = yearToAngle(year);
        const outer = angleToXY(angle, 95);
        const inner = angleToXY(angle, 80);
        const label = angleToXY(angle, 110);
        ticks.push({ year, outer, inner, label, angle });
      }
    }
    return ticks;
  }, [startYear, endYear]);

  // Generate minor ticks (every 5 years within range)
  const minorTicks = useMemo(() => {
    const ticks = [];
    const firstTick = Math.ceil(startYear / 5) * 5;
    const lastTick = Math.floor(endYear / 5) * 5;

    for (let year = firstTick; year <= lastTick; year += 5) {
      if (year % 10 !== 0 && year >= startYear && year <= endYear) {
        const angle = yearToAngle(year);
        const outer = angleToXY(angle, 92);
        const inner = angleToXY(angle, 85);
        ticks.push({ year, outer, inner });
      }
    }
    return ticks;
  }, [startYear, endYear]);

  // Selected year marker
  const selectedAngle = selectedYear ? yearToAngle(selectedYear) : null;
  const selectedPos = selectedAngle ? angleToXY(selectedAngle, 70) : null;

  // Correct year marker
  const correctAngle = correctYear ? yearToAngle(correctYear) : null;
  const correctPos = correctAngle ? angleToXY(correctAngle, 70) : null;

  // Arc path
  const arcStart = angleToXY(ARC_START_ANGLE, 90);
  const arcEnd = angleToXY(ARC_END_ANGLE, 90);

  // Determine colors
  const getSelectedColor = () => {
    if (!showResult) return "var(--accent)";
    if (selectedYear && correctYear) {
      const diff = Math.abs(selectedYear - correctYear);
      if (diff === 0) return "#4caf50";
      if (diff <= 3) return "#8bc34a";
      if (diff <= 5) return "#ffeb3b";
      return "#f44336";
    }
    return "#f44336";
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 300 180"
        onClick={handleClick}
        style={{
          cursor: disabled ? "default" : "pointer",
          width: "100%",
          height: "auto",
        }}
      >
        {/* Background arc */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A 90 90 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="#333"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Decade tick marks */}
        {decades.map(({ year, outer, inner, label, angle }) => (
          <g key={year}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#888"
              strokeWidth="2"
            />
            <text
              x={label.x}
              y={label.y}
              fill="#aaa"
              fontSize="8"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${angle}, ${label.x}, ${label.y})`}
            >
              {year.toString().slice(-2)}
            </text>
          </g>
        ))}

        {/* Minor tick marks */}
        {minorTicks.map(({ year, outer, inner }) => (
          <line
            key={year}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#555"
            strokeWidth="1"
          />
        ))}

        {/* Correct year indicator (shown after result) */}
        {showResult && correctPos && (
          <circle
            cx={correctPos.x}
            cy={correctPos.y}
            r="8"
            fill="#4caf50"
            stroke="white"
            strokeWidth="2"
          />
        )}

        {/* Selected year indicator */}
        {selectedPos && (
          <circle
            cx={selectedPos.x}
            cy={selectedPos.y}
            r="6"
            fill={getSelectedColor()}
            stroke="white"
            strokeWidth="2"
          />
        )}

        {/* Center display */}
        <text
          x="150"
          y="130"
          fill="var(--foreground)"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
        >
          {selectedYear || "?"}
        </text>

        {/* Year range labels */}
        <text x="30" y="150" fill="#666" fontSize="10" textAnchor="middle">
          {startYear}
        </text>
        <text x="270" y="150" fill="#666" fontSize="10" textAnchor="middle">
          {endYear}
        </text>
      </svg>

      {/* Result message */}
      {showResult && correctYear && (
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            mt: 1,
            color: "#4caf50",
            fontWeight: "bold",
          }}
        >
          Recorded in {correctYear}
          {selectedYear && Math.abs(selectedYear - correctYear) <= 3 && selectedYear !== correctYear && (
            <span style={{ color: "#8bc34a" }}> (Close!)</span>
          )}
        </Typography>
      )}
    </Box>
  );
}

export { DEFAULT_START_YEAR, DEFAULT_END_YEAR };
