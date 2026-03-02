// ------------------------------------------------------------
// src/components/ui/PoolCount.js
// Real-time song pool count with minimum guard
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const MIN_POOL_SIZE = 20;

export default function PoolCount({ count, loading = false, message = null }) {
  const isValid = count >= MIN_POOL_SIZE;
  const isEmpty = count === 0;
  const hasCustomMessage = message !== null;

  const getColor = () => {
    if (hasCustomMessage) return "#FF9800"; // Warning color for custom message
    if (loading) return "var(--foreground)";
    if (isEmpty) return "#f44336";
    if (!isValid) return "#FF9800";
    return "#4CAF50";
  };

  const getMessage = () => {
    if (hasCustomMessage) return message;
    if (loading) return "Counting...";
    if (isEmpty) return "No songs match";
    if (!isValid) return `Only ${count} songs (need ${MIN_POOL_SIZE})`;
    return `${count} songs`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        py: 1,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: getColor(),
          animation: loading ? "pulse 1s infinite" : "none",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.4 },
          },
        }}
      />
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: getColor(),
        }}
      >
        {getMessage()}
      </Typography>
    </Box>
  );
}

PoolCount.propTypes = {
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  message: PropTypes.string,
};

// Export constant for use in other components
export { MIN_POOL_SIZE };
