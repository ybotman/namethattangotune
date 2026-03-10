"use client";

import { IconButton, Tooltip } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import useFullscreen from "@/hooks/useFullscreen";

export default function FullscreenButton({ size = "small", color = "primary" }) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
      <IconButton
        onClick={toggleFullscreen}
        size={size}
        sx={{
          color: "var(--accent)",
          opacity: 0.7,
          "&:hover": { opacity: 1 },
        }}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Tooltip>
  );
}
