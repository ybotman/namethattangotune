"use client";

import React from "react";
import { Box } from "@mui/material";
import styles from "../styles.module.css";

import DialControl from "@/components/ui/DialControl";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import { useGameContext } from "@/contexts/GameContext";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

export default function ConfigTab({ artistOptions, singerOptions }) {
  const { config, updateConfig } = useGameContext();

  const includeSinger = config.includeSinger ?? true;

  return (
    <Box className={styles.configurationContainer}>
      {/* Single Dial - Number of Songs */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <DialControl
          label="Songs"
          value={config.numSongs ?? 50}
          min={5}
          max={100}
          step={5}
          onChange={(val) => updateConfig("numSongs", val)}
          size={90}
          color="#4CAF50"
        />
      </Box>

      {/* Style + Vocals */}
      <StylesSelector
        availableStyles={PRIMARY_STYLES}
        selectedStyles={config.styles || {}}
        onChange={(val) => updateConfig("styles", val)}
        showVocals={true}
        includeSinger={includeSinger}
        onVocalsChange={(val) => updateConfig("includeSinger", val)}
      />

      {/* Era */}
      <PeriodsSelector
        selectedPeriods={config.periods || []}
        onChange={(val) => updateConfig("periods", val)}
      />
    </Box>
  );
}
