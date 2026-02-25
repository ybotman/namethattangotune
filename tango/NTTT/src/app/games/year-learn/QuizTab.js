"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import YearDial, { DEFAULT_START_YEAR, DEFAULT_END_YEAR } from "./YearDial";
import useWaveSurfer from "@/hooks/useWaveSurfer";

export default function QuizTab({ songs, config, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit ?? 15);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const currentSong = songs[currentIndex];

  // Use the correct WaveSurfer API
  const { initWaveSurfer, cleanupWaveSurfer, playSnippet, waveSurferRef } = useWaveSurfer({
    onSongEnd: () => setIsPlaying(false),
  });

  // Initialize WaveSurfer on mount
  useEffect(() => {
    initWaveSurfer();
    return () => cleanupWaveSurfer();
  }, [initWaveSurfer, cleanupWaveSurfer]);

  // Play current song when index changes
  useEffect(() => {
    if (!currentSong?.AudioUrl || showResult || gameOver) return;

    hasSubmittedRef.current = false;
    setTimeLeft(config.timeLimit ?? 15);

    playSnippet(currentSong.AudioUrl, {
      snippetMaxStart: 60,
      fadeDurationSec: 0.5,
      onPlaySuccess: () => setIsPlaying(true),
      onPlayError: (err) => console.error("Play error:", err),
    });

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            doSubmitRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, gameOver]);

  // Submit handler - uses ref to get current selectedYear
  const selectedYearRef = useRef(selectedYear);
  selectedYearRef.current = selectedYear;

  const doSubmit = useCallback(() => {
    if (showResult) return;

    clearInterval(timerRef.current);
    // Stop playback
    if (waveSurferRef.current) {
      try { waveSurferRef.current.pause(); } catch (e) {}
    }
    setIsPlaying(false);
    setShowResult(true);

    // Check if correct (within 3 years = full point)
    const correctYear = parseInt(currentSong?.Year, 10);
    const guessedYear = selectedYearRef.current;

    if (guessedYear && correctYear) {
      const diff = Math.abs(guessedYear - correctYear);
      if (diff <= 3) {
        setScore((prev) => prev + 1);
      }
    }
  }, [showResult, currentSong]);

  // Keep a ref to doSubmit for timer callback
  const doSubmitRef = useRef(doSubmit);
  doSubmitRef.current = doSubmit;

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

      {/* Song Info (shown after answer) */}
      {showResult && currentSong && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#222",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" sx={{ color: "var(--foreground)" }}>
            {currentSong.Title}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--accent)" }}>
            {currentSong.ArtistMaster} ({currentSong.Year})
          </Typography>
        </Box>
      )}

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
          startYear={config.yearDialRange?.start ?? DEFAULT_START_YEAR}
          endYear={config.yearDialRange?.end ?? DEFAULT_END_YEAR}
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
