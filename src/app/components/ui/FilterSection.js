// ------------------------------------------------------------
// src/app/components/ui/FilterSection.js
// Collapsible filter section for mobile-first game setup
// ------------------------------------------------------------
"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function FilterSection({
  title,
  summary,
  children,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box
      sx={{
        mb: 1.5,
        backgroundColor: "var(--input-bg)",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid var(--accent)20",
      }}
    >
      {/* Header - always visible */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "var(--accent)10",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "var(--foreground)",
              flexShrink: 0,
            }}
          >
            {title}
          </Typography>

          {/* Summary chips when collapsed */}
          {!expanded && summary && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                overflow: "hidden",
                flex: 1,
              }}
            >
              {Array.isArray(summary) ? (
                summary.slice(0, 3).map((item, idx) => (
                  <Chip
                    key={idx}
                    label={item}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      backgroundColor: "var(--accent)30",
                      color: "var(--foreground)",
                    }}
                  />
                ))
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--foreground)",
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {summary}
                </Typography>
              )}
              {Array.isArray(summary) && summary.length > 3 && (
                <Chip
                  label={`+${summary.length - 3}`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    backgroundColor: "var(--accent)20",
                    color: "var(--foreground)",
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        <IconButton
          size="small"
          sx={{ color: "var(--foreground)", p: 0.5 }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Collapsible content */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
            pt: 0,
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

FilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  children: PropTypes.node.isRequired,
  defaultExpanded: PropTypes.bool,
};
