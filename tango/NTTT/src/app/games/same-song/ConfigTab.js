"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import styles from "../styles.module.css";

import DialControl from "@/components/ui/DialControl";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";

// All values for "no filter" defaults
const ALL_TIERS = [1, 2, 3, 4, 5];
const ALL_PERIODS = ["Old Guard", "New Guard", "Golden Age", "Decline", "Renaissance"];

export default function ConfigTab({ config, updateConfig }) {
  const handleTimeLimitChange = (value) => {
    updateConfig("timeLimit", value);
  };

  return (
    <Box className={styles.configurationContainer}>
      {/* Single Dial - Clip Duration */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <DialControl
          label="Clip"
          value={config.timeLimit ?? 15}
          min={5}
          max={30}
          onChange={handleTimeLimitChange}
          size={90}
          color="#2196F3"
          unit="sec"
        />
      </Box>

      {/* Familiarity - default all selected */}
      <RecognitionSelector
        selectedTiers={config.recognitionTiers ?? ALL_TIERS}
        onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
        compact
      />

      {/* Era - default all selected */}
      <PeriodsSelector
        selectedPeriods={config.periods ?? ALL_PERIODS}
        onChange={(val) => updateConfig("periods", val)}
      />

      {/* Instructions */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: "var(--input-bg)", borderRadius: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
          Compare recordings of the same song by different orchestras.
          Click to deselect filters. All songs included by default.
        </Typography>
      </Box>
    </Box>
  );
}

ConfigTab.propTypes = {
  config: PropTypes.object.isRequired,
  updateConfig: PropTypes.func.isRequired,
};
