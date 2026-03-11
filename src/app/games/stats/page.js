//------------------------------------------------------------
// src/app/games/stats/page.js
// Stats page with 3x3 summary + depth grids per game
//------------------------------------------------------------
"use client";

import React, { useContext, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Collapse } from "@mui/material";
import Link from "next/link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BackButton from "@/components/ui/BackButton";
import PersonIcon from "@mui/icons-material/Person";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";

// Main quiz games
const mainGames = [
  { id: "orchestra-quiz", name: "Orchestra", color: "#4FC3F7" },
  { id: "singer-quiz", name: "Singer", color: "#BA68C8" },
  { id: "song-quiz", name: "Song", color: "#FFD54F" },
];

// Grid definitions for each game type
const gridDefinitions = {
  "orchestra-quiz": {
    columns: ["Icons", "Essential", "Standard"],
    rows: ["Famous", "Common", "Obscure"],
  },
  "singer-quiz": {
    columns: ["Iconic", "Essential", "Standard"],
    rows: ["Famous", "Common", "Obscure"],
  },
};

// Depth Grid Component
function DepthGrid({ gameType, gameStats, color }) {
  const gridDef = gridDefinitions[gameType];
  if (!gridDef) return null;

  const cells = gameStats?.cells || {};

  // Get cell data
  const getCellData = (col, row) => {
    const key = `${col}-${row}`;
    const cell = cells[key] || {};
    return {
      played: cell.played || 0,
      correct: cell.correct || 0,
      best: cell.bestScore || 0,
      sessions: cell.sessions || 0,
    };
  };

  // Get color based on accuracy
  const getAccuracyColor = (played, correct) => {
    if (played === 0) return "rgba(255,255,255,0.05)";
    const acc = correct / played;
    if (acc >= 0.8) return "rgba(76, 175, 80, 0.4)"; // green
    if (acc >= 0.6) return "rgba(255, 193, 7, 0.4)"; // yellow
    if (acc >= 0.4) return "rgba(255, 152, 0, 0.4)"; // orange
    return "rgba(244, 67, 54, 0.3)"; // red
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Column Headers */}
      <Box sx={{ display: "flex", mb: 0.5 }}>
        <Box sx={{ width: 60 }} /> {/* Empty corner */}
        {gridDef.columns.map((col) => (
          <Box
            key={col}
            sx={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.6rem",
              fontWeight: 600,
              color: color,
              opacity: 0.8,
            }}
          >
            {col}
          </Box>
        ))}
      </Box>

      {/* Grid Rows */}
      {gridDef.rows.map((row) => (
        <Box key={row} sx={{ display: "flex", mb: 0.5 }}>
          {/* Row Label */}
          <Box
            sx={{
              width: 60,
              fontSize: "0.6rem",
              fontWeight: 600,
              color: "var(--foreground)",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
            }}
          >
            {row}
          </Box>

          {/* Cells */}
          {gridDef.columns.map((col) => {
            const data = getCellData(col, row);
            const acc = data.played > 0 ? Math.round((data.correct / data.played) * 100) : 0;
            return (
              <Box
                key={`${col}-${row}`}
                sx={{
                  flex: 1,
                  mx: 0.25,
                  p: 0.75,
                  borderRadius: 1,
                  backgroundColor: getAccuracyColor(data.played, data.correct),
                  border: data.played > 0 ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}
              >
                {data.played > 0 ? (
                  <>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {data.sessions}
                    </Typography>
                    <Typography sx={{ fontSize: "0.55rem", color: "var(--foreground)", opacity: 0.8 }}>
                      {data.correct}/{data.played}
                    </Typography>
                    <Typography sx={{ fontSize: "0.5rem", color: acc >= 70 ? "#4CAF50" : acc >= 50 ? "#FFC107" : "#FF5722" }}>
                      {acc}%
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.3 }}>
                    -
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      ))}

      {/* Legend */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "rgba(76, 175, 80, 0.4)" }} />
          <Typography sx={{ fontSize: "0.5rem", opacity: 0.6 }}>80%+</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "rgba(255, 193, 7, 0.4)" }} />
          <Typography sx={{ fontSize: "0.5rem", opacity: 0.6 }}>60-79%</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "rgba(255, 152, 0, 0.4)" }} />
          <Typography sx={{ fontSize: "0.5rem", opacity: 0.6 }}>40-59%</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "rgba(244, 67, 54, 0.3)" }} />
          <Typography sx={{ fontSize: "0.5rem", opacity: 0.6 }}>&lt;40%</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Expandable Game Section
function GameSection({ game, gameStats, gameSummary }) {
  const [expanded, setExpanded] = useState(false);
  const stats = gameSummary || {};
  const hasDepthGrid = gridDefinitions[game.id];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "var(--input-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Summary Row */}
      <Box
        onClick={() => hasDepthGrid && setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          cursor: hasDepthGrid ? "pointer" : "default",
          "&:hover": hasDepthGrid ? { backgroundColor: "rgba(255,255,255,0.03)" } : {},
        }}
      >
        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: game.color, minWidth: 80 }}>
          {game.name}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700 }}>{stats.sessionCount || 0}</Typography>
            <Typography sx={{ fontSize: "0.5rem", opacity: 0.5 }}>Games</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              {stats.totalCorrect || 0}/{stats.totalPlayed || 0}
            </Typography>
            <Typography sx={{ fontSize: "0.5rem", opacity: 0.5 }}>Correct</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFD700" }}>
              {stats.bestSessionScore || 0}
            </Typography>
            <Typography sx={{ fontSize: "0.5rem", opacity: 0.5 }}>Best</Typography>
          </Box>
        </Box>

        {hasDepthGrid && (
          <Box sx={{ ml: 1, color: "var(--accent)" }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        )}
      </Box>

      {/* Depth Grid (expandable) */}
      {hasDepthGrid && (
        <Collapse in={expanded}>
          <Box sx={{ px: 1.5, pb: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography sx={{ fontSize: "0.65rem", color: game.color, fontWeight: 600, mt: 1, mb: 0.5 }}>
              DEPTH BY DIFFICULTY
            </Typography>
            <DepthGrid gameType={game.id} gameStats={gameStats} color={game.color} />
          </Box>
        </Collapse>
      )}
    </Paper>
  );
}

export default function StatsPage() {
  const { user } = useContext(AuthContext);
  const { loading, gameSummaries, gameStats } = useContext(UserContext);

  // Not logged in
  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 2,
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          <PersonIcon sx={{ fontSize: 48, color: "var(--accent)", mb: 2 }} />
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, mb: 1 }}>
            Sign in to track your progress
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", opacity: 0.7, mb: 3 }}>
            Your game stats are saved when you sign in.
          </Typography>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--accent)",
                color: "#000",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Sign In
            </Button>
          </Link>
        </Paper>
      </Box>
    );
  }

  // Loading
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "var(--accent)" }} />
      </Box>
    );
  }

  // Calculate totals
  let totalSessions = 0;
  let totalPlayed = 0;
  let totalCorrect = 0;
  let bestScore = 0;

  mainGames.forEach((game) => {
    const stats = gameSummaries?.[game.id] || {};
    totalSessions += stats.sessionCount || 0;
    totalPlayed += stats.totalPlayed || 0;
    totalCorrect += stats.totalCorrect || 0;
    if ((stats.bestSessionScore || 0) > bestScore) bestScore = stats.bestSessionScore;
  });

  const totalAccuracy = totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;
  const hasPlayed = totalPlayed > 0;

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
          Your Stats
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
        {!hasPlayed ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: "var(--input-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "1rem", opacity: 0.7 }}>
              Play some games to see your stats!
            </Typography>
            <Link href="/games/gamehub" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "var(--accent)",
                  color: "#000",
                  textTransform: "none",
                }}
              >
                Play Now
              </Button>
            </Link>
          </Paper>
        ) : (
          <>
            {/* Grand Total */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: "var(--input-bg)",
                border: "2px solid var(--accent)",
                borderRadius: 2,
                mb: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, mb: 1 }}>
                ALL QUIZZES
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                <Box>
                  <Typography sx={{ fontSize: "1.6rem", fontWeight: 700 }}>{totalSessions}</Typography>
                  <Typography sx={{ fontSize: "0.55rem", opacity: 0.6 }}>Games</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.4rem", fontWeight: 700 }}>{totalCorrect}/{totalPlayed}</Typography>
                  <Typography sx={{ fontSize: "0.55rem", opacity: 0.6 }}>Correct</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#4CAF50" }}>{totalAccuracy}%</Typography>
                  <Typography sx={{ fontSize: "0.55rem", opacity: 0.6 }}>Accuracy</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#FFD700" }}>{bestScore}</Typography>
                  <Typography sx={{ fontSize: "0.55rem", opacity: 0.6 }}>Best</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Per-Game Sections (expandable) */}
            <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, mb: 1 }}>
              BY GAME (tap to expand)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {mainGames.map((game) => (
                <GameSection
                  key={game.id}
                  game={game}
                  gameStats={gameStats?.[game.id]}
                  gameSummary={gameSummaries?.[game.id]}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
