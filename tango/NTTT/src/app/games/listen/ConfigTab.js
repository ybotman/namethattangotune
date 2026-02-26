"use client";

import React from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import styles from "../styles.module.css";

import DialControl from "@/components/ui/DialControl";
import StylesSelector from "@/components/ui/StylesSelector";
import YearRangeSelector from "@/components/ui/YearRangeSelector";
import { useGameContext } from "@/contexts/GameContext";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

export default function ConfigTab({ artistOptions, singerOptions }) {
  const { config, updateConfig } = useGameContext();

  const instrumentalOnly = config.instrumentalOnly ?? false;
  const yearRange = config.yearRange ?? [1929, 1939];

  return (
    <Box className={styles.configurationContainer}>
      {/* Single Dial - Number of Songs */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <DialControl
          label="Songs"
          value={config.numSongs ?? 30}
          min={5}
          max={50}
          step={5}
          onChange={(val) => updateConfig("numSongs", val)}
          size={90}
          color="#4CAF50"
        />
      </Box>

      {/* Year Range */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "var(--foreground)",
            opacity: 0.6,
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontSize: "0.65rem",
          }}
        >
          Year Range
        </Typography>
        <YearRangeSelector
          value={config.yearRange ?? [1929, 1939]}
          onChange={(val) => updateConfig("yearRange", val)}
        />
      </Box>

      {/* Style */}
      <StylesSelector
        availableStyles={PRIMARY_STYLES}
        selectedStyles={config.styles || {}}
        onChange={(val) => updateConfig("styles", val)}
      />

      {/* Vocals Toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={instrumentalOnly}
              onChange={(e) => updateConfig("instrumentalOnly", e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "var(--foreground)", fontSize: "0.85rem" }}>
              Instrumental only
            </Typography>
          }
        />
      </Box>
    </Box>
  );
}
