//
// src/app/games/year-learn/QuizTab.js
//
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import YearPicker from "./YearPicker";
import useWaveSurfer from "@/hooks/useWaveSurfer";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";
import Celebration from "@/components/ui/Celebration";
import AnimatedScore from "@/components/ui/AnimatedScore";
import AnimatedButton from "@/components/ui/AnimatedButton";

// Scoring constants
const BASE_SCORE = 1000;
const MAX_YEAR_DIFF = 20; // Max difference for any points (tighter = harder)
const TIME_BONUS_MULTIPLIER = 2; // Max time bonus (2x at instant answer)

export default function QuizTab({ songs, config, onCancel }) {
  const timeLimit = config.timeLimit ?? 15;
  const numSongs = config.numSongs ?? 10;

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [roundOver, setRoundOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  // Scoring state
  const [sessionScore, setSessionScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [roundScorePercents, setRoundScorePercents] = useState([]);
  const [roundStats, setRoundStats] = useState([]);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const lastSongRef = useRef(null);
  const celebrationRef = useRef(null);

  const currentSong = songs[currentIndex];
  const correctYear = currentSong ? parseInt(currentSong.Year, 10) : null;

  const { initWaveSurfer, cleanupWaveSurfer, playSnippet, waveSurferRef } = useWaveSurfer({
    onSongEnd: () => setIsPlaying(false),
  });

  // Calculate max score for this round
  const maxScore = BASE_SCORE * TIME_BONUS_MULTIPLIER;

  // Stop audio and timer
  const stopAudio = useCallback(() => {
    cleanupWaveSurfer();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [cleanupWaveSurfer]);

  // Calculate score based on year accuracy and time
  const calculateScore = useCallback((guessedYear, actualYear, timeUsed) => {
    if (!guessedYear || !actualYear) return 0;

    const diff = Math.abs(guessedYear - actualYear);

    // Year accuracy: 0 diff = 100%, MAX_YEAR_DIFF+ = 0%
    const accuracyScore = Math.max(0, 1 - diff / MAX_YEAR_DIFF);

    // Time bonus: instant = 2x, at time limit = 1x
    const timeRatio = 1 - (timeUsed / timeLimit);
    const timeBonus = 1 + timeRatio * (TIME_BONUS_MULTIPLIER - 1);

    // Familiarity multiplier: more tiers = higher multiplier
    const numTiers = (config.recognitionTiers || [1]).length;
    const familiarityMultiplier = 1 + (numTiers - 1) * 0.125;

    return Math.round(BASE_SCORE * accuracyScore * timeBonus * familiarityMultiplier);
  }, [timeLimit, config.recognitionTiers]);

  // Handle submit
  const doSubmit = useCallback(() => {
    if (roundOver) return;

    stopAudio();
    setIsPlaying(false);
    setRoundOver(true);

    const score = calculateScore(selectedYear, correctYear, timeElapsed);
    setRoundScore(score);
    setSessionScore(prev => prev + score);

    // Record stats
    const scorePercent = (score / maxScore) * 100;
    setRoundScorePercents(prev => [...prev, scorePercent]);
    setRoundStats(prev => [...prev, {
      timeUsed: timeElapsed,
      yearDiff: selectedYear ? Math.abs(selectedYear - correctYear) : MAX_YEAR_DIFF,
      score,
    }]);

    // Trigger celebration for good scores
    if (celebrationRef.current && score > 0) {
      if (scorePercent >= 80) {
        celebrationRef.current.celebrate("emoji");
      } else if (scorePercent >= 50) {
        celebrationRef.current.celebrate("confetti");
      }
    }
  }, [roundOver, stopAudio, calculateScore, selectedYear, correctYear, timeElapsed, maxScore]);

  // Timer tick - auto submit when time runs out
  const onTimerTick = useCallback(() => {
    setTimeElapsed(prev => {
      const next = prev + 0.1;
      if (next >= timeLimit && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        // Force 0 score on timeout
        stopAudio();
        setIsPlaying(false);
        setRoundOver(true);
        setRoundScore(0);
        setRoundScorePercents(prevScores => [...prevScores, 0]);
        setRoundStats(prevStats => [...prevStats, {
          timeUsed: timeLimit,
          yearDiff: MAX_YEAR_DIFF,
          score: 0,
        }]);
      }
      return next;
    });
  }, [timeLimit, stopAudio]);

  // Play song - triggered by GO button
  const clickPlaySong = useCallback(() => {
    if (!currentSong?.AudioUrl) return;
    if (lastSongRef.current === currentSong.AudioUrl) return;
    lastSongRef.current = currentSong.AudioUrl;

    hasSubmittedRef.current = false;
    setTimeElapsed(0);
    setIsPlaying(true);

    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetMaxStart: 60,
      fadeDurationSec: 0.5,
      onPlaySuccess: () => {
        // Start timer after playback starts
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(onTimerTick, 100);
      },
      onPlayError: (err) => {
        console.error("Play error:", err);
        setIsPlaying(false);
      },
    });
  }, [currentSong, initWaveSurfer, playSnippet, onTimerTick]);

  // Handle submit button click
  const handleSubmit = useCallback(() => {
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      doSubmit();
    }
  }, [doSubmit]);

  // Handle next song
  const doNextSong = useCallback(() => {
    stopAudio();

    if (currentIndex >= songs.length - 1) {
      setShowFinalSummary(true);
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedYear(null);
    setRoundOver(false);
    setIsPlaying(false);
    setTimeElapsed(0);
    setRoundScore(0);
    hasSubmittedRef.current = false;
    lastSongRef.current = null;
  }, [currentIndex, songs.length, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  // Performance message based on score
  const getPerformanceMessage = () => {
    const pct = (roundScore / maxScore) * 100;
    if (pct >= 80) return "Excellent!";
    if (pct >= 50) return "Great work!";
    if (pct >= 20) return "Not bad!";
    if (pct > 1) return "Close enough!";
    return "You'll get the next one!";
  };

  // Year difference for display
  const yearDiff = selectedYear && correctYear ? Math.abs(selectedYear - correctYear) : null;

  // Final summary screen
  if (showFinalSummary) {
    const totalRounds = roundStats.length;
    let avgYearDiff = 0;
    if (totalRounds > 0) {
      avgYearDiff = roundStats.reduce((acc, r) => acc + r.yearDiff, 0) / totalRounds;
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          p: 2,
        }}
      >
        <Celebration ref={celebrationRef} id="final-celebration" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => {
            if (celebrationRef.current) {
              celebrationRef.current.celebrate("balloons");
            }
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: "center", fontWeight: "bold" }}
          >
            Session Complete!
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Box sx={{ textAlign: "center", my: 3 }}>
            <AnimatedScore
              score={sessionScore}
              label="Total Score"
              size="large"
              showChange={false}
            />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Average Year Difference: <strong>{avgYearDiff.toFixed(1)} years</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Rounds Played: <strong>{totalRounds}</strong>
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <AnimatedButton
            variant="contained"
            onClick={onCancel}
            sx={{
              backgroundColor: "var(--accent)",
              color: "var(--background)",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Close
          </AnimatedButton>
        </motion.div>
      </Box>
    );
  }

  // Main quiz UI
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        p: 2,
      }}
    >
      {/* Celebration overlay */}
      <Celebration ref={celebrationRef} id="year-quiz-celebration" />

      {/* Title Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Guess the Year
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <GameHubRoute />
          <IconButton onClick={onCancel} color="primary" aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Round Progress */}
      <Box sx={{ mb: 1 }}>
        <RoundProgress
          totalRounds={numSongs}
          currentRound={currentIndex}
          roundScores={roundScorePercents}
        />
      </Box>

      {/* Score Display - always rendered to prevent layout shift */}
      <Box sx={{ mx: "auto", mb: 2, maxWidth: 400, minHeight: 50, textAlign: "center" }}>
        {isPlaying ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Typography
              variant="caption"
              sx={{ color: "var(--foreground)", opacity: 0.7 }}
            >
              Time: {Math.max(0, timeLimit - timeElapsed).toFixed(1)}s
            </Typography>
            <Box
              sx={{
                height: 4,
                backgroundColor: "#333",
                borderRadius: 2,
                mt: 0.5,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${Math.max(0, 100 - (timeElapsed / timeLimit) * 100)}%`,
                  backgroundColor: timeElapsed / timeLimit > 0.7 ? "#f44336" :
                                   timeElapsed / timeLimit > 0.4 ? "#FF9800" : "#4CAF50",
                  transition: "width 0.1s linear",
                }}
              />
            </Box>
          </motion.div>
        ) : (
          <Typography
            variant="caption"
            sx={{ color: "var(--foreground)", opacity: 0.4 }}
          >
            {roundOver ? "" : `${timeLimit}s time limit`}
          </Typography>
        )}
      </Box>

      {/* Year Picker */}
      <Box sx={{ mb: 3, px: 2 }}>
        <YearPicker
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          correctYear={correctYear}
          showResult={roundOver}
          disabled={roundOver || !isPlaying}
        />
      </Box>

      {/* Round result feedback */}
      <AnimatePresence>
        {roundOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ mt: 2, textAlign: "center" }}>
              {roundScore > 0 ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}
                  >
                    {getPerformanceMessage()}
                  </Typography>
                  <Typography variant="body1">
                    +{roundScore} pts | Total: {Math.floor(sessionScore)}
                  </Typography>
                  {yearDiff !== null && (
                    <Typography variant="body2" sx={{ color: "var(--foreground)", opacity: 0.7, mt: 1 }}>
                      {yearDiff === 0 ? "Perfect! Exact year!" : `Off by ${yearDiff} year${yearDiff !== 1 ? "s" : ""}`}
                    </Typography>
                  )}
                </motion.div>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ color: "#f44336", mb: 1 }}>
                    {selectedYear ? `You guessed ${selectedYear}` : "Time's up!"}
                  </Typography>
                  <Typography variant="body2">
                    Correct: <strong>{correctYear}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Total: {Math.floor(sessionScore)}
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button - only when playing */}
      <AnimatePresence>
        {isPlaying && !roundOver && selectedYear && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <AnimatedButton
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                  fontWeight: "bold",
                  px: 4,
                  py: 1,
                  fontSize: "1rem",
                  borderRadius: 2,
                  "&:hover": { opacity: 0.9 },
                }}
              >
                Submit
              </AnimatedButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GO!/Next Button - Floating overlay */}
      <Box
        sx={{
          position: "fixed",
          bottom: "10%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {!isPlaying && !roundOver && currentSong && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{ pointerEvents: "auto" }}
            >
              <AnimatedButton
                variant="contained"
                onClick={clickPlaySong}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.2rem",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(76, 175, 80, 0.5)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": { backgroundColor: "#43A047" },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shine 2s infinite",
                  },
                  "@keyframes shine": {
                    "0%": { left: "-100%" },
                    "50%": { left: "100%" },
                    "100%": { left: "100%" },
                  },
                }}
              >
                GO!
              </AnimatedButton>
            </motion.div>
          )}
          {roundOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{ pointerEvents: "auto" }}
            >
              <AnimatedButton
                variant="contained"
                onClick={doNextSong}
                sx={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.2rem",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                  "&:hover": { opacity: 0.9 },
                }}
              >
                {currentIndex >= songs.length - 1 ? "Finish" : "Next"}
              </AnimatedButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

QuizTab.propTypes = {
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      SongID: PropTypes.string,
      AudioUrl: PropTypes.string.isRequired,
      Year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
