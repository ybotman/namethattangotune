"use client";

import React, { useMemo } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import styles from "../styles.module.css";

import DialControl from "@/components/ui/DialControl";
import FilterSection from "@/components/ui/FilterSection";
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

  // Summary helpers
  const styleSummary = useMemo(() => {
    const styles = Object.keys(config.styles || {}).filter(k => config.styles[k]);
    return styles.length > 0 ? styles : ["All"];
  }, [config.styles]);

  const artistSummary = useMemo(() => {
    const artists = config.artists || [];
    if (artists.length === 0) return "All";
    return artists.map(a => a.label || a.value);
  }, [config.artists]);

  const singerSummary = useMemo(() => {
    if (instrumentalOnly) return "Instrumental only";
    const singers = (config.singers || []).map((s) =>
      typeof s === "string" ? s : (s.label || s.value)
    );
    return singers.length > 0 ? singers : "All";
  }, [config.singers, instrumentalOnly]);

  const yearRange = config.yearRange ?? [1929, 1939];
  const yearSummary = `${yearRange[0]} - ${yearRange[1]}`;

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

      {/* Filters */}
      <FilterSection title="Year Range" summary={yearSummary} defaultExpanded>
        <YearRangeSelector
          value={config.yearRange ?? [1929, 1939]}
          onChange={(val) => updateConfig("yearRange", val)}
        />
      </FilterSection>

      <FilterSection title="Style" summary={styleSummary}>
        <StylesSelector
          availableStyles={PRIMARY_STYLES}
          selectedStyles={config.styles || {}}
          onChange={(val) => updateConfig("styles", val)}
        />
      </FilterSection>

      <FilterSection title="Orchestra" summary={artistSummary}>
        <ArtistsSelector
          availableArtists={artistOptions}
          selectedArtists={config.artists || []}
          onChange={(val) => updateConfig("artists", val)}
        />
      </FilterSection>

      <FilterSection title="Vocals" summary={singerSummary}>
        <FormControlLabel
          control={
            <Switch
              checked={instrumentalOnly}
              onChange={(e) => updateConfig("instrumentalOnly", e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
              Instrumental only
            </Typography>
          }
          sx={{ mb: 1 }}
        />

        {!instrumentalOnly && (
          <SingersSelector
            availableSingers={singerOptions}
            selectedSingers={
              (config.singers || []).map((s) =>
                typeof s === "string" ? { label: s, value: s } : s
              )
            }
            onChange={(val) => updateConfig("singers", val)}
          />
        )}
      </FilterSection>
    </Box>
  );
}
