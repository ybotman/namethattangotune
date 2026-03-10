//------------------------------------------------------------
// src/app/components/SignupPromptModal.js
// Popup shown every 5 visits to encourage signup
// Benefits: Tanda tracking, contests, social sharing, tango sites
//------------------------------------------------------------
"use client";

import React from "react";
import Link from "next/link";
import { Modal, Paper, Typography, Button, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const benefits = [
  { icon: "🎵", text: "Track your Tanda scores across sessions" },
  { icon: "🏆", text: "Compete in weekly contests & leaderboards" },
  { icon: "📱", text: "Share results to Instagram & Facebook" },
  { icon: "🌐", text: "Connect with TangoTiempo, Tangology.org & more" },
  { icon: "📊", text: "Detailed stats by orchestra & difficulty" },
  { icon: "🔥", text: "Daily streaks & achievements" },
];

export default function SignupPromptModal({ open, onClose, visitCount }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          maxWidth: "min(90vw, 360px)",
          mx: 2,
          p: 3,
          backgroundColor: "var(--background)",
          border: "2px solid var(--accent)",
          borderRadius: 3,
          position: "relative",
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "var(--foreground)",
            opacity: 0.6,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography sx={{ fontSize: "2rem", mb: 0.5 }}>🎉</Typography>
          <Typography
            variant="h6"
            sx={{
              color: "var(--accent)",
              fontWeight: "bold",
            }}
          >
            You&apos;re a Regular!
          </Typography>
          <Typography
            sx={{
              color: "var(--foreground)",
              opacity: 0.7,
              fontSize: "0.85rem",
            }}
          >
            Visit #{visitCount} — thanks for playing!
          </Typography>
        </Box>

        {/* Benefits */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "var(--foreground)",
              fontSize: "0.9rem",
              fontWeight: 600,
              mb: 1.5,
              textAlign: "center",
            }}
          >
            Sign up FREE to unlock:
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {benefits.map((benefit, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1,
                }}
              >
                <Typography sx={{ fontSize: "1.1rem" }}>{benefit.icon}</Typography>
                <Typography
                  sx={{
                    color: "var(--foreground)",
                    fontSize: "0.8rem",
                    opacity: 0.9,
                  }}
                >
                  {benefit.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Link href="/auth/signup" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#4CAF50",
                color: "#fff",
                fontWeight: 700,
                py: 1.5,
                fontSize: "1rem",
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#388E3C",
                },
              }}
            >
              Sign Up Free
            </Button>
          </Link>

          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                py: 1,
                fontSize: "0.85rem",
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Already have an account? Sign In
            </Button>
          </Link>

          <Button
            onClick={onClose}
            sx={{
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: "0.75rem",
              textTransform: "none",
              "&:hover": {
                opacity: 0.8,
                backgroundColor: "transparent",
              },
            }}
          >
            Maybe later
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
}
