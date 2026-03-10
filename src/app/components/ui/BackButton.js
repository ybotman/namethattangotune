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
  size = "large",
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
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: 0.9,
          "&:hover": {
            opacity: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
          width: 44,
          height: 44,
        }}
        aria-label={tooltip}
      >
        <ArrowBackIcon sx={{ fontSize: "1.5rem" }} />
      </IconButton>
    </Tooltip>
  );
}

BackButton.propTypes = {
  href: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  tooltip: PropTypes.string,
};
