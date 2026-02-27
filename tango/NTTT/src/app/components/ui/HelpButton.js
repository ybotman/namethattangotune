"use client";

import React, { useState } from "react";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

/**
 * 3D Yellow help button that shows game instructions in a modal
 */
export default function HelpButton({ title, description, size = 40 }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          // Yellow gradient for 3D raised effect
          background: "linear-gradient(135deg, #FFE066 0%, #FFC107 40%, #E6A800 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          // Multiple shadows for 3D depth
          boxShadow: `
            0 4px 15px rgba(255, 193, 7, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.25),
            inset 0 2px 4px rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.15)
          `,
          border: "2px solid rgba(255, 255, 255, 0.3)",
          transition: "all 0.15s ease",
          "&:hover": {
            filter: "brightness(1.1)",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.95)",
            boxShadow: `
              0 2px 8px rgba(255, 193, 7, 0.3),
              0 1px 3px rgba(0, 0, 0, 0.2),
              inset 0 2px 4px rgba(0, 0, 0, 0.15)
            `,
          },
        }}
      >
        <HelpOutlineIcon
          sx={{
            fontSize: size * 0.55,
            color: "#5D4037",
            filter: "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.2))",
          }}
        />
      </Box>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: "var(--background)",
            border: "2px solid #FFC107",
            borderRadius: 3,
            p: 3,
            maxWidth: 350,
            position: "relative",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "var(--foreground)",
              opacity: 0.5,
              "&:hover": { opacity: 1 },
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, color: "#FFC107", pr: 3 }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "var(--foreground)", lineHeight: 1.7 }}
          >
            {description}
          </Typography>
        </Box>
      </Modal>
    </>
  );
}
