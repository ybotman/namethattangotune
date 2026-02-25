// ------------------------------------------------------------
// src/app/components/ui/GameSetupDials.js
// Mobile-first dial controls for Songs and Seconds
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import DialControl from "./DialControl";

export default function GameSetupDials({
  numSongs,
  onNumSongsChange,
  timeLimit,
  onTimeLimitChange,
  showSeconds = true,
  secondsLabel = "Seconds",
  songsMin = 3,
  songsMax = 25,
  secondsMin = 3,
  secondsMax = 30,
  clipLength,
  onClipLengthChange,
  showClipLength = false,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: { xs: 3, sm: 4 },
        mb: 2,
        py: 1,
      }}
    >
      {/* Songs Dial */}
      <DialControl
        label="Songs"
        value={numSongs}
        min={songsMin}
        max={songsMax}
        onChange={onNumSongsChange}
        size={90}
        color="#4CAF50"
      />

      {/* Seconds Dial */}
      {showSeconds && (
        <DialControl
          label={secondsLabel}
          value={timeLimit}
          min={secondsMin}
          max={secondsMax}
          onChange={onTimeLimitChange}
          size={90}
          color="#2196F3"
          unit="sec"
        />
      )}

      {/* Clip Length Dial (for clip-based games) */}
      {showClipLength && (
        <DialControl
          label="Clip"
          value={clipLength}
          min={1}
          max={7}
          onChange={onClipLengthChange}
          size={90}
          color="#FF9800"
          unit="sec"
        />
      )}
    </Box>
  );
}

GameSetupDials.propTypes = {
  numSongs: PropTypes.number.isRequired,
  onNumSongsChange: PropTypes.func.isRequired,
  timeLimit: PropTypes.number,
  onTimeLimitChange: PropTypes.func,
  showSeconds: PropTypes.bool,
  secondsLabel: PropTypes.string,
  songsMin: PropTypes.number,
  songsMax: PropTypes.number,
  secondsMin: PropTypes.number,
  secondsMax: PropTypes.number,
  clipLength: PropTypes.number,
  onClipLengthChange: PropTypes.func,
  showClipLength: PropTypes.bool,
};
