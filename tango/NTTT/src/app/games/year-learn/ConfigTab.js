"use client";

import React from "react";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import SecondsSlider from "@/components/ui/SecondsSlider";
import StylesSelector from "@/components/ui/StylesSelector";
import { useGameContext } from "@/contexts/GameContext";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

export default function ConfigTab() {
  const { config, updateConfig } = useGameContext();

  // All styles toggle
  const allStylesSelected = PRIMARY_STYLES.every(
    (s) => config.styles?.[s.style] === true
  );

  const handleAllStylesToggle = (checked) => {
    if (checked) {
      const allStyles = {};
      PRIMARY_STYLES.forEach((s) => {
        allStyles[s.style] = true;
      });
      updateConfig("styles", allStyles);
    } else {
      updateConfig("styles", { Tango: true });
    }
  };

  const handleStylesChange = (newStyles) => {
    updateConfig("styles", newStyles);
  };

  return (
    <Box className={styles.configurationContainer}>
      {/* Sliders */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <SongsSlider
            label="# Songs"
            min={3}
            max={25}
            step={1}
            value={config.numSongs ?? 10}
            onChange={(val) => updateConfig("numSongs", val)}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SecondsSlider
            label="Seconds"
            min={5}
            max={30}
            step={1}
            value={config.timeLimit ?? 15}
            onChange={(val) => updateConfig("timeLimit", val)}
          />
        </Box>
      </Box>

      {/* Main Config */}
      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        {/* Instructions */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
            Listen to each song and click on the year dial to guess when it was recorded.
            <br /><br />
            Scoring: Within 3 years = 1 point
          </Typography>
        </Box>

        {/* Styles */}
        <Box sx={{ flex: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={allStylesSelected}
                onChange={(e) => handleAllStylesToggle(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "var(--accent)",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "var(--accent)",
                  },
                }}
              />
            }
            label="All Styles"
            sx={{ color: "var(--foreground)", mb: 1 }}
          />
          <StylesSelector
            label="Styles:"
            availableStyles={PRIMARY_STYLES}
            selectedStyles={config.styles || { Tango: true }}
            onChange={handleStylesChange}
          />
        </Box>
      </Box>
    </Box>
  );
}
