//------------------------------------------------------------
// src/app/games/gamehub/page.js
// v2.1.0 - Swipeable menu with Welcome as first page
//------------------------------------------------------------
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Button, useMediaQuery, Modal, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import SwipeMenu from "@/components/ui/SwipeMenu";
import GameRow from "@/components/ui/GameRow";

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
          maxWidth: 400,
          mx: 2,
          p: 4,
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
            top: 8,
            right: 8,
            color: "var(--foreground)",
            opacity: 0.6,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h5"
          sx={{
            color: "var(--accent)",
            fontWeight: "bold",
            mb: 2,
          }}
        >
          Welcome to NTTT!
        </Typography>

        <Typography
          sx={{
            color: "var(--foreground)",
            mb: 3,
            fontSize: "1rem",
            lineHeight: 1.6,
          }}
        >
          For <strong>tango dancers</strong> who want to learn the music.
          Identify orchestras, singers, and songs by ear.
        </Typography>

        <Typography
          sx={{
            color: "var(--foreground)",
            opacity: 0.8,
            mb: 3,
            fontSize: "0.9rem",
          }}
        >
          <strong>Start with:</strong> Mastering Orchestras - learn how each orchestra sounds with no pressure.
        </Typography>

        <Typography
          sx={{
            color: "var(--foreground)",
            opacity: 0.6,
            mb: 3,
            fontSize: "0.8rem",
          }}
        >
          Swipe left/right to explore different game categories.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          sx={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontWeight: 700,
            py: 1.5,
            px: 4,
            fontSize: "1.1rem",
            borderRadius: 2,
            textTransform: "none",
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

// Welcome Page Content (first swipe)
function WelcomePage({ onQuickStart }) {
  const [visitCount, setVisitCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);
  const isMobile = useMediaQuery("(max-width: 600px)");

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
      {/* Banner */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          position: "relative",
          height: isMobile ? 70 : 90,
          mb: 1,
        }}
      >
        <Image
          src="/NTTTBanner3.png"
          alt="Name That Tango Tune"
          fill
          sizes="100vw"
          style={{ objectFit: "contain" }}
          priority
        />
      </Box>

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

      {/* Login Section (placeholder) */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          width: "100%",
          maxWidth: 320,
          opacity: 0.6,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "var(--foreground)",
            textAlign: "center",
          }}
        >
          Login coming soon - sync scores across devices
        </Typography>
      </Paper>

      {/* Messages Section (placeholder) */}
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
          v2.1: Swipeable menu, orchestra-first design, back buttons on all games.
          Coming soon: Competition mode & leaderboards!
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
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "var(--foreground)",
          opacity: 0.7,
          mb: 1,
        }}
      >
        Learn to identify orchestras by their sound
      </Typography>

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
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "var(--foreground)",
          opacity: 0.7,
          mb: 1,
        }}
      >
        Recognize tango singers by their voice
      </Typography>

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
    <Box sx={{ width: "100%", textAlign: "center" }}>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "var(--foreground)",
          opacity: 0.7,
          mb: 3,
        }}
      >
        Compete on predefined levels with global leaderboards
      </Typography>

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

// Listen/Other Page Content
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
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "var(--foreground)",
          opacity: 0.7,
          mb: 1,
        }}
      >
        Free listening, comparisons, and more
      </Typography>

      <GameRow
        title="Listen Mode"
        subtitle="Explore freely. Browse by orchestra, era, or style. No quiz, just music."
        mode="listen"
        path="/games/listen"
        helpTitle="Listen Mode"
        helpDescription="Browse and play songs freely. Filter by orchestra, era, style, or singer. No quiz, no scoring - just explore the music at your own pace."
      />
      <GameRow
        title="Same Song Compare"
        subtitle="Hear how different orchestras interpret the same classic. Side by side comparison."
        mode="compare"
        path="/games/same-song"
        helpTitle="Same Song Compare"
        helpDescription="Compare different recordings of the SAME song by different orchestras. Hear how each orchestra interprets classics like La Cumparsita differently."
      />
      <GameRow
        title="Song Quiz"
        subtitle="Know your classics? Hear a clip, guess the song title from 4 choices."
        mode="song"
        path="/games/song-quiz"
        helpTitle="Song Title Quiz"
        helpDescription="Listen to a clip and identify the song title from 4 choices. Tests your knowledge of tango classics and lesser-known gems."
      />
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
    <Box sx={{ width: "100%", maxWidth: 350 }}>
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
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: error ? "2px solid #E53935" : "1px solid gray",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--foreground)",
                    fontSize: "0.75rem",
                    width: "100px",
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleToolsUnlock}
                  sx={{
                    backgroundColor: "gray",
                    fontSize: "0.65rem",
                    py: 0.5,
                    minWidth: "auto",
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
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check if first visit on mount
  useEffect(() => {
    if (!hasSeenWelcome()) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    markWelcomeSeen();
    setShowWelcomeModal(false);
  };

  const handleStartFromWelcome = () => {
    markWelcomeSeen();
    setShowWelcomeModal(false);
    router.push("/games/orchestra-learn");
  };

  const handleQuickStart = () => {
    router.push("/games/orchestra-quiz");
  };

  // Define swipeable pages - Welcome is first
  const pages = [
    {
      title: "Welcome",
      label: "Home",
      content: <WelcomePage onQuickStart={handleQuickStart} />,
    },
    {
      title: "Orchestra",
      label: "Orch",
      content: <OrchestraPage />,
    },
    {
      title: "Singer",
      label: "Singer",
      content: <SingerPage />,
    },
    {
      title: "Contest",
      label: "Contest",
      content: <ContestPage />,
    },
    {
      title: "Listen",
      label: "Listen",
      content: <ListenPage />,
    },
    {
      title: "Setup",
      label: "Setup",
      content: <SetupPage />,
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

      {/* Beta Badge - compact */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(255, 193, 7, 0.8)",
            color: "#000",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.6rem",
            fontWeight: "bold",
          }}
        >
          BETA v2.1.0
        </Box>
      </Box>

      {/* Swipeable Menu */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SwipeMenu pages={pages} initialPage={0} />
      </Box>
    </Box>
  );
}
// Build test 2026-02-27-1704
