//------------------------------------------------------------
// src/components/ui/AnimatedButton.js
// Animated button with press/hover effects
//------------------------------------------------------------
"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@mui/material";
import PropTypes from "prop-types";

/**
 * AnimatedButton - MUI Button with motion animations
 */
export default function AnimatedButton({
  children,
  variant = "contained",
  color = "primary",
  onClick,
  disabled = false,
  fullWidth = false,
  sx = {},
  ...props
}) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{ display: fullWidth ? "block" : "inline-block" }}
    >
      <Button
        variant={variant}
        color={color}
        onClick={onClick}
        disabled={disabled}
        fullWidth={fullWidth}
        sx={{
          ...sx,
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

AnimatedButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  color: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  sx: PropTypes.object,
};
