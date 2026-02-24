"use client";

import React from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import styles from "../styles.module.css";

import SongsSlider from "@/components/ui/SongsSlider";
import StylesSelector from "@/components/ui/StylesSelector";
import ArtistsSelector from "@/components/ui/ArtistsSelector";
import SingersSelector from "@/components/ui/SingersSelector";
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

  return (
    <Box className={styles.configurationContainer}>
      {/* Number of songs */}
      <Box sx={{ mb: 3 }}>
        <SongsSlider
          label="# Songs"
          min={5}
          max={50}
          step={5}
          value={config.numSongs ?? 30}
          onChange={(val) => updateConfig("numSongs", val)}
        />
      </Box>

      {/* Year Range - default 1929-1939 */}
      <Box sx={{ mb: 3 }}>
        <YearRangeSelector
          label="Year Range:"
          value={config.yearRange ?? [1929, 1939]}
          onChange={(val) => updateConfig("yearRange", val)}
        />
      </Box>

      {/* Styles */}
      <Box sx={{ mb: 3 }}>
        <StylesSelector
          label="Styles:"
          availableStyles={PRIMARY_STYLES}
          selectedStyles={config.styles || {}}
          onChange={(val) => updateConfig("styles", val)}
        />
      </Box>

      {/* Orchestras */}
      <Box sx={{ mb: 3 }}>
        <ArtistsSelector
          label="Select Orchestras:"
          availableArtists={artistOptions}
          selectedArtists={config.artists || []}
          onChange={(val) => updateConfig("artists", val)}
        />
      </Box>

      {/* Instrumental Only Toggle */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={instrumentalOnly}
              onChange={(e) => updateConfig("instrumentalOnly", e.target.checked)}
            />
          }
          label={
            <Typography>
              Instrumental Only (no singers)
            </Typography>
          }
        />
      </Box>

      {/* Singers - hidden when instrumental only */}
      {!instrumentalOnly && (
        <Box sx={{ mb: 3 }}>
          <SingersSelector
            label="Select Singers:"
            availableSingers={singerOptions}
            selectedSingers={
              (config.singers || []).map((s) =>
                typeof s === "string" ? { label: s, value: s } : s
              )
            }
            onChange={(val) => updateConfig("singers", val)}
          />
        </Box>
      )}
    </Box>
  );
}
