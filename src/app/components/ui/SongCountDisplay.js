// ------------------------------------------------------------
// src/components/ui/SongCountDisplay.js
// Shows available song count based on current filters
// Warns if count is less than requested number of songs
// ------------------------------------------------------------
"use client";

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Box, Typography, CircularProgress } from "@mui/material";
import { getFilteredSongCount } from "@/utils/dataFetching";

export default function SongCountDisplay({
  config,
  numSongs,
  gameType = "orchestra", // "orchestra" | "singer" | "general"
  onCountChange,
}) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Debounce the count fetch to avoid too many requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      // Build options based on config
      const options = {
        artists: (config.artists || []).map((a) => typeof a === 'string' ? a : a.value),
        styles: Object.keys(config.styles || {}).filter((k) => config.styles[k]),
        recognitionTiers: config.recognitionTiers || [1],
        periods: config.periods || [],
        includeSinger: config.includeSinger ?? false,
        requireSinger: gameType === "singer",
        requireOrchestra: gameType === "orchestra",
        singers: config.singers || [],
        yearRange: config.yearRange || null,
        duetFilter: config.duetFilter || 'solo',
      };

      const songCount = await getFilteredSongCount(options);
      setCount(songCount);
      setLoading(false);

      // Notify parent of count change
      if (onCountChange) {
        onCountChange(songCount);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    config.artists,
    config.styles,
    config.recognitionTiers,
    config.periods,
    config.includeSinger,
    config.singers,
    config.yearRange,
    config.duetFilter,
    gameType,
    onCountChange,
  ]);

  const isInsufficient = count !== null && count < numSongs;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.5,
        borderRadius: 1,
        backgroundColor: isInsufficient ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 255, 0, 0.1)",
        border: `1px solid ${isInsufficient ? "red" : "green"}`,
      }}
    >
      {loading ? (
        <CircularProgress size={16} />
      ) : (
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: isInsufficient ? "red" : "green",
          }}
        >
          {count ?? "..."} songs available
        </Typography>
      )}
      {isInsufficient && !loading && (
        <Typography variant="caption" sx={{ color: "red" }}>
          (need {numSongs})
        </Typography>
      )}
    </Box>
  );
}

SongCountDisplay.propTypes = {
  config: PropTypes.object.isRequired,
  numSongs: PropTypes.number.isRequired,
  gameType: PropTypes.oneOf(["orchestra", "singer", "general"]),
  onCountChange: PropTypes.func,
};

SongCountDisplay.defaultProps = {
  gameType: "orchestra",
  onCountChange: null,
};
