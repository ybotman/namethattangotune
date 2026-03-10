// ------------------------------------------------------------
// src/app/components/ui/ContiguousPeriodSelector.js
// Period selector that enforces contiguous selection (no gaps)
// ------------------------------------------------------------
"use client";

import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Chip, Stack } from "@mui/material";

export default function ContiguousPeriodSelector({
  label,
  selectedPeriods,
  onChange,
  onYearRangeChange,
  disabled,
}) {
  const [periods, setPeriods] = useState([]);

  // Fetch periods on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await fetch("/songData/TangoPeriods.json");
        const data = await response.json();
        if (isMounted) {
          // Sort by start_year to ensure correct order
          const sorted = data.sort((a, b) => a.start_year - b.start_year);
          setPeriods(sorted);
        }
      } catch (error) {
        console.error("Error fetching TangoPeriods.json:", error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate year range from selected periods
  const yearRange = useMemo(() => {
    if (!periods.length || !selectedPeriods.length) {
      return { start: 1920, end: 1955 }; // Default: New Guard + Golden Age
    }

    const selectedData = periods.filter((p) => selectedPeriods.includes(p.period));
    if (!selectedData.length) {
      return { start: 1920, end: 1955 };
    }

    const minYear = Math.min(...selectedData.map((p) => p.start_year));
    const maxYear = Math.max(...selectedData.map((p) => p.end_year));

    return { start: minYear, end: maxYear };
  }, [periods, selectedPeriods]);

  // Notify parent of year range changes
  useEffect(() => {
    if (onYearRangeChange) {
      onYearRangeChange(yearRange);
    }
  }, [yearRange, onYearRangeChange]);

  // Get indices of selected periods
  const getSelectedIndices = () => {
    return selectedPeriods
      .map((name) => periods.findIndex((p) => p.period === name))
      .filter((i) => i !== -1)
      .sort((a, b) => a - b);
  };

  // Check if clicking a period would maintain contiguity
  const canToggle = (periodIndex) => {
    const currentIndices = getSelectedIndices();

    if (currentIndices.length === 0) {
      // Nothing selected, can select anything
      return true;
    }

    const isSelected = currentIndices.includes(periodIndex);

    if (isSelected) {
      // Deselecting - only allow if it's at an edge (first or last)
      // and there's more than one selected
      if (currentIndices.length === 1) {
        return false; // Can't deselect the last one
      }
      const minIdx = Math.min(...currentIndices);
      const maxIdx = Math.max(...currentIndices);
      return periodIndex === minIdx || periodIndex === maxIdx;
    } else {
      // Selecting - must be adjacent to current selection
      const minIdx = Math.min(...currentIndices);
      const maxIdx = Math.max(...currentIndices);
      return periodIndex === minIdx - 1 || periodIndex === maxIdx + 1;
    }
  };

  // Handle period toggle
  const handleToggle = (periodName) => {
    if (!onChange || disabled) return;

    const periodIndex = periods.findIndex((p) => p.period === periodName);
    if (!canToggle(periodIndex)) return;

    const isSelected = selectedPeriods.includes(periodName);

    if (isSelected) {
      // Remove from selection
      const newSelection = selectedPeriods.filter((p) => p !== periodName);
      onChange(newSelection);
    } else {
      // Add to selection, maintaining order
      const newSelection = periods
        .filter((p) => selectedPeriods.includes(p.period) || p.period === periodName)
        .map((p) => p.period);
      onChange(newSelection);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 1, color: "var(--foreground)" }}>
          {label}
        </Typography>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {periods.map((p, idx) => {
          const isSelected = selectedPeriods.includes(p.period);
          const isDisabled = disabled || !p.active || !canToggle(idx);
          const canClick = canToggle(idx) && p.active && !disabled;

          return (
            <Chip
              key={p.period}
              label={`${p.period} (${p.start_year}-${p.end_year})`}
              onClick={() => canClick && handleToggle(p.period)}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              disabled={!p.active}
              sx={{
                mb: 1,
                opacity: isDisabled && !isSelected ? 0.5 : 1,
                cursor: canClick ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                "&:hover": canClick
                  ? {
                      transform: "scale(1.05)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }
                  : {},
              }}
            />
          );
        })}
      </Stack>

      {/* Show selected range */}
      {selectedPeriods.length > 0 && (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1, color: "var(--accent)" }}
        >
          Year range: {yearRange.start} - {yearRange.end}
        </Typography>
      )}
    </Box>
  );
}

ContiguousPeriodSelector.propTypes = {
  label: PropTypes.string,
  selectedPeriods: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  onYearRangeChange: PropTypes.func,
  disabled: PropTypes.bool,
};

ContiguousPeriodSelector.defaultProps = {
  label: "Select Periods:",
  selectedPeriods: [],
  disabled: false,
};
