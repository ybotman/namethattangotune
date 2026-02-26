"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import Picker from "react-mobile-picker";

const MIN_YEAR = 1916;
const MAX_YEAR = 2023;

// 5 canonical eras from TangoPeriods.json
const ERAS = [
  { name: "Old Guard", short: "Old", start: 1880, end: 1920, center: 1918, color: "#8D6E63" },
  { name: "New Guard", short: "New", start: 1920, end: 1935, center: 1928, color: "#FF8A65" },
  { name: "Golden Age", short: "Gold", start: 1935, end: 1955, center: 1945, color: "#FFD54F" },
  { name: "Decline", short: "Decl", start: 1955, end: 1980, center: 1968, color: "#90A4AE" },
  { name: "Renaissance", short: "Ren", start: 1980, end: 2030, center: 2005, color: "#CE93D8" },
];

// 10 decades
const DECADES = [
  { label: "20s", center: 1925 },
  { label: "30s", center: 1935 },
  { label: "40s", center: 1945 },
  { label: "50s", center: 1955 },
  { label: "60s", center: 1965 },
  { label: "70s", center: 1975 },
  { label: "80s", center: 1985 },
  { label: "90s", center: 1995 },
  { label: "00s", center: 2005 },
  { label: "10s", center: 2015 },
];

// Generate all years for picker
const YEARS = [];
for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
  YEARS.push(y.toString());
}

// Get era color for a year
function getEraColor(year) {
  const era = ERAS.find((e) => year >= e.start && year < e.end);
  return era?.color || "#666";
}

export default function YearPicker({
  selectedYear,
  onYearChange,
  correctYear,
  showResult,
  disabled,
}) {
  // Picker value state
  const [pickerValue, setPickerValue] = useState({
    year: selectedYear?.toString() || "1945",
  });

  // Sync external selectedYear to picker
  useEffect(() => {
    if (selectedYear && selectedYear.toString() !== pickerValue.year) {
      setPickerValue({ year: selectedYear.toString() });
    }
  }, [selectedYear]);

  // Handle picker change
  const handlePickerChange = (newValue) => {
    if (disabled || showResult) return;
    setPickerValue(newValue);
    const year = parseInt(newValue.year, 10);
    if (!isNaN(year)) {
      onYearChange(year);
    }
  };

  // Jump to era center
  const jumpToEra = (era) => {
    if (disabled || showResult) return;
    const year = Math.max(MIN_YEAR, Math.min(MAX_YEAR, era.center));
    setPickerValue({ year: year.toString() });
    onYearChange(year);
  };

  // Jump to decade center
  const jumpToDecade = (decade) => {
    if (disabled || showResult) return;
    const year = Math.max(MIN_YEAR, Math.min(MAX_YEAR, decade.center));
    setPickerValue({ year: year.toString() });
    onYearChange(year);
  };

  // Calculate result display
  const yearDiff = selectedYear && correctYear ? Math.abs(selectedYear - correctYear) : null;

  // Custom wheel item renderer
  const renderYearItem = (year) => {
    const yearNum = parseInt(year, 10);
    const color = getEraColor(yearNum);
    const isSelected = year === pickerValue.year;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: isSelected ? 1 : 0.5,
          }}
        />
        <Typography
          sx={{
            fontSize: isSelected ? "1.5rem" : "1.2rem",
            fontWeight: isSelected ? "bold" : "normal",
            color: isSelected ? "var(--foreground)" : "var(--foreground)",
            opacity: isSelected ? 1 : 0.6,
          }}
        >
          {year}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled || showResult ? "none" : "auto",
      }}
    >
      {/* Era chips */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 0.5,
          mb: 1,
        }}
      >
        {ERAS.map((era) => (
          <Chip
            key={era.name}
            label={era.short}
            size="small"
            onClick={() => jumpToEra(era)}
            sx={{
              backgroundColor: era.color,
              color: "#000",
              fontWeight: "bold",
              fontSize: "0.7rem",
              height: 24,
              cursor: disabled || showResult ? "default" : "pointer",
              "&:hover": {
                backgroundColor: disabled || showResult ? era.color : `${era.color}CC`,
              },
            }}
          />
        ))}
      </Box>

      {/* Decade chips */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 0.5,
          mb: 2,
        }}
      >
        {DECADES.map((decade) => (
          <Chip
            key={decade.label}
            label={decade.label}
            size="small"
            variant="outlined"
            onClick={() => jumpToDecade(decade)}
            sx={{
              borderColor: "var(--foreground)",
              color: "var(--foreground)",
              fontSize: "0.65rem",
              height: 22,
              minWidth: 32,
              cursor: disabled || showResult ? "default" : "pointer",
              "&:hover": {
                backgroundColor: disabled || showResult ? "transparent" : "rgba(255,255,255,0.1)",
              },
            }}
          />
        ))}
      </Box>

      {/* Wheel picker */}
      <Box
        sx={{
          position: "relative",
          height: 200,
          backgroundColor: "#1a1a1a",
          borderRadius: 2,
          overflow: "hidden",
          "& .picker-container": {
            height: "100%",
          },
          "& .picker-inner": {
            height: "100%",
          },
          "& .picker-column": {
            flex: 1,
          },
          "& .picker-item": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--foreground)",
          },
          "& .picker-highlight": {
            backgroundColor: "rgba(255,255,255,0.1)",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
          },
        }}
      >
        <Picker
          value={pickerValue}
          onChange={handlePickerChange}
          height={200}
          itemHeight={40}
          wheelMode="natural"
        >
          <Picker.Column name="year">
            {YEARS.map((year) => (
              <Picker.Item key={year} value={year}>
                {renderYearItem(year)}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>

        {/* Selection highlight overlay */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 40,
            transform: "translateY(-50%)",
            borderTop: "2px solid var(--accent)",
            borderBottom: "2px solid var(--accent)",
            pointerEvents: "none",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
      </Box>

      {/* Selected year display */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        {selectedYear ? (
          <Typography
            variant="h4"
            sx={{
              color: showResult
                ? yearDiff <= 3
                  ? "#4CAF50"
                  : yearDiff <= 10
                  ? "#FF9800"
                  : "#f44336"
                : "var(--accent)",
              fontWeight: "bold",
            }}
          >
            {selectedYear}
          </Typography>
        ) : (
          <Typography
            variant="body1"
            sx={{ color: "var(--foreground)", opacity: 0.5 }}
          >
            Scroll to select year
          </Typography>
        )}
      </Box>

      {/* Result display */}
      {showResult && correctYear && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "#4CAF50", fontWeight: "bold" }}
          >
            Correct: {correctYear}
          </Typography>
          {yearDiff !== null && (
            <Typography
              variant="h5"
              sx={{
                color:
                  yearDiff === 0
                    ? "#4CAF50"
                    : yearDiff <= 3
                    ? "#8BC34A"
                    : yearDiff <= 10
                    ? "#FF9800"
                    : "#f44336",
                fontWeight: "bold",
                mt: 1,
              }}
            >
              {yearDiff === 0 ? "EXACT!" : `Off by ${yearDiff} year${yearDiff !== 1 ? "s" : ""}`}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
