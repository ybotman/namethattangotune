"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import YearDial, { START_YEAR, END_YEAR } from "./YearDial";
import useWaveSurfer from "@/hooks/useWaveSurfer";

export default function QuizTab({ songs, config, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit ?? 15);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const currentSong = songs[currentIndex];

  const { containerRef, isReady, play, pause } = useWaveSurfer(
    currentSong?.AudioUrl,
    {
      height: 60,
      waveColor: "#666",
      progressColor: "var(--accent)",
      barWidth: 2,
      barGap: 1,
    }
  );

  // Start playback and timer when ready
  useEffect(() => {
    if (isReady && !showResult && !gameOver) {
      hasSubmittedRef.current = false;
      play();
      setTimeLeft(config.timeLimit ?? 15);

      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto-submit when time runs out
            if (!hasSubmittedRef.current) {
              hasSubmittedRef.current = true;
              doSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, currentIndex, showResult, gameOver]);

  // Submit handler - uses ref to get current selectedYear
  const selectedYearRef = useRef(selectedYear);
  selectedYearRef.current = selectedYear;

  const doSubmit = () => {
    if (showResult) return;

    clearInterval(timerRef.current);
    pause();
    setShowResult(true);

    // Check if correct (within 3 years = full point, within 5 = half point)
    const correctYear = parseInt(currentSong?.Year, 10);
    const guessedYear = selectedYearRef.current;

    if (guessedYear && correctYear) {
      const diff = Math.abs(guessedYear - correctYear);
      if (diff <= 3) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      doSubmit();
    }
  };

  const handleYearClick = (year) => {
    if (!showResult) {
      setSelectedYear(year);
    }
  };

  const handleNext = () => {
    if (currentIndex >= songs.length - 1) {
      setGameOver(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedYear(null);
    setShowResult(false);
    setTimeLeft(config.timeLimit ?? 15);
    hasSubmittedRef.current = false;
  };

  if (gameOver) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, color: "var(--foreground)" }}>
          Game Over!
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: "var(--accent)" }}>
          Score: {score} / {songs.length}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "var(--foreground)" }}>
          {score === songs.length
            ? "Perfect! You're a tango historian!"
            : score >= songs.length * 0.7
            ? "Great job! You know your eras!"
            : score >= songs.length * 0.5
            ? "Not bad! Keep listening!"
            : "Keep practicing! You'll get better!"}
        </Typography>
        <Button
          variant="contained"
          onClick={onCancel}
          sx={{ backgroundColor: "var(--accent)" }}
        >
          Back to Config
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "var(--foreground)" }}>
          Song {currentIndex + 1} / {songs.length}
        </Typography>
        <Typography variant="h6" sx={{ color: "var(--accent)" }}>
          Score: {score}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
          sx={{ color: "var(--foreground)", borderColor: "var(--foreground)" }}
        >
          Quit
        </Button>
      </Box>

      {/* Timer */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
            Time
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: timeLeft <= 5 ? "#f44336" : "var(--foreground)",
              fontWeight: timeLeft <= 5 ? "bold" : "normal",
            }}
          >
            {timeLeft}s
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(timeLeft / (config.timeLimit ?? 15)) * 100}
          sx={{
            height: 8,
            borderRadius: 1,
            backgroundColor: "#333",
            "& .MuiLinearProgress-bar": {
              backgroundColor: timeLeft <= 5 ? "#f44336" : "var(--accent)",
            },
          }}
        />
      </Box>

      {/* Waveform */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "#222",
          borderRadius: 2,
        }}
      >
        <Box ref={containerRef} sx={{ width: "100%" }} />
        {showResult && currentSong && (
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "var(--foreground)", textAlign: "center" }}
          >
            {currentSong.Title} - {currentSong.ArtistMaster}
          </Typography>
        )}
      </Box>

      {/* Year Dial */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body1"
          sx={{ mb: 1, color: "var(--foreground)", textAlign: "center" }}
        >
          {showResult ? "The answer was:" : "Click on the dial to select a year:"}
        </Typography>
        <YearDial
          selectedYear={selectedYear}
          onYearClick={handleYearClick}
          correctYear={parseInt(currentSong?.Year, 10)}
          showResult={showResult}
          disabled={showResult}
        />
      </Box>

      {/* Submit / Next Button */}
      <Box sx={{ textAlign: "center" }}>
        {!showResult ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedYear}
            sx={{
              backgroundColor: "var(--accent)",
              "&:disabled": { backgroundColor: "#444" },
              px: 4,
              py: 1.5,
            }}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              backgroundColor: "var(--accent)",
              px: 4,
              py: 1.5,
            }}
          >
            {currentIndex >= songs.length - 1 ? "Finish" : "Next"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
