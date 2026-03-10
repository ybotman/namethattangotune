//------------------------------------------------------------
// src/app/games/stats/page.js
// Dedicated stats page showing user game statistics
//------------------------------------------------------------
"use client";

import React, { useContext } from "react";
import { Box, Typography, Paper, Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import PersonIcon from "@mui/icons-material/Person";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";

// Game names for display
const gameDisplayNames = {
  "orchestra-quiz": "Orchestra Quiz",
  "singer-quiz": "Singer Quiz",
  "song-quiz": "Song Quiz",
  "year-learn": "Year Quiz",
};

export default function StatsPage() {
  const { user } = useContext(AuthContext);
  const { loading, gameSummaries } = useContext(UserContext);

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
  let totalPlayed = 0;
  let totalCorrect = 0;
  let bestScore = 0;
  let totalSessions = 0;

  Object.values(gameSummaries || {}).forEach((game) => {
    totalPlayed += game.totalPlayed || 0;
    totalCorrect += game.totalCorrect || 0;
    totalSessions += game.sessionCount || 0;
    if (game.bestSessionScore > bestScore) {
      bestScore = game.bestSessionScore;
    }
  });

  const accuracy = totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

  // Get per-game stats
  const gameStats = Object.entries(gameSummaries || {})
    .filter(([_, stats]) => stats.totalPlayed > 0)
    .map(([gameId, stats]) => ({
      id: gameId,
      name: gameDisplayNames[gameId] || gameId,
      sessions: stats.sessionCount || 0,
      played: stats.totalPlayed || 0,
      correct: stats.totalCorrect || 0,
      best: stats.bestSessionScore || 0,
      accuracy: stats.totalPlayed > 0 ? Math.round((stats.totalCorrect / stats.totalPlayed) * 100) : 0,
    }))
    .sort((a, b) => b.played - a.played);

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
        {totalPlayed === 0 ? (
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
            {/* Overall Stats */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: "var(--input-bg)",
                border: "2px solid var(--accent)",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600, mb: 2, textAlign: "center" }}>
                OVERALL STATS
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {totalSessions}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.6 }}>
                    Games
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {totalPlayed}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.6 }}>
                    Questions
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#4CAF50" }}>
                    {accuracy}%
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.6 }}>
                    Accuracy
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#FFD700" }}>
                    {bestScore}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--foreground)", opacity: 0.6 }}>
                    Best
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Per-Game Stats */}
            <Typography sx={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600, mb: 1.5 }}>
              BY GAME
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {gameStats.map((game) => (
                <Paper
                  key={game.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", mb: 1.5 }}>
                    {game.name}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {game.sessions}
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.5 }}>
                        Games
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {game.correct}/{game.played}
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.5 }}>
                        Correct
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "#4CAF50" }}>
                        {game.accuracy}%
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.5 }}>
                        Accuracy
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFD700" }}>
                        {game.best}
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "var(--foreground)", opacity: 0.5 }}>
                        Best
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
