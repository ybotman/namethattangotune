//------------------------------------------------------------
// src/app/games/gamehub/page.js
// v3.0.0 - Grid-based GameHub (primary navigation)
// Mobile-aware 2x3 grid with quick access to core games
// "More" tile leads to full swipe menu at /games/explore
//------------------------------------------------------------
"use client";

import React, { useEffect, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Button,
  Modal,
  IconButton,
  Avatar,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonIcon from "@mui/icons-material/Person";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";
import InstallPWA from "@/components/InstallPWA";

// Visit tracking
const getVisitCount = () => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("nttt-visit-count") || "0", 10);
};

const incrementVisitCount = () => {
  if (typeof window === "undefined") return;
  const count = getVisitCount() + 1;
  localStorage.setItem("nttt-visit-count", count.toString());
  localStorage.setItem("nttt-last-visit", new Date().toISOString());
};

const hasSeenWelcome = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("nttt-seen-welcome") === "true";
};

const markWelcomeSeen = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nttt-seen-welcome", "true");
};

// App version
const APP_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";

// Game tiles for grid - 9 tiles for 3x3
const gameTiles = [
  {
    id: "orchestra",
    title: "Orchestra",
    subtitle: "Quiz",
    image: "/Banner/Type1__ORCHESTRA.png",
    href: "/games/orchestra-quiz",
    featured: true,
  },
  {
    id: "singer",
    title: "Singer",
    subtitle: "Quiz",
    image: "/Banner/Type1__SINGER.png",
    href: "/games/singer-quiz",
  },
  {
    id: "songs",
    title: "Song",
    subtitle: "Quiz",
    image: "/Banner/Type1__SONGS.png",
    href: "/games/song-quiz",
  },
  {
    id: "listen",
    title: "Listen",
    subtitle: "Mode",
    image: "/Banner/Type1__LISTEN.png",
    href: "/games/listen",
  },
  {
    id: "stats",
    title: "Your",
    subtitle: "Stats",
    image: "/Banner/Type1__STATS.png",
    href: "/games/explore?page=5",
  },
  {
    id: "daily",
    title: "Daily",
    subtitle: "Soon",
    image: "/Banner/Type1__DAILY.png",
    href: "/games/explore?page=6",
    comingSoon: true,
  },
  {
    id: "contest",
    title: "Contest",
    subtitle: "Soon",
    image: "/Banner/Type1__CONTEST.png",
    href: "/games/explore?page=7",
    comingSoon: true,
  },
  {
    id: "setup",
    title: "Setup",
    subtitle: "& Tools",
    image: "/Banner/Type1__SETUP.png",
    href: "/games/explore?page=8",
  },
  {
    id: "about",
    title: "About",
    subtitle: "NTTT",
    image: "/Banner/Type1__NTTT.png",
    href: "/games/explore?page=9",
  },
  {
    id: "more",
    title: "More",
    subtitle: "Games",
    image: "/Banner/Type1__NTTT.png",
    href: "/games/explore",
    isMore: true,
  },
];

// Welcome Modal for first-time visitors
function WelcomeModal({ open, onClose, onStart }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
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
          sx={{ color: "var(--accent)", fontWeight: "bold", mb: 1.5 }}
        >
          Welcome to NTTT!
        </Typography>

        <Typography
          sx={{ color: "var(--foreground)", mb: 2, fontSize: "0.9rem", lineHeight: 1.5 }}
        >
          Learn tango music by ear. Identify orchestras, singers, and songs.
        </Typography>

        <Typography
          sx={{ color: "var(--foreground)", opacity: 0.6, mb: 2, fontSize: "0.75rem" }}
        >
          Tap Orchestra Quiz to start!
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
            "&:hover": { backgroundColor: "#388E3C" },
          }}
        >
          Let&apos;s Go!
        </Button>
      </Paper>
    </Modal>
  );
}

// Game Tile Component
function GameTile({ tile, isMobile }) {
  return (
    <Link href={tile.href} style={{ textDecoration: "none" }}>
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          border: tile.featured
            ? "2px solid var(--accent)"
            : "1px solid var(--border-color)",
          backgroundColor: "var(--input-bg)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        }}
      >
        {/* Coming Soon badge */}
        {tile.comingSoon && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "#666",
              color: "#fff",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.55rem",
              fontWeight: 700,
              zIndex: 2,
            }}
          >
            SOON
          </Box>
        )}

        {/* Featured badge */}
        {tile.featured && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "var(--accent)",
              color: "#000",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.6rem",
              fontWeight: 700,
              zIndex: 2,
            }}
          >
            START
          </Box>
        )}

        {/* More badge */}
        {tile.isMore && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "#666",
              color: "#fff",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.6rem",
              fontWeight: 700,
              zIndex: 2,
            }}
          >
            ALL
          </Box>
        )}

        {/* Image */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: isMobile ? 80 : 100,
            overflow: "hidden",
          }}
        >
          <Image
            src={tile.image}
            alt={tile.title}
            fill
            sizes={isMobile ? "50vw" : "33vw"}
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
          />
        </Box>

        {/* Title */}
        <Box sx={{ p: isMobile ? 1 : 1.5, textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: isMobile ? "0.85rem" : "1rem",
              fontWeight: 700,
              color: "var(--foreground)",
              lineHeight: 1.1,
            }}
          >
            {tile.title}
          </Typography>
          <Typography
            sx={{
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              color: "var(--foreground)",
              opacity: 0.7,
            }}
          >
            {tile.subtitle}
          </Typography>
        </Box>
      </Paper>
    </Link>
  );
}

// Main GameHub Page
export default function GameHubPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { loading: userLoading, gameSummaries } = useContext(UserContext);
  const isMobile = useMediaQuery("(max-width: 600px)");

  const [showWelcome, setShowWelcome] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  // Track visits and show welcome
  useEffect(() => {
    const count = getVisitCount();
    setVisitCount(count);
    incrementVisitCount();

    if (!hasSeenWelcome()) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    markWelcomeSeen();
    setShowWelcome(false);
  };

  const handleStartFromWelcome = () => {
    markWelcomeSeen();
    setShowWelcome(false);
    router.push("/games/orchestra-quiz");
  };

  // Quick stats calculation
  const getQuickStats = () => {
    let totalPlayed = 0;
    let totalCorrect = 0;

    Object.values(gameSummaries || {}).forEach((game) => {
      totalPlayed += game.totalPlayed || 0;
      totalCorrect += game.totalCorrect || 0;
    });

    const accuracy = totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;
    return { totalPlayed, accuracy };
  };

  const stats = getQuickStats();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        py: 3,
      }}
    >
      {/* Welcome Modal */}
      <WelcomeModal
        open={showWelcome}
        onClose={handleCloseWelcome}
        onStart={handleStartFromWelcome}
      />

      {/* Header - Logo + User Status */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* Logo */}
        <Box sx={{ position: "relative", width: isMobile ? 120 : 150, height: isMobile ? 40 : 50 }}>
          <Image
            src="/Banner/Type2__NTTT.png"
            alt="NTTT"
            fill
            sizes="150px"
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>

        {/* User Status */}
        {authLoading ? (
          <CircularProgress size={24} sx={{ color: "var(--accent)" }} />
        ) : user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!userLoading && stats.totalPlayed > 0 && (
              <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)" }}>
                {stats.accuracy}%
              </Typography>
            )}
            <Avatar
              src={user.photoURL}
              sx={{ width: 32, height: 32, bgcolor: "var(--accent)" }}
            >
              {user.displayName?.[0] || <PersonIcon fontSize="small" />}
            </Avatar>
          </Box>
        ) : (
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button
              size="small"
              sx={{
                color: "var(--accent)",
                fontSize: "0.75rem",
                textTransform: "none",
              }}
            >
              Sign In
            </Button>
          </Link>
        )}
      </Box>

      {/* Visit counter */}
      {visitCount > 1 && (
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--foreground)",
            opacity: 0.5,
            mb: 1,
          }}
        >
          Visit #{visitCount}
        </Typography>
      )}

      {/* PWA Install Banner (mobile only) */}
      <Box sx={{ width: "100%", maxWidth: 400, mb: 2 }}>
        <InstallPWA variant="banner" />
      </Box>

      {/* Game Grid - 2x3 on mobile, 3x2 on desktop */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: isMobile ? 1.5 : 2,
          width: "100%",
          maxWidth: 400,
          mb: 3,
        }}
      >
        {gameTiles.map((tile) => (
          <GameTile key={tile.id} tile={tile} isMobile={isMobile} />
        ))}
      </Box>

      {/* Quick Stats (if logged in and has played) */}
      {user && stats.totalPlayed > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            width: "100%",
            maxWidth: 400,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                {stats.totalPlayed}
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
                Played
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#4CAF50" }}>
                {stats.accuracy}%
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
                Accuracy
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Footer Links */}
      <Box
        sx={{
          mt: "auto",
          pt: 2,
          display: "flex",
          gap: 2,
          fontSize: "0.75rem",
        }}
      >
        <Link href="/fairuse" style={{ color: "var(--foreground)", opacity: 0.5, textDecoration: "none" }}>
          Fair Use
        </Link>
        <Link href="/games/explore?page=9" style={{ color: "var(--foreground)", opacity: 0.5, textDecoration: "none" }}>
          About
        </Link>
        <Link href="/config" style={{ color: "var(--foreground)", opacity: 0.5, textDecoration: "none" }}>
          Settings
        </Link>
      </Box>

      <Typography
        sx={{
          fontSize: "0.65rem",
          color: "var(--foreground)",
          opacity: 0.3,
          mt: 1,
        }}
      >
        v{APP_VERSION} • Built by Toby Balsley
      </Typography>
    </Box>
  );
}
