//------------------------------------------------------------
// src/app/games/explore/page.js
// v3.0.0 - Simple scrollable "All Games" page
// Replaces swipeable menu with clean list layout
//------------------------------------------------------------
"use client";

import React, { useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GridViewIcon from "@mui/icons-material/GridView";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import GameRow from "@/components/ui/GameRow";
import NTTT101 from "@/components/NTTT101";
import InstallPWA from "@/components/InstallPWA";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";

// Tools password
const TOOLS_PASSWORD = "!El4Gotan";

// App version
const APP_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev";
const PKG_VERSION = "2.8.3";

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

// Section Header Component
function SectionHeader({ title, image }) {
  const isMobile = useMediaQuery("(max-width: 600px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 1.5,
        mt: 3,
      }}
    >
      <Box
        sx={{
          width: isMobile ? 50 : 60,
          height: isMobile ? 50 : 60,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          border: "2px solid var(--accent)",
        }}
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="60px"
          style={{ objectFit: "cover" }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: isMobile ? "1.1rem" : "1.3rem",
          fontWeight: 700,
          color: "var(--accent)",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

// Game names for display
const gameDisplayNames = {
  "orchestra-quiz": "Orchestra",
  "singer-quiz": "Singer",
  "song-quiz": "Song",
  "year-learn": "Year",
};

// Stats Section
function StatsSection() {
  const { user } = useContext(AuthContext);
  const { loading, gameSummaries } = useContext(UserContext);

  if (!user) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <PersonIcon sx={{ fontSize: 32, color: "var(--accent)", mb: 1 }} />
        <Typography sx={{ fontSize: "0.85rem", color: "var(--foreground)", mb: 1.5 }}>
          Sign in to track your progress
        </Typography>
        <Link href="/auth/login" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="small"
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
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress sx={{ color: "var(--accent)" }} size={24} />
      </Box>
    );
  }

  // Calculate totals
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

  if (totalPlayed === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", color: "var(--foreground)", opacity: 0.7 }}>
          Play some games to see your stats!
        </Typography>
      </Paper>
    );
  }

  // Get per-game stats
  const gameStats = Object.entries(gameSummaries || {})
    .filter(([_, stats]) => stats.totalPlayed > 0)
    .map(([gameId, stats]) => ({
      name: gameDisplayNames[gameId] || gameId,
      games: stats.sessionCount || 0,
      played: stats.totalPlayed || 0,
      correct: stats.totalCorrect || 0,
      best: stats.bestSessionScore || 0,
    }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Overall Stats */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--accent)",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, mb: 1 }}>
          OVERALL
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" }}>
              {totalPlayed}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
              Played
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#4CAF50" }}>
              {accuracy}%
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
              Accuracy
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFD700" }}>
              {bestScore}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.6 }}>
              Best
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Per-Game Stats */}
      {gameStats.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, mb: 1.5 }}>
            BY GAME
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {gameStats.map((game) => (
              <Box
                key={game.name}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pb: 1,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", minWidth: 70 }}>
                  {game.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {game.games}
                    </Typography>
                    <Typography sx={{ fontSize: "0.5rem", color: "var(--foreground)", opacity: 0.5 }}>
                      Games
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {game.correct}/{game.played}
                    </Typography>
                    <Typography sx={{ fontSize: "0.5rem", color: "var(--foreground)", opacity: 0.5 }}>
                      Correct
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#FFD700" }}>
                      {game.best}
                    </Typography>
                    <Typography sx={{ fontSize: "0.5rem", color: "var(--foreground)", opacity: 0.5 }}>
                      Best
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

// About Section
function AboutSection() {
  const [show101, setShow101] = useState(false);

  if (show101) {
    return <NTTT101 onClose={() => setShow101(false)} />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* NTTT 101 */}
      <Paper
        onClick={() => setShow101(true)}
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "rgba(77, 208, 225, 0.1)",
          border: "2px solid var(--accent)",
          borderRadius: 2,
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(77, 208, 225, 0.2)" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)" }}>
              NTTT 101
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
              Learn how the app works
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "1.2rem", color: "var(--accent)" }}>→</Typography>
        </Box>
      </Paper>

      {/* About Toby */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.8rem", color: "var(--foreground)", lineHeight: 1.6 }}>
          <strong>Toby Balsley</strong> is a Boston-based tango enthusiast building tools for the tango community.
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
            display: "block",
            mt: 1,
          }}
        >
          tobytango.com →
        </Typography>
      </Paper>

      {/* Version */}
      <Typography sx={{ fontSize: "0.65rem", color: "var(--foreground)", opacity: 0.4, textAlign: "center" }}>
        v{PKG_VERSION} • Build: {APP_VERSION.slice(0, 7)}
      </Typography>
    </Box>
  );
}

// Setup Section
function SetupSection() {
  const [toolsUnlocked, setToolsUnlocked] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleToolsUnlock = () => {
    if (password === TOOLS_PASSWORD) {
      sessionStorage.setItem("nttt-tools-unlocked", "true");
      setToolsUnlocked(true);
      setShowPasswordInput(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Install App */}
      <InstallPWA variant="menuItem" showOnlyIfInstallable={false} />

      {/* Reports */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, mb: 1 }}>
          REPORTS
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
                }}
              >
                {r.name}
              </Button>
            </Link>
          ))}
        </Box>
      </Paper>

      {/* Tools */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", color: "gray", fontWeight: 600, mb: 1 }}>
          TOOLS
        </Typography>
        {!toolsUnlocked && !sessionStorage.getItem("nttt-tools-unlocked") ? (
          !showPasswordInput ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPasswordInput(true)}
              sx={{ borderColor: "gray", color: "gray", textTransform: "none", fontSize: "0.65rem" }}
            >
              Unlock
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleToolsUnlock()}
                placeholder="Password"
                autoFocus
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: error ? "2px solid #E53935" : "1px solid gray",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--foreground)",
                  fontSize: "0.8rem",
                  flex: 1,
                }}
              />
              <Button variant="contained" onClick={handleToolsUnlock} sx={{ backgroundColor: "gray" }}>
                Go
              </Button>
            </Box>
          )
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

// Main Explore Page
export default function ExplorePage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { user } = useContext(AuthContext);

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
          p: 2,
          borderBottom: "1px solid var(--border-color)",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--background)",
          zIndex: 10,
        }}
      >
        <Link href="/games/gamehub" style={{ textDecoration: "none" }}>
          <Button
            startIcon={<GridViewIcon />}
            sx={{
              color: "var(--accent)",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Hub
          </Button>
        </Link>

        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
          More Games
        </Typography>

        {user ? (
          <Avatar src={user.photoURL} sx={{ width: 32, height: 32, bgcolor: "var(--accent)" }}>
            {user.displayName?.[0] || <PersonIcon fontSize="small" />}
          </Avatar>
        ) : (
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button size="small" sx={{ color: "var(--accent)", textTransform: "none" }}>
              Sign In
            </Button>
          </Link>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 500, mx: "auto", px: 2, pb: 4 }}>

        {/* More Games - not on main hub grid */}
        <SectionHeader title="More Games" image="/Banner/Type1__ORCHESTRA.png" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <GameRow
            title="Orchestra Clip"
            subtitle="No timer. Replay clips as needed."
            mode="clip"
            path="/games/clip-orchestra"
          />
          <GameRow
            title="Orchestra Learn"
            subtitle="Deep dive into one orchestra's catalog."
            mode="learn"
            path="/games/orchestra-learn"
          />
          <GameRow
            title="Singer Clip"
            subtitle="No timer. Replay vocal clips at your pace."
            mode="clip"
            path="/games/clip-singer"
          />
          <GameRow
            title="Singer Learn"
            subtitle="Explore the great tango voices."
            mode="learn"
            path="/games/singer-learn"
          />
          <GameRow
            title="Same Song"
            subtitle="Compare different recordings of the same song."
            mode="listen"
            path="/games/same-song"
          />
        </Box>

        {/* Stats Section */}
        <SectionHeader title="Your Stats" image="/Banner/Type1__STATS.png" />
        <StatsSection />

        {/* Coming Soon Section */}
        <SectionHeader title="Coming Soon" image="/Banner/Type1__DAILY.png" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: 2,
            }}
          >
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#4CAF50" }}>
              Daily Challenge
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.7 }}>
              Fixed song sets. Compare scores with friends!
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 215, 0, 0.1)",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              borderRadius: 2,
            }}
          >
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#FFD700" }}>
              Contest Mode
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.7 }}>
              Weekly tournaments and leaderboards.
            </Typography>
          </Paper>
        </Box>

        {/* About Section */}
        <SectionHeader title="About" image="/Banner/Type1__NTTT.png" />
        <AboutSection />

      </Box>
    </Box>
  );
}
