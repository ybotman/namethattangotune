//------------------------------------------------------------
// src/app/games/gamehub/page.js
// v2.1.0 - Swipeable menu with Welcome as first page
//------------------------------------------------------------
"use client";

import React, { useEffect, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Paper, Button, useMediaQuery, Modal, IconButton, Avatar, CircularProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import SwipeMenu from "@/components/ui/SwipeMenu";
import GameRow from "@/components/ui/GameRow";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";

// Visit tracking
const getVisitCount = () => {
  if (typeof window === "undefined") return 0;
  const count = parseInt(localStorage.getItem("nttt-visit-count") || "0", 10);
  return count;
};

const incrementVisitCount = () => {
  if (typeof window === "undefined") return;
  const count = getVisitCount() + 1;
  localStorage.setItem("nttt-visit-count", count.toString());
  localStorage.setItem("nttt-last-visit", new Date().toISOString());
};

const getLastVisit = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nttt-last-visit");
};

// Tools password
const TOOLS_PASSWORD = "!El4Gotan";

// App version - uses Vercel commit SHA or fallback
const APP_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev";

// Version check - prompts refresh if new version detected
const checkAppVersion = () => {
  if (typeof window === "undefined") return false;
  const storedVersion = localStorage.getItem("nttt-app-version");
  if (storedVersion && storedVersion !== APP_VERSION && APP_VERSION !== "dev") {
    return true; // New version available
  }
  localStorage.setItem("nttt-app-version", APP_VERSION);
  return false;
};

// Check if user has seen welcome popup
const hasSeenWelcome = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("nttt-seen-welcome") === "true";
};

const markWelcomeSeen = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nttt-seen-welcome", "true");
};

// First-time Welcome Modal
function WelcomeModal({ open, onClose, onStart }) {
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
          maxWidth: "min(90vw, 320px)",
          mx: 2,
          p: 3,
          backgroundColor: "var(--background)",
          border: "2px solid var(--accent)",
          borderRadius: 3,
          position: "relative",
          textAlign: "center",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            color: "var(--foreground)",
            opacity: 0.6,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            color: "var(--accent)",
            fontWeight: "bold",
            mb: 1.5,
          }}
        >
          Welcome to NTTT!
        </Typography>

        <Typography
          sx={{
            color: "var(--foreground)",
            mb: 2,
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          Learn tango music by ear. Identify orchestras, singers, and songs.
        </Typography>

        <Typography
          sx={{
            color: "var(--foreground)",
            opacity: 0.6,
            mb: 2,
            fontSize: "0.75rem",
          }}
        >
          Swipe to explore game categories.
        </Typography>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          sx={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontWeight: 700,
            py: 1.5,
            px: 4,
            fontSize: "1rem",
            borderRadius: 2,
            textTransform: "none",
            minHeight: 48,
            "&:hover": {
              backgroundColor: "#388E3C",
            },
          }}
        >
          Let&apos;s Go!
        </Button>
      </Paper>
    </Modal>
  );
}

// Reports and Tools
const reports = [
  { name: "Orchestra Heatmap", path: "/reports/volumetrics/orchestra-heatmap" },
  { name: "Singer Heatmap", path: "/reports/volumetrics/singer-heatmap" },
  { name: "DNP Report", path: "/reports/volumetrics/dnp-report" },
];

const tools = [
  { name: "Recognition Validator", path: "/games/recognition-validator" },
  { name: "Data Quality", path: "/games/data-quality" },
];

// Page Banner Component
function PageBanner({ src, alt, contain = false, fade = false, position = "center" }) {
  const isMobile = useMediaQuery("(max-width: 600px)");

  // CDD-style edge fading effect
  const fadeStyles = fade ? {
    maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
    maskComposite: "intersect",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
    WebkitMaskComposite: "source-in",
  } : {};

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400,
        position: "relative",
        height: contain ? (isMobile ? 120 : 160) : (isMobile ? 100 : 140),
        mb: 2,
        borderRadius: contain ? 0 : 2,
        overflow: "hidden",
        ...fadeStyles,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        style={{ objectFit: contain ? "contain" : "cover", objectPosition: position }}
        priority
      />
    </Box>
  );
}

// Welcome Page Content (first swipe)
function WelcomePage({ onQuickStart, onViewStats }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { loading: userLoading, gameSummaries } = useContext(UserContext);
  const [visitCount, setVisitCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);

  useEffect(() => {
    setVisitCount(getVisitCount());
    setLastVisit(getLastVisit());
    incrementVisitCount();
  }, []);

  const formatLastVisit = (iso) => {
    if (!iso) return null;
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "earlier today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Calculate quick stats from gameSummaries
  const getQuickStats = () => {
    let totalPlayed = 0;
    let totalCorrect = 0;
    let bestScore = 0;

    Object.values(gameSummaries || {}).forEach((game) => {
      totalPlayed += game.totalPlayed || 0;
      totalCorrect += game.totalCorrect || 0;
      if (game.bestSessionScore > bestScore) {
        bestScore = game.bestSessionScore;
      }
    });

    const accuracy = totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;
    return { totalPlayed, accuracy, bestScore };
  };

  const stats = getQuickStats();

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Banner - Type1 with CSS auto-crop, focus on bandoneon */}
      <PageBanner src="/Banner/Type1__NTTT.png" alt="Name That Tango Tune" position="center 70%" />

      {/* Visit Stats */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
          maxWidth: 320,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.9rem",
            color: "var(--foreground)",
            textAlign: "center",
          }}
        >
          {visitCount <= 1 ? (
            "Welcome to NTTT!"
          ) : (
            <>
              Welcome back! Visit #{visitCount}
              {lastVisit && (
                <Typography
                  component="span"
                  sx={{ display: "block", fontSize: "0.7rem", opacity: 0.6, mt: 0.5 }}
                >
                  Last visit: {formatLastVisit(lastVisit)}
                </Typography>
              )}
            </>
          )}
        </Typography>
      </Paper>

      {/* Login / User Section */}
      {authLoading ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            width: "100%",
            maxWidth: 320,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={24} sx={{ color: "var(--accent)" }} />
        </Paper>
      ) : user ? (
        /* Logged In - Show User Info & Stats */
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--accent)",
            borderRadius: 2,
            width: "100%",
            maxWidth: 320,
          }}
        >
          {/* User Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar
              src={user.photoURL}
              sx={{
                width: 40,
                height: 40,
                bgcolor: "var(--accent)",
              }}
            >
              {user.displayName?.[0] || <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {user.displayName || "Tanguero"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "var(--foreground)",
                  opacity: 0.6,
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* Quick Stats */}
          {userLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress size={20} sx={{ color: "var(--accent)" }} />
            </Box>
          ) : stats.totalPlayed > 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                mb: 2,
                py: 1,
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 1,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                  {stats.totalPlayed}
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.7 }}>
                  Played
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.accuracy}%
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.7 }}>
                  Accuracy
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFD700" }}>
                  {stats.bestScore}
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.7 }}>
                  Best
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "var(--foreground)",
                opacity: 0.7,
                textAlign: "center",
                mb: 2,
              }}
            >
              Play some games to see your stats!
            </Typography>
          )}

          {/* View Stats Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<BarChartIcon />}
            onClick={onViewStats}
            sx={{
              width: "100%",
              borderColor: "var(--accent)",
              color: "var(--accent)",
              textTransform: "none",
              fontSize: "0.8rem",
            }}
          >
            View Full Stats
          </Button>
        </Paper>
      ) : (
        /* Not Logged In - Show Login Buttons */
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            width: "100%",
            maxWidth: 320,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: "var(--foreground)",
              textAlign: "center",
              mb: 2,
            }}
          >
            Sign in to track your progress across devices
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  px: 3,
                  py: 1,
                  minHeight: 44,
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  px: 2,
                  py: 1,
                  minHeight: 44,
                }}
              >
                Sign Up
              </Button>
            </Link>
          </Box>
        </Paper>
      )}

      {/* Messages Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
          maxWidth: 320,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "var(--accent)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          What&apos;s New
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "var(--foreground)",
            opacity: 0.8,
          }}
        >
          v2.2: User accounts & stats tracking! Sign in to save your progress.
          Coming soon: Status page with detailed stats & leaderboards!
        </Typography>
      </Paper>

    </Box>
  );
}

// Orchestra Page Content
function OrchestraPage() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <PageBanner src="/Banner/Type1__ORCHESTRA.png" alt="Orchestra Games" />

      <GameRow
        title="Orchestra Quiz"
        subtitle="Test your ear! Hear a clip, pick the orchestra from 4 choices. Choose your era, style, and difficulty level. Beat the clock for bonus points."
        mode="quiz"
        path="/games/orchestra-quiz"
        helpTitle="Orchestra Quiz"
        helpDescription="Listen to a clip and guess which orchestra is playing from 4 choices. Faster correct answers = higher scores. Wrong guesses reduce points. Filter by era, style, or familiarity level."
      />
      <GameRow
        title="Orchestra Clip"
        subtitle="Same challenge, no pressure. Replay clips as needed. Perfect for building confidence before timed mode."
        mode="clip"
        path="/games/clip-orchestra"
        helpTitle="Orchestra Clip Quiz"
        helpDescription="Same as Quiz but without time pressure. Replay the clip as many times as you need. Great for learning and building confidence before timed mode."
      />
      <GameRow
        title="Orchestra Learn"
        subtitle="Deep dive into one orchestra. Listen through their catalog and learn their signature sound across eras."
        mode="learn"
        path="/games/orchestra-learn"
        helpTitle="Mastering Orchestras"
        helpDescription="Select ONE orchestra and listen through their songs sequentially. Learn their distinctive sound, style evolution, and key singers. Sort by year to hear their progression."
      />
      <GameRow
        title="Year Quiz"
        subtitle="Can you hear the decade? Guess when each song was recorded. Learn how tango evolved from Old Guard to Renaissance."
        mode="year"
        path="/games/year-learn"
        helpTitle="Year Quiz"
        helpDescription="Listen to a clip and guess when it was recorded. Scoring based on how close you are - within 5 years is good, exact decade is great! Learn to hear how tango evolved."
      />
    </Box>
  );
}

// Singer Page Content
function SingerPage() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <PageBanner src="/Banner/Type1__SINGER.png" alt="Singer Games" />

      <GameRow
        title="Singer Quiz"
        subtitle="Test your ear for voices! Hear a vocal clip, identify the singer from 4 choices. Filter by era and familiarity."
        mode="quiz"
        path="/games/singer-quiz"
        helpTitle="Singer Quiz"
        helpDescription="Listen to a vocal clip and identify the singer from 4 choices. Only songs with vocals are included. Filter by orchestra, era, or singer familiarity."
      />
      <GameRow
        title="Singer Clip"
        subtitle="Same challenge, no timer. Replay vocal clips until you recognize the voice. Build your ear at your own pace."
        mode="clip"
        path="/games/clip-singer"
        helpTitle="Singer Clip Quiz"
        helpDescription="Same as Quiz but without time pressure. Replay the vocal clip as many times as needed. Perfect for learning singer voices at your own pace."
      />
      <GameRow
        title="Singer Learn"
        subtitle="Explore the great tango voices. Listen to singers across orchestras and eras. Learn each singer's distinctive style."
        mode="learn"
        path="/games/singer-learn"
        helpTitle="Mastering Singers"
        helpDescription="Browse songs with vocals. Select specific singers or let the app pick. Learn to recognize voices across different orchestras and eras."
      />
    </Box>
  );
}

// Contest Page Content (Coming Soon)
function ContestPage() {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PageBanner src="/Banner/Type1__CONTEST.png" alt="Contest Mode" />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: "rgba(255, 215, 0, 0.1)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          borderRadius: 2,
          maxWidth: 300,
          margin: "0 auto",
        }}
      >
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>🏆</Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#FFD700",
            mb: 1,
          }}
        >
          Coming Soon
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "var(--foreground)",
            opacity: 0.7,
          }}
        >
          Weekly tournaments, leaderboards, and ranked competition levels
        </Typography>
      </Paper>

      {/* Preview of competition levels */}
      <Box sx={{ mt: 3 }}>
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "var(--foreground)",
            opacity: 0.5,
            mb: 1,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Preview: Competition Levels
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {["Golden Age Classics", "Speed Round", "Deep Cuts"].map((level) => (
            <Box
              key={level}
              sx={{
                px: 1.5,
                py: 0.5,
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 1,
                fontSize: "0.65rem",
                color: "var(--foreground)",
                opacity: 0.5,
              }}
            >
              {level}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// Songs Page Content
function SongsPage() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <PageBanner src="/Banner/Type1__SONGS.png" alt="Song Games" />

      <GameRow
        title="Song Quiz"
        subtitle="Know your classics? Hear a clip, guess the song title from 4 choices."
        mode="song"
        path="/games/song-quiz"
        helpTitle="Song Title Quiz"
        helpDescription="Listen to a clip and identify the song title from 4 choices. Tests your knowledge of tango classics and lesser-known gems."
      />
      <GameRow
        title="Same Song Compare"
        subtitle="Hear how different orchestras interpret the same classic. Side by side comparison."
        mode="compare"
        path="/games/same-song"
        helpTitle="Same Song Compare"
        helpDescription="Compare different recordings of the SAME song by different orchestras. Hear how each orchestra interprets classics like La Cumparsita differently."
      />
    </Box>
  );
}

// Listen Page Content
function ListenPage() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <PageBanner src="/Banner/Type1__LISTEN.png" alt="Listen Mode" />

      <GameRow
        title="Listen Mode"
        subtitle="Explore freely. Browse by orchestra, era, or style. No quiz, just music."
        mode="listen"
        path="/games/listen"
        helpTitle="Listen Mode"
        helpDescription="Browse and play songs freely. Filter by orchestra, era, style, or singer. No quiz, no scoring - just explore the music at your own pace."
      />
    </Box>
  );
}

// Status Page Content - User Stats
function StatusPage() {
  const { user } = useContext(AuthContext);
  const { loading, gameSummaries } = useContext(UserContext);

  if (!user) {
    return (
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <PageBanner src="/Banner/Type2__Stats.png" alt="Your Stats" />
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            maxWidth: 300,
            textAlign: "center",
          }}
        >
          <PersonIcon sx={{ fontSize: 40, color: "var(--accent)", mb: 1 }} />
          <Typography sx={{ fontSize: "0.9rem", color: "var(--foreground)", mb: 2 }}>
            Sign in to track your progress
          </Typography>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--accent)",
                color: "#fff",
                textTransform: "none",
              }}
            >
              Sign In
            </Button>
          </Link>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <PageBanner src="/Banner/Type2__Stats.png" alt="Your Stats" />
        <CircularProgress sx={{ color: "var(--accent)", mt: 4 }} />
      </Box>
    );
  }

  const orchestraStats = gameSummaries["orchestra-quiz"] || null;
  const singerStats = gameSummaries["singer-quiz"] || null;

  // Helper to render a 3x3 stats grid
  const renderStatsGrid = (stats, gridKeys, title) => {
    if (!stats || Object.keys(stats.cells || {}).length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            width: "100%",
            maxWidth: 320,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.7 }}>
            No games played yet. Start playing to see your stats!
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
          maxWidth: 320,
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", mb: 1 }}>
          {title}
        </Typography>

        {/* Summary Stats */}
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2, py: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
              {stats.totalPlayed || 0}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
              Played
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#4CAF50" }}>
              {stats.accuracy || 0}%
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
              Accuracy
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#FFD700" }}>
              {stats.bestSessionScore || 0}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
              Best
            </Typography>
          </Box>
        </Box>

        {/* 3x3 Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.5,
          }}
        >
          {Object.entries(gridKeys).map(([cellNum, cellKey]) => {
            const cellStats = stats.cells?.[cellKey];
            const accuracy = cellStats?.accuracy || 0;
            const played = cellStats?.played || 0;

            // Color based on accuracy
            let bgColor = "rgba(100, 100, 100, 0.2)"; // Not played
            if (played > 0) {
              if (accuracy >= 80) bgColor = "rgba(76, 175, 80, 0.3)"; // Green
              else if (accuracy >= 60) bgColor = "rgba(255, 193, 7, 0.3)"; // Yellow
              else if (accuracy >= 40) bgColor = "rgba(255, 152, 0, 0.3)"; // Orange
              else bgColor = "rgba(244, 67, 54, 0.3)"; // Red
            }

            return (
              <Box
                key={cellNum}
                sx={{
                  p: 1,
                  backgroundColor: bgColor,
                  borderRadius: 1,
                  textAlign: "center",
                  minHeight: 50,
                }}
              >
                {played > 0 ? (
                  <>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {accuracy}%
                    </Typography>
                    <Typography sx={{ fontSize: "0.55rem", color: "var(--foreground)", opacity: 0.6 }}>
                      {played} played
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.4, mt: 1 }}>
                    -
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Grid Labels - Column headers: Icons/Core/Niche */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, px: 0.5 }}>
          <Typography sx={{ fontSize: "0.5rem", color: "var(--foreground)", opacity: 0.5 }}>
            Icons
          </Typography>
          <Typography sx={{ fontSize: "0.5rem", color: "var(--foreground)", opacity: 0.5 }}>
            Core
          </Typography>
          <Typography sx={{ fontSize: "0.5rem", color: "var(--foreground)", opacity: 0.5 }}>
            Niche
          </Typography>
        </Box>
      </Paper>
    );
  };

  // Grid key mappings - must match DifficultyGrid naming
  // Layout: Cols = Icons/Core/Niche, Rows = Famous/Known/Obscure
  const orchestraGridKeys = {
    1: "Icons-Famous", 2: "Core-Famous", 3: "Niche-Famous",
    4: "Icons-Known", 5: "Core-Known", 6: "Niche-Known",
    7: "Icons-Obscure", 8: "Core-Obscure", 9: "Niche-Obscure",
  };

  // Singer grid: Cols = Iconic/Essential/Standard, Rows = Famous/Common/Obscure
  const singerGridKeys = {
    1: "Iconic-Famous", 2: "Essential-Famous", 3: "Standard-Famous",
    4: "Iconic-Common", 5: "Essential-Common", 6: "Standard-Common",
    7: "Iconic-Obscure", 8: "Essential-Obscure", 9: "Standard-Obscure",
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PageBanner src="/Banner/Type2__Stats.png" alt="Your Stats" />

      <Typography
        sx={{
          fontSize: "0.65rem",
          color: "var(--accent)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          mb: 2,
        }}
      >
        Your Progress
      </Typography>

      {renderStatsGrid(orchestraStats, orchestraGridKeys, "Orchestra Quiz")}
      {renderStatsGrid(singerStats, singerGridKeys, "Singer Quiz")}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          borderRadius: 2,
          maxWidth: 320,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "0.75rem", color: "#4CAF50", fontWeight: 600 }}>
          More Coming Soon
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.7 }}>
          Detailed per-orchestra stats, leaderboards, and weekly challenges
        </Typography>
      </Paper>
    </Box>
  );
}

// Daily Page Content (Coming Soon)
function DailyPage() {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PageBanner src="/Banner/Type1__DAILY.png" alt="Daily Challenge" />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          borderRadius: 2,
          maxWidth: 300,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>📅</Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#4CAF50",
            mb: 1,
          }}
        >
          Coming Soon
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "var(--foreground)",
            opacity: 0.7,
          }}
        >
          Daily challenges with fixed song sets. Compare your scores with friends!
        </Typography>
      </Paper>
    </Box>
  );
}

// About Page Content
function AboutPage() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* About Toby - Main Focus */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--accent)",
          borderRadius: 2,
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          About Toby
        </Typography>
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: "var(--foreground)",
            lineHeight: 1.6,
            mb: 1.5,
          }}
        >
          <strong>Toby Balsley</strong> is a Boston-based tango enthusiast and tech guy who builds tools
          for the tango community. Dancing since 2015, he travels internationally with his wife Wailing
          and runs the Boston Tango Lab musicality classes.
        </Typography>
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "var(--foreground)",
            fontStyle: "italic",
            opacity: 0.8,
            mb: 1.5,
            borderLeft: "2px solid var(--accent)",
            pl: 1.5,
          }}
        >
          &quot;My mission is to help make the US tango community more musically aware by inspiring dancers
          to embrace the deep connection between music and partnered movement.&quot;
        </Typography>
        <Typography
          component="a"
          href="https://www.tobytango.com/about"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontSize: "0.75rem",
            color: "var(--accent)",
            textDecoration: "underline",
            "&:hover": { opacity: 0.8 },
          }}
        >
          tobytango.com →
        </Typography>
      </Paper>

      {/* Toby's Tango Projects */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1.5,
          }}
        >
          Tango Projects
        </Typography>

        {/* Project List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
            <Typography
              component="a"
              href="https://www.tangotiempo.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.85rem",
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Tango Tiempo
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
              National tango event calendar — uniting the U.S. tango community
            </Typography>
          </Box>

          <Box>
            <Typography
              component="a"
              href="https://www.bostontangocalendar.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.85rem",
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Boston Tango Calendar
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
              Local Boston area milongas, practicas, and workshops
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "0.85rem",
                color: "var(--foreground)",
                fontWeight: 600,
              }}
            >
              NTTT (This App)
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
              Learn to identify orchestras, singers, and songs by ear
            </Typography>
          </Box>

          <Box>
            <Typography
              component="a"
              href="https://www.tobytango.com/tango-history"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: "0.85rem",
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Tango History Timeline
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
              Interactive timeline from La Guardia Vieja to today (POC for tangology.org)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Mission */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Our Mission
        </Typography>
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: "var(--foreground)",
            lineHeight: 1.6,
          }}
        >
          To unite and strengthen the U.S. tango community by providing comprehensive, accessible,
          and free tools for discovering events and learning the music. From small practicas to
          national encuentros, we support connection through dance.
        </Typography>
      </Paper>

      {/* Built By HDTS */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "rgba(100, 100, 100, 0.1)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--foreground)",
            opacity: 0.7,
            textAlign: "center",
            mb: 0.5,
          }}
        >
          Built by
        </Typography>
        <Typography
          component="a"
          href="https://www.hdtsllc.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "block",
            fontSize: "0.8rem",
            color: "var(--foreground)",
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            "&:hover": { color: "var(--accent)" },
          }}
        >
          Half Way Down the Stairs, LLC
        </Typography>
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "var(--foreground)",
            opacity: 0.5,
            textAlign: "center",
            mt: 0.5,
          }}
        >
          AI-powered apps for communities
        </Typography>
      </Paper>
    </Box>
  );
}

// Setup Page Content
function SetupPage() {
  const [toolsUnlocked, setToolsUnlocked] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const unlocked = sessionStorage.getItem("nttt-tools-unlocked");
    if (unlocked === "true") setToolsUnlocked(true);
  }, []);

  const handleToolsUnlock = () => {
    if (password === TOOLS_PASSWORD) {
      sessionStorage.setItem("nttt-tools-unlocked", "true");
      setToolsUnlocked(true);
      setShowPasswordInput(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 350, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PageBanner src="/Banner/Type1__SETUP.png" alt="Setup" />
      {/* Reports */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "var(--accent)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Reports
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {reports.map((r) => (
            <Link key={r.path} href={r.path} style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                  textTransform: "none",
                  fontSize: "0.65rem",
                  py: 0.5,
                  px: 1,
                }}
              >
                {r.name}
              </Button>
            </Link>
          ))}
        </Box>
      </Paper>

      {/* Tools (password protected) */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "gray",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Tools
        </Typography>

        {!toolsUnlocked ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {!showPasswordInput ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPasswordInput(true)}
                sx={{
                  borderColor: "gray",
                  color: "gray",
                  textTransform: "none",
                  fontSize: "0.65rem",
                  alignSelf: "flex-start",
                }}
              >
                Unlock
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleToolsUnlock()}
                  placeholder="Password"
                  autoFocus
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: error ? "2px solid #E53935" : "1px solid gray",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                    flex: 1,
                    minWidth: 0,
                    minHeight: 40,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleToolsUnlock}
                  sx={{
                    backgroundColor: "gray",
                    fontSize: "0.8rem",
                    py: 1,
                    px: 2,
                    minHeight: 40,
                  }}
                >
                  Go
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tools.map((t) => (
              <Link key={t.path} href={t.path} style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                    textTransform: "none",
                    fontSize: "0.65rem",
                    py: 0.5,
                    px: 1,
                  }}
                >
                  {t.name}
                </Button>
              </Link>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// Main GameHub Page
export default function GameHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [targetPage, setTargetPage] = useState(undefined);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // Check for page param in URL (e.g., ?page=1 for Orchestra)
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam !== null) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum >= 0) {
        setTargetPage(pageNum);
      }
    }
  }, [searchParams]);

  // Check for app updates on mount
  useEffect(() => {
    if (checkAppVersion()) {
      setShowUpdateBanner(true);
    }
  }, []);

  // Check if first visit on mount
  useEffect(() => {
    if (!hasSeenWelcome()) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleRefresh = () => {
    localStorage.setItem("nttt-app-version", APP_VERSION);
    window.location.reload();
  };

  const handleCloseWelcome = () => {
    markWelcomeSeen();
    setShowWelcomeModal(false);
  };

  const handleStartFromWelcome = () => {
    markWelcomeSeen();
    setShowWelcomeModal(false);
    setTargetPage(1); // Navigate to Orchestra page (index 1)
  };

  const handleQuickStart = () => {
    router.push("/games/orchestra-quiz");
  };

  const handleViewStats = () => {
    setTargetPage(5); // Navigate to Status page (index 5)
  };

  // Define swipeable pages - Welcome is first
  const pages = [
    {
      title: "Welcome",
      label: "Home",
      image: "/Banner/Type2__NTTT.png",
      content: <WelcomePage onQuickStart={handleQuickStart} onViewStats={handleViewStats} />,
    },
    {
      title: "Orchestra",
      label: "Orch",
      image: "/Banner/Type2__ORCHESTRA.png",
      content: <OrchestraPage />,
    },
    {
      title: "Singer",
      label: "Singer",
      image: "/Banner/Type2__SINGER.png",
      content: <SingerPage />,
    },
    {
      title: "Songs",
      label: "Songs",
      image: "/Banner/Type2__SONGS.png",
      content: <SongsPage />,
    },
    {
      title: "Listen",
      label: "Listen",
      image: "/Banner/Type2__LISTEN.png",
      content: <ListenPage />,
    },
    {
      title: "Stats",
      label: "Stats",
      image: "/Banner/Type2__Stats.png",
      content: <StatusPage />,
    },
    {
      title: "Daily",
      label: "Daily",
      image: "/Banner/Type2__DAILY.png",
      content: <DailyPage />,
    },
    {
      title: "Contest",
      label: "Contest",
      image: "/Banner/Type2__CONTEST.png",
      content: <ContestPage />,
    },
    {
      title: "Setup",
      label: "Setup",
      image: "/Banner/Type2__SETUP.png",
      content: <SetupPage />,
    },
    {
      title: "About",
      label: "About",
      image: "/Banner/AboutToby.png",
      content: <AboutPage />,
    },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* First-time Welcome Modal */}
      <WelcomeModal
        open={showWelcomeModal}
        onClose={handleCloseWelcome}
        onStart={handleStartFromWelcome}
      />

      {/* Update Available Banner */}
      {showUpdateBanner && (
        <Box
          sx={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            py: 0.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
            New version available
          </Typography>
          <Button
            size="small"
            onClick={handleRefresh}
            sx={{
              color: "#fff",
              borderColor: "#fff",
              fontSize: "0.65rem",
              py: 0,
              minHeight: 24,
            }}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      )}

      {/* Swipeable Menu */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SwipeMenu pages={pages} initialPage={0} externalPage={targetPage} />
      </Box>

      {/* Quick Play FAB - Orchestra Quiz shortcut */}
      <Box
        onClick={() => router.push("/games/orchestra-quiz")}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          width: 56,
          height: 56,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            transform: "scale(1.1)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
          transition: "transform 0.2s ease",
          zIndex: 100,
        }}
      >
        <img
          src="/Banner/Type3__ORCHESTRA.png"
          alt="Orchestra Quiz"
          style={{ width: 56, height: 56, objectFit: "contain" }}
        />
      </Box>
    </Box>
  );
}
// Build test 2026-02-27-1704
