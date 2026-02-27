// src/app/games/gamehub/page.js
// Mobile-first compact game hub

"use client";
import React from "react";
import Image from "next/image";
import { Box, Typography, Paper, useMediaQuery, Button } from "@mui/material";
import Link from "next/link";
import { trackGameClick, trackReportClick } from "@/utils/analytics";

// Tools password
const TOOLS_PASSWORD = "!El4Gotan";

// All games in a flat structure with category labels
const games = [
  // Timed Quiz
  { name: "Orchestra", path: "/games/artist-quiz", icon: "icons/IconQuiz.webp", category: "Timed" },
  { name: "Singer", path: "/games/singer-quiz", icon: "icons/IconSinger.webp", category: "Timed" },
  { name: "Song", path: "/games/song-quiz", icon: "icons/IconLearnSongs.webp", category: "Timed" },
  { name: "Year", path: "/games/year-learn", icon: "icons/IconLearnDecade.webp", category: "Timed" },
  // Clip Quiz
  { name: "Orchestra", path: "/games/clip-orchestra", icon: "icons/IconQuiz.webp", category: "Clip" },
  { name: "Singer", path: "/games/clip-singer", icon: "icons/IconSinger.webp", category: "Clip" },
  // Learn Mode
  { name: "Orchestra", path: "/games/artist-learn", icon: "icons/IconLearnOrch.webp", category: "Learn" },
  { name: "Singer", path: "/games/singer-learn", icon: "icons/IconLearnSinger.webp", category: "Learn" },
  // Other
  { name: "Listen", path: "/games/listen", icon: "icons/IconLearnOrch.webp", category: "Other" },
  { name: "Compare", path: "/games/same-song", icon: "icons/IconLearnSongs.webp", category: "Other" },
];

// Reports and Tools - button only
const reports = [
  { name: "Orchestra Heatmap", path: "/reports/volumetrics/orchestra-heatmap" },
  { name: "Singer Heatmap", path: "/reports/volumetrics/singer-heatmap" },
  { name: "DNP Report", path: "/reports/volumetrics/dnp-report" },
];

const tools = [
  { name: "Recognition Validator", path: "/games/recognition-validator" },
  { name: "Data Quality", path: "/games/data-quality" },
];

// Category colors
const categoryColors = {
  Timed: "#FF6B6B",
  Clip: "#4ECDC4",
  Learn: "#45B7D1",
  Other: "#96CEB4",
};

function CompactGameCard({ game, size = 48 }) {
  const handleClick = () => {
    trackGameClick(game.name, game.category);
  };

  return (
    <Link href={game.path} style={{ textDecoration: "none" }} onClick={handleClick}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: size + 16,
        }}
      >
        {/* Icon block */}
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: 1.5,
            overflow: "hidden",
            border: `2px solid ${categoryColors[game.category]}`,
            backgroundColor: "var(--input-bg)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            position: "relative",
            "&:hover": {
              transform: "scale(1.08)",
              borderColor: "var(--accent)",
              boxShadow: `0 0 12px ${categoryColors[game.category]}66`,
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          <Image
            src={`/${game.icon}`}
            alt={game.name}
            fill
            sizes={`${size}px`}
            style={{ objectFit: "cover" }}
          />
        </Box>

        {/* Label below */}
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "var(--foreground)",
            opacity: 0.7,
            fontWeight: 500,
            textAlign: "center",
            mt: 0.5,
          }}
        >
          {game.name}
        </Typography>
      </Box>
    </Link>
  );
}

function CategoryRow({ category, categoryGames, size }) {
  return (
    <Box sx={{ mb: 2 }}>
      {/* Category label */}
      <Typography
        sx={{
          fontSize: "0.65rem",
          color: categoryColors[category],
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          mb: 0.5,
          textAlign: "center",
        }}
      >
        {category === "Timed" ? "Timed Quiz" : category === "Clip" ? "Clip Quiz" : category === "Learn" ? "Learn Mode" : "Other"}
      </Typography>

      {/* Games in row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {categoryGames.map((game) => (
          <CompactGameCard key={game.path} game={game} size={size} />
        ))}
      </Box>
    </Box>
  );
}

// Beta Banner - more compact
function BetaBanner() {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    const wasDismissed = sessionStorage.getItem("nttt-beta-dismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("nttt-beta-dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Box
      sx={{
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        border: "1px solid rgba(255, 193, 7, 0.3)",
        borderRadius: 2,
        p: 1.5,
        mb: 2,
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            backgroundColor: "rgba(255, 193, 7, 0.8)",
            color: "#000",
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: "0.7rem",
            fontWeight: "bold",
          }}
        >
          BETA
        </Box>
        <Typography variant="body2" sx={{ color: "var(--foreground)", fontSize: "0.8rem" }}>
          NTTT 2.0 - Under active development
        </Typography>
      </Box>
      <Button
        size="small"
        onClick={handleDismiss}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          minWidth: "auto",
          p: 0.5,
          color: "var(--foreground)",
          opacity: 0.5,
          fontSize: "0.7rem",
        }}
      >
        X
      </Button>
    </Box>
  );
}

export default function GameHubPage() {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [toolsUnlocked, setToolsUnlocked] = React.useState(false);
  const [showPasswordInput, setShowPasswordInput] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(false);

  const iconSize = isMobile ? 64 : 72;

  React.useEffect(() => {
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

  // Group games by category
  const gamesByCategory = {
    Timed: games.filter(g => g.category === "Timed"),
    Clip: games.filter(g => g.category === "Clip"),
    Learn: games.filter(g => g.category === "Learn"),
    Other: games.filter(g => g.category === "Other"),
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        p: isMobile ? 1.5 : 3,
      }}
    >
      {/* Beta Banner */}
      <BetaBanner />

      {/* Banner */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          mb: 2,
          position: "relative",
          height: isMobile ? 80 : 100,
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

      {/* Games Grid - by category */}
      <Box sx={{ maxWidth: 420, margin: "0 auto" }}>
        {Object.entries(gamesByCategory).map(([category, categoryGames]) => (
          <CategoryRow
            key={category}
            category={category}
            categoryGames={categoryGames}
            size={iconSize}
          />
        ))}
      </Box>

      {/* Reports - compact buttons */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mt: 2,
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          maxWidth: 420,
          margin: "16px auto 0",
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
            textAlign: "center",
          }}
        >
          Reports
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          {reports.map((r) => (
            <Link key={r.path} href={r.path} style={{ textDecoration: "none" }} onClick={() => trackReportClick(r.name)}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                  textTransform: "none",
                  fontSize: "0.7rem",
                  py: 0.5,
                  px: 1.5,
                  "&:hover": {
                    borderColor: "var(--accent)",
                    backgroundColor: "rgba(102, 170, 255, 0.1)",
                  },
                }}
              >
                {r.name}
              </Button>
            </Link>
          ))}
        </Box>
      </Paper>

      {/* Tools - password protected */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mt: 2,
          backgroundColor: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          maxWidth: 420,
          margin: "16px auto 0",
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
            textAlign: "center",
          }}
        >
          Tools
        </Typography>

        {!toolsUnlocked ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {!showPasswordInput ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPasswordInput(true)}
                sx={{
                  borderColor: "gray",
                  color: "gray",
                  textTransform: "none",
                  fontSize: "0.7rem",
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
                    fontSize: "0.8rem",
                    width: "100px",
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleToolsUnlock}
                  sx={{
                    backgroundColor: "gray",
                    fontSize: "0.7rem",
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
            {tools.map((t) => (
              <Link key={t.path} href={t.path} style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                    textTransform: "none",
                    fontSize: "0.7rem",
                    py: 0.5,
                    px: 1.5,
                    "&:hover": {
                      borderColor: "var(--accent)",
                      backgroundColor: "rgba(102, 170, 255, 0.1)",
                    },
                  }}
                >
                  {t.name}
                </Button>
              </Link>
            ))}
          </Box>
        )}
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 3, pb: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.4 }}>
          NTTT v2.0.7
        </Typography>
      </Box>
    </Box>
  );
}
