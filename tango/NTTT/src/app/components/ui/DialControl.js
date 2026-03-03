// ------------------------------------------------------------
// src/app/components/ui/DialControl.js
// Mobile-friendly circular dial for numeric selection
// ------------------------------------------------------------
"use client";

import React, { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function DialControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  size = 100,
  color = "var(--accent)",
  unit = "",
}) {
  const dialRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(value);

  // Calculate the rotation angle based on value
  const range = max - min;
  const normalizedValue = (value - min) / range;
  // Ensure minimum visible arc (at least 10 degrees even at min value)
  const arcDegrees = Math.max(10, normalizedValue * 270);
  const angle = normalizedValue * 270 - 135; // -135 to 135 degrees

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  }, [value, max, step, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  }, [value, min, step, onChange]);

  // Touch/Mouse drag handling for dial
  const handleStart = useCallback((clientY) => {
    isDragging.current = true;
    startY.current = clientY;
    startValue.current = value;
  }, [value]);

  const handleMove = useCallback((clientY) => {
    if (!isDragging.current) return;

    const deltaY = startY.current - clientY;
    const sensitivity = 2; // pixels per step
    const deltaSteps = Math.round(deltaY / sensitivity) * step;
    const newValue = Math.min(max, Math.max(min, startValue.current + deltaSteps));

    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, min, max, step, onChange]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientY);

    const handleMouseMove = (e) => handleMove(e.clientY);
    const handleMouseUp = () => {
      handleEnd();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          color: "var(--foreground)",
          opacity: 0.8,
          mb: 0.5,
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Typography>

      {/* Dial Container */}
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
        {/* Dial Background */}
        <Box
          ref={dialRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            background: `conic-gradient(
              from -135deg,
              ${color}20 0deg,
              ${color}60 ${arcDegrees}deg,
              var(--background) ${arcDegrees}deg,
              var(--background) 270deg
            )`,
            border: `3px solid ${color}`,
            cursor: "ns-resize",
            transition: "transform 0.1s ease",
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        />

        {/* Value Display */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "var(--foreground)",
              lineHeight: 1,
              fontSize: size > 80 ? "1.75rem" : "1.25rem",
            }}
          >
            {value}
          </Typography>
          {unit && (
            <Typography
              variant="caption"
              sx={{
                color: "var(--foreground)",
                opacity: 0.6,
                fontSize: "0.65rem",
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>
      </Box>

      {/* +/- Buttons - min 40px touch targets */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 0.5,
        }}
      >
        <IconButton
          onClick={handleDecrement}
          disabled={value <= min}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: "var(--input-bg)",
            border: `1px solid ${color}40`,
            color: "var(--foreground)",
            "&:hover": {
              backgroundColor: `${color}30`,
            },
            "&:disabled": {
              opacity: 0.3,
            },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleIncrement}
          disabled={value >= max}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: "var(--input-bg)",
            border: `1px solid ${color}40`,
            color: "var(--foreground)",
            "&:hover": {
              backgroundColor: `${color}30`,
            },
            "&:disabled": {
              opacity: 0.3,
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

DialControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  unit: PropTypes.string,
};
