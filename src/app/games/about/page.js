//------------------------------------------------------------
// src/app/games/about/page.js
// About NTTT page
//------------------------------------------------------------
"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import BackButton from "@/components/ui/BackButton";
import NTTT101 from "@/components/NTTT101";
import InstallPWA from "@/components/InstallPWA";

const APP_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev";
const PKG_VERSION = "2.8.3";

export default function AboutPage() {
  const [show101, setShow101] = useState(false);

  if (show101) {
    return <NTTT101 onClose={() => setShow101(false)} />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <BackButton />
        <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1, textAlign: "center" }}>
          About NTTT
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
        {/* NTTT 101 */}
        <Paper
          onClick={() => setShow101(true)}
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "rgba(77, 208, 225, 0.1)",
            border: "2px solid var(--accent)",
            borderRadius: 2,
            cursor: "pointer",
            mb: 2,
            "&:hover": { backgroundColor: "rgba(77, 208, 225, 0.2)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                NTTT 101
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "var(--foreground)", opacity: 0.8 }}>
                Learn how the app works
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "1.5rem", color: "var(--accent)" }}>→</Typography>
          </Box>
        </Paper>

        {/* What is NTTT */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", mb: 1.5 }}>
            What is NTTT?
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.7, mb: 2 }}>
            <strong>Name That Tango Tune</strong> is a music learning app for tango dancers and enthusiasts.
            Train your ear to recognize orchestras, singers, and songs from Argentina's Golden Age and beyond.
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "var(--foreground)", opacity: 0.8, lineHeight: 1.6 }}>
            With over 5,000 songs from 50+ orchestras, NTTT helps you develop the musical knowledge
            that makes social dancing more enjoyable.
          </Typography>
        </Paper>

        {/* Game Modes */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", mb: 1.5 }}>
            Game Modes
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                Orchestra Quiz
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Hear a clip, guess the orchestra. Start with famous ones, work up to obscure.
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                Singer Quiz
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Identify vocalists from Gardel to Goyeneche.
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                Song Quiz
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Know your classics? Name that tune!
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                Listen Mode
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                No quiz - just explore the music library.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Install */}
        <Box sx={{ mb: 2 }}>
          <InstallPWA variant="menuItem" showOnlyIfInstallable={false} />
        </Box>

        {/* About Toby */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", mb: 1.5 }}>
            About the Creator
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.7 }}>
            <strong>Toby Balsley</strong> is a Boston-based tango dancer and DJ building tools
            for the tango community.
          </Typography>
          <Typography
            component="a"
            href="https://www.tobytango.com/about"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: "0.85rem",
              color: "var(--accent)",
              textDecoration: "underline",
              display: "block",
              mt: 1.5,
            }}
          >
            tobytango.com →
          </Typography>
        </Paper>

        {/* Version */}
        <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.4, textAlign: "center", mt: 3 }}>
          v{PKG_VERSION} • Build: {APP_VERSION.slice(0, 7)}
        </Typography>
      </Box>
    </Box>
  );
}
