// src/components/ui/YearRangeSelector.js
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Slider, Box, Typography, TextField } from "@mui/material";

const MIN_YEAR = 1916;
const MAX_YEAR = 2023;

export default function YearRangeSelector({
  label,
  value,
  onChange,
  disabled,
}) {
  // value is [startYear, endYear] or null/undefined for "all years"
  const currentRange = value || [MIN_YEAR, MAX_YEAR];

  const handleSliderChange = (event, newValue) => {
    if (onChange) {
      // If full range selected, treat as "no filter"
      if (newValue[0] === MIN_YEAR && newValue[1] === MAX_YEAR) {
        onChange(null);
      } else {
        onChange(newValue);
      }
    }
  };

  const handleStartChange = (e) => {
    const newStart = parseInt(e.target.value, 10) || MIN_YEAR;
    const clamped = Math.max(MIN_YEAR, Math.min(newStart, currentRange[1]));
    handleSliderChange(null, [clamped, currentRange[1]]);
  };

  const handleEndChange = (e) => {
    const newEnd = parseInt(e.target.value, 10) || MAX_YEAR;
    const clamped = Math.min(MAX_YEAR, Math.max(newEnd, currentRange[0]));
    handleSliderChange(null, [currentRange[0], clamped]);
  };

  const isFullRange = !value || (value[0] === MIN_YEAR && value[1] === MAX_YEAR);

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {label}{" "}
          <Typography component="span" sx={{ color: "text.secondary", fontSize: "0.9em" }}>
            {isFullRange ? "(All)" : `(${currentRange[0]}-${currentRange[1]})`}
          </Typography>
        </Typography>
      )}

      {/* Slider for quick selection */}
      <Slider
        value={currentRange}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChange}
        disabled={disabled}
        valueLabelDisplay="auto"
        disableSwap
        sx={{ mb: 1 }}
      />

      {/* Text inputs for precise control - mobile friendly */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="From"
          type="number"
          size="small"
          value={currentRange[0]}
          onChange={handleStartChange}
          disabled={disabled}
          inputProps={{ min: MIN_YEAR, max: MAX_YEAR, style: { width: "70px" } }}
          sx={{ flex: "0 0 auto" }}
        />
        <Typography sx={{ color: "text.secondary" }}>to</Typography>
        <TextField
          label="To"
          type="number"
          size="small"
          value={currentRange[1]}
          onChange={handleEndChange}
          disabled={disabled}
          inputProps={{ min: MIN_YEAR, max: MAX_YEAR, style: { width: "70px" } }}
          sx={{ flex: "0 0 auto" }}
        />
      </Box>
    </Box>
  );
}

YearRangeSelector.propTypes = {
  label: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

YearRangeSelector.defaultProps = {
  label: "Year Range:",
  value: null,
  disabled: false,
};
