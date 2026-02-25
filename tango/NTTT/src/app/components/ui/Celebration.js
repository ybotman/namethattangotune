//------------------------------------------------------------
// src/components/ui/Celebration.js
// Celebration effects for correct answers and achievements
//------------------------------------------------------------
"use client";

import React, { useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { useReward } from "react-rewards";
import { Box } from "@mui/material";

/**
 * Celebration component that can be triggered imperatively
 * Usage:
 *   const celebrationRef = useRef();
 *   celebrationRef.current.celebrate("confetti"); // or "emoji" or "balloons"
 */
const Celebration = forwardRef(function Celebration({ id = "celebration" }, ref) {
  // Confetti reward
  const { reward: confettiReward, isAnimating: confettiAnimating } = useReward(
    `${id}-confetti`,
    "confetti",
    {
      elementCount: 100,
      spread: 90,
      startVelocity: 35,
      decay: 0.91,
      lifetime: 200,
    }
  );

  // Emoji reward (tango-themed)
  const { reward: emojiReward, isAnimating: emojiAnimating } = useReward(
    `${id}-emoji`,
    "emoji",
    {
      emoji: ["💃", "🕺", "🎵", "🎶", "✨", "🔥", "👏"],
      elementCount: 30,
      spread: 80,
      startVelocity: 25,
      decay: 0.94,
      lifetime: 150,
    }
  );

  // Balloons reward
  const { reward: balloonReward, isAnimating: balloonAnimating } = useReward(
    `${id}-balloon`,
    "balloons",
    {
      elementCount: 15,
      spread: 60,
      startVelocity: 20,
      decay: 0.95,
      lifetime: 300,
    }
  );

  // Expose celebrate method via ref
  useImperativeHandle(ref, () => ({
    celebrate: (type = "confetti") => {
      switch (type) {
        case "emoji":
          emojiReward();
          break;
        case "balloons":
          balloonReward();
          break;
        case "confetti":
        default:
          confettiReward();
          break;
      }
    },
    isAnimating: confettiAnimating || emojiAnimating || balloonAnimating,
  }));

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      {/* Reward anchor points */}
      <span id={`${id}-confetti`} />
      <span id={`${id}-emoji`} />
      <span id={`${id}-balloon`} />
    </Box>
  );
});

export default Celebration;
