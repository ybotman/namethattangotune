//------------------------------------------------------------
// src/app/components/ui/BackButton.js
// Back navigation button for game pages
//------------------------------------------------------------
"use client";

import React from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import { IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function BackButton({
  href = "/games/gamehub",
  size = "small",
  tooltip = "Back to Menu",
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={handleClick}
        size={size}
        sx={{
          color: "var(--accent)",
          opacity: 0.7,
          "&:hover": { opacity: 1 },
        }}
        aria-label={tooltip}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
}

BackButton.propTypes = {
  href: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  tooltip: PropTypes.string,
};
