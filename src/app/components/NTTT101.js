// ------------------------------------------------------------
// src/app/components/NTTT101.js
// NTTT 101 Explainer - In-app documentation with topic navigation
// ------------------------------------------------------------
"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";

// Topic content
const TOPICS = [
  {
    id: "overview",
    title: "What is NTTT?",
    content: (
      <>
        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          <strong>Name That Tango Tune</strong> helps you learn to recognize tango music by ear.
          Through quizzes and practice modes, you&apos;ll develop the ability to identify:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <li>Which <strong>orchestra</strong> is playing</li>
          <li>Which <strong>singer</strong> is performing</li>
          <li>Which <strong>song</strong> you&apos;re hearing</li>
        </Box>
        <Typography sx={{ lineHeight: 1.7 }}>
          The app uses a difficulty system that matches your skill level, from iconic orchestras
          and famous songs (easier) to niche orchestras and deep cuts (harder).
        </Typography>
      </>
    ),
  },
  {
    id: "grid",
    title: "The 9-Grid System",
    content: (
      <>
        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          Difficulty is determined by a <strong>3×3 grid</strong> combining two factors:
        </Typography>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          Columns: Orchestra Level
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2, fontSize: "0.85rem" }}>
          <li><strong>Icons</strong> — Top 5-6 orchestras everyone knows (Di Sarli, D&apos;Arienzo, Troilo...)</li>
          <li><strong>Core</strong> — Next ~15 well-known orchestras (Tanturi, Laurenz, Fresedo...)</li>
          <li><strong>Niche</strong> — Lesser-known, specialty orchestras</li>
        </Box>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          Rows: Song Familiarity
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2, fontSize: "0.85rem" }}>
          <li><strong>Famous</strong> — The hits. Played constantly at milongas.</li>
          <li><strong>Known</strong> — Solid repertoire. Experienced dancers recognize them.</li>
          <li><strong>Obscure</strong> — Deep cuts. Even experts may not know them.</li>
        </Box>

        <Paper sx={{ p: 1.5, backgroundColor: "rgba(77, 208, 225, 0.1)", borderRadius: 1 }}>
          <Typography sx={{ fontSize: "0.8rem", fontFamily: "monospace", textAlign: "center" }}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Icons&nbsp;&nbsp;&nbsp;Core&nbsp;&nbsp;&nbsp;Niche<br/>
            Famous&nbsp;&nbsp;&nbsp;[EASY]&nbsp;&nbsp;[Med]&nbsp;&nbsp;&nbsp;[Med]<br/>
            Known&nbsp;&nbsp;&nbsp;&nbsp;[Med]&nbsp;&nbsp;&nbsp;[Med]&nbsp;&nbsp;&nbsp;[Hard]<br/>
            Obscure&nbsp;&nbsp;[Med]&nbsp;&nbsp;&nbsp;[Hard]&nbsp;&nbsp;[HARD]
          </Typography>
        </Paper>
      </>
    ),
  },
  {
    id: "curation",
    title: "How Songs Are Rated",
    content: (
      <>
        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          Each song gets placed in the grid through two processes:
        </Typography>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          1. Orchestra Level (Human Curated)
        </Typography>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", lineHeight: 1.6 }}>
          A human curator assigns each orchestra to Level 1 (Icons), 2 (Core), or 3-5 (Niche)
          based on global recognition and milonga play frequency.
        </Typography>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          2. Song Familiarity (Algorithm Calculated)
        </Typography>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Each song&apos;s familiarity is computed from play counts, ratings, and recognition scores,
          then normalized to a percentile within that orchestra&apos;s catalog.
        </Typography>

        <Box sx={{ pl: 2, borderLeft: "3px solid var(--accent)", mb: 2 }}>
          <Typography sx={{ fontSize: "0.85rem", fontStyle: "italic" }}>
            Top 30% = Famous<br/>
            Middle 40% = Known<br/>
            Bottom 30% = Obscure
          </Typography>
        </Box>
      </>
    ),
  },
  {
    id: "scoring",
    title: "How Scoring Works",
    content: (
      <>
        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          In <strong>Quiz mode</strong>, you earn points based on:
        </Typography>

        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <li><strong>Correct answer</strong> — Base points awarded</li>
          <li><strong>Speed bonus</strong> — Faster answers = more points</li>
          <li><strong>Streak bonus</strong> — Consecutive correct answers multiply score</li>
          <li><strong>Wrong answer</strong> — Points deducted, streak broken</li>
        </Box>

        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          In <strong>Learn mode</strong>, there&apos;s no scoring — just listen and learn at your own pace.
        </Typography>

        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          In <strong>Clip mode</strong>, you can replay clips without time pressure, but scores are still tracked.
        </Typography>
      </>
    ),
  },
  {
    id: "singers",
    title: "Singer Recognition",
    content: (
      <>
        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          Singer quizzes work similarly, but use <strong>Singer Level</strong> instead of Orchestra Level:
        </Typography>

        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <li><strong>Icons</strong> — The legendary voices (Fiorentino, Vargas, Podestá...)</li>
          <li><strong>Core</strong> — Well-known singers across multiple orchestras</li>
          <li><strong>Niche</strong> — Singers who recorded with only one or two orchestras</li>
        </Box>

        <Typography sx={{ lineHeight: 1.7 }}>
          Only songs with vocals are included in singer quizzes. Duets are marked separately.
        </Typography>
      </>
    ),
  },
  {
    id: "tips",
    title: "Tips for Learning",
    content: (
      <>
        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          Start Easy
        </Typography>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Begin with Icons-Famous. Master the top 5 orchestras&apos; biggest hits before moving on.
        </Typography>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          Listen for Signatures
        </Typography>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Each orchestra has a distinctive sound: D&apos;Arienzo&apos;s driving rhythm, Di Sarli&apos;s piano,
          Pugliese&apos;s dramatic pauses, Troilo&apos;s lyrical bandoneon.
        </Typography>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          Use Learn Mode
        </Typography>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Pick one orchestra and listen through their catalog. Build familiarity before testing yourself.
        </Typography>

        <Typography sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          Track Your Progress
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
          Sign in to save your stats. See which orchestras you know well and which need more practice.
        </Typography>
      </>
    ),
  },
];

export default function NTTT101({ onClose }) {
  const [currentTopic, setCurrentTopic] = useState(0);

  const topic = TOPICS[currentTopic];
  const canGoBack = currentTopic > 0;
  const canGoForward = currentTopic < TOPICS.length - 1;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header with close button */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          NTTT 101
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "var(--foreground)" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Topic navigation dots */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
        {TOPICS.map((t, i) => (
          <Box
            key={t.id}
            onClick={() => setCurrentTopic(i)}
            sx={{
              width: i === currentTopic ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentTopic ? "var(--accent)" : "var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </Box>

      {/* Topic content */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          minHeight: 300,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--foreground)",
            mb: 2,
            pb: 1,
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          {topic.title}
        </Typography>
        <Box sx={{ fontSize: "0.85rem", color: "var(--foreground)" }}>
          {topic.content}
        </Box>
      </Paper>

      {/* Navigation arrows */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <IconButton
          onClick={() => setCurrentTopic((p) => p - 1)}
          disabled={!canGoBack}
          sx={{
            color: canGoBack ? "var(--accent)" : "var(--border-color)",
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.6 }}>
          {currentTopic + 1} / {TOPICS.length}
        </Typography>

        <IconButton
          onClick={() => setCurrentTopic((p) => p + 1)}
          disabled={!canGoForward}
          sx={{
            color: canGoForward ? "var(--accent)" : "var(--border-color)",
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      {/* Topic list (compact) */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          backgroundColor: "rgba(100, 100, 100, 0.1)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.65rem", color: "var(--foreground)", opacity: 0.6, mb: 1 }}>
          TOPICS
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {TOPICS.map((t, i) => (
            <Typography
              key={t.id}
              onClick={() => setCurrentTopic(i)}
              sx={{
                fontSize: "0.7rem",
                color: i === currentTopic ? "var(--accent)" : "var(--foreground)",
                opacity: i === currentTopic ? 1 : 0.6,
                cursor: "pointer",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: i === currentTopic ? "rgba(77, 208, 225, 0.15)" : "transparent",
                "&:hover": { opacity: 1 },
              }}
            >
              {t.title}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
