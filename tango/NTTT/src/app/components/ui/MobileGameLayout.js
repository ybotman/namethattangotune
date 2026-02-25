// ------------------------------------------------------------
// src/app/components/ui/MobileGameLayout.js
// Mobile-optimized game layout that handles browser bars and safe areas
// ------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

export default function MobileGameLayout({ children, actions, header }) {
  return (
    <Box
      sx={{
        // Use dvh for dynamic viewport height (handles mobile browser bars)
        minHeight: "100dvh",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
        color: "var(--foreground)",
        // Safe area padding for notched devices
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        overflow: "hidden",
      }}
    >
      {/* Header area - fixed height */}
      {header && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1,
          }}
        >
          {header}
        </Box>
      )}

      {/* Main content - scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 2,
          py: 1,
          // Extra padding at bottom to prevent content from being hidden behind actions
          pb: actions ? 10 : 2,
          // Smooth scrolling on iOS
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </Box>

      {/* Action buttons - sticky at bottom */}
      {actions && (
        <Box
          sx={{
            flexShrink: 0,
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            px: 2,
            py: 1.5,
            // Glass effect background
            backgroundColor: "rgba(var(--background-rgb, 0, 0, 0), 0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: "1px solid var(--accent)20",
            // Safe area padding for devices with home indicators
            paddingBottom: "calc(env(safe-area-inset-bottom, 8px) + 8px)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
            // Ensure it's always on top
            zIndex: 100,
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}

MobileGameLayout.propTypes = {
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  header: PropTypes.node,
};
