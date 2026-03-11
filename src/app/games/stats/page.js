//------------------------------------------------------------
// src/app/games/stats/page.js
// Dedicated stats page with 3x3 grid layout
// Rows: Orchestra, Singer, Song | Columns: Games, Correct, Best
//------------------------------------------------------------
"use client";

import React, { useContext } from "react";
import { Box, Typography, Paper, Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import PersonIcon from "@mui/icons-material/Person";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";

// Main quiz games for the 3x3 grid
const mainGames = [
  { id: "orchestra-quiz", name: "Orchestra", color: "#4FC3F7" },
  { id: "singer-quiz", name: "Singer", color: "#BA68C8" },
  { id: "song-quiz", name: "Song", color: "#FFD54F" },
];

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

  // Get stats for main games
  const getGameStats = (gameId) => {
    const stats = gameSummaries?.[gameId] || {};
    return {
      sessions: stats.sessionCount || 0,
      played: stats.totalPlayed || 0,
      correct: stats.totalCorrect || 0,
      best: stats.bestSessionScore || 0,
    };
  };

  // Calculate totals across main games
  let totalSessions = 0;
  let totalPlayed = 0;
  let totalCorrect = 0;
  let bestScore = 0;

  mainGames.forEach((game) => {
    const stats = getGameStats(game.id);
    totalSessions += stats.sessions;
    totalPlayed += stats.played;
    totalCorrect += stats.correct;
    if (stats.best > bestScore) bestScore = stats.best;
  });

  const totalAccuracy = totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

  // Check if any games played
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
            {/* Grand Total - Top */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: "var(--input-bg)",
                border: "2px solid var(--accent)",
                borderRadius: 2,
                mb: 3,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, mb: 1 }}>
                ALL QUIZZES
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {totalSessions}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.6 }}>Games</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {totalCorrect}/{totalPlayed}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.6 }}>Correct</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "#4CAF50" }}>
                    {totalAccuracy}%
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.6 }}>Accuracy</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFD700" }}>
                    {bestScore}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.6 }}>Best</Typography>
                </Box>
              </Box>
            </Paper>

            {/* 3x3 Grid - Column Headers */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 1fr 1fr",
                gap: 1,
                mb: 1,
              }}
            >
              <Box /> {/* Empty corner */}
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", color: "var(--accent)" }}>
                GAMES
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", color: "var(--accent)" }}>
                CORRECT
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", color: "var(--accent)" }}>
                BEST
              </Typography>
            </Box>

            {/* 3x3 Grid - Rows */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {mainGames.map((game, idx) => {
                const stats = getGameStats(game.id);
                const accuracy = stats.played > 0 ? Math.round((stats.correct / stats.played) * 100) : 0;
                return (
                  <Box
                    key={game.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 1fr 1fr",
                      gap: 1,
                      p: 1.5,
                      borderBottom: idx < mainGames.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                      alignItems: "center",
                    }}
                  >
                    {/* Row Label */}
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: game.color,
                      }}
                    >
                      {game.name}
                    </Typography>

                    {/* Games */}
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {stats.sessions}
                      </Typography>
                    </Box>

                    {/* Correct */}
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {stats.correct}/{stats.played}
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "#4CAF50" }}>
                        {accuracy}%
                      </Typography>
                    </Box>

                    {/* Best */}
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "#FFD700" }}>
                        {stats.best}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Paper>

            {/* Summary Bar */}
            <Paper
              elevation={0}
              sx={{
                mt: 1,
                p: 1.5,
                backgroundColor: "rgba(77, 208, 225, 0.1)",
                border: "1px solid var(--accent)",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr 1fr",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)" }}>
                  TOTAL
                </Typography>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}>
                  {totalSessions}
                </Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, textAlign: "center" }}>
                  {totalCorrect}/{totalPlayed}
                </Typography>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, textAlign: "center", color: "#FFD700" }}>
                  {bestScore}
                </Typography>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
