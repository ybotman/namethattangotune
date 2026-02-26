//
// src/app/games/artist-quiz/PlayTab.js
//
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import useWaveSurfer from "@/hooks/useWaveSurfer";
import useArtistQuiz from "@/hooks/useArtistQuiz";
import usePlay from "@/hooks/usePlay";
import useArtistQuizScoring from "@/hooks/useArtistQuizScoring";
import { shuffleArray } from "@/utils/dataFetching";
import { getDistractors } from "@/utils/dataFetching";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";
import Celebration from "@/components/ui/Celebration";
import AnimatedScore from "@/components/ui/AnimatedScore";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function PlayTab({ songs, config, onCancel }) {
  // 2) Quiz config
  const { calculateMaxScore, WRONG_PENALTY, INTERVAL_MS } = useArtistQuiz();
  const timeLimit = config.timeLimit ?? 15;
  const maxScore = calculateMaxScore(timeLimit);

  // Local state
  const [roundOver, setRoundOver] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const lastSongRef = useRef(null);
  const celebrationRef = useRef(null);
  const numSongs = config.numSongs ?? 10;

  // waveSurfer
  const { initWaveSurfer, cleanupWaveSurfer, playSnippet } = useWaveSurfer({
    onSongEnd: null,
  });

  // Optional “go phrase”
  const { getGoPhrase } = usePlay();

  // 3) Scoring hook
  const {
    currentIndex,
    currentSong,
    isPlaying,
    setIsPlaying,
    answers,
    setAnswers,
    selectedAnswer,
    wrongAnswers,
    timeElapsed,
    setTimeElapsed,
    roundScore,
    setRoundScore,
    sessionScore,
    setSessionScore,
    showFinalSummary,
    setShowFinalSummary,
    roundStats,
    setRoundStats,
    startIntervals,
    stopAllIntervals,
    initRound,
    handleAnswerSelect: scoringAnswerSelect,
    handleNextSong,
  } = useArtistQuizScoring({
    timeLimit,
    maxScore,
    WRONG_PENALTY,
    INTERVAL_MS,
    onTimesUp: () => {
      console.log("PlayTab-> onTimesUp => forcing 0 score + roundOver");
      setRoundScore(0);
      setRoundOver(true);
      stopAudio();
    },
    songs,
  });

  // 4) Stop audio & intervals
  const stopAudio = useCallback(() => {
    console.log("PlayTab-> stopAudio => waveSurfer cleanup + stop intervals");
    cleanupWaveSurfer();
    stopAllIntervals();
  }, [cleanupWaveSurfer, stopAllIntervals]);

  // 5) handleAnswerSelect => see if correct => end round
  const handleAnswerSelect = useCallback(
    (ans) => {
      console.log("PlayTab-> handleAnswerSelect =>", ans);
      const { roundEnded, correct } = scoringAnswerSelect(ans);

      if (roundEnded) {
        setRoundOver(true);
        setLastCorrect(correct);
        stopAudio();
        // Trigger celebration on correct answer
        if (correct && celebrationRef.current) {
          // Use emoji celebration for high scores, confetti for others
          const pct = (roundScore / maxScore) * 100;
          if (pct >= 80) {
            celebrationRef.current.celebrate("emoji");
          } else if (pct >= 50) {
            celebrationRef.current.celebrate("confetti");
          }
        }
      }
    },
    [scoringAnswerSelect, stopAudio, roundScore, maxScore],
  );

  // 6) doNextSong => proceed to next
  const doNextSong = useCallback(() => {
    console.log("PlayTab-> doNextSong");
    setRoundOver(false);
    handleNextSong();
  }, [handleNextSong]);

  // 7) clickPlaySong => waveSurfer snippet
  const clickPlaySong = useCallback(() => {
    console.log("PlayTab-> clickPlaySong");
    if (!currentSong) return;
    if (lastSongRef.current === currentSong.AudioUrl) return;
    lastSongRef.current = currentSong.AudioUrl;

    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetMaxStart: 90,
      fadeDurationSec: 1.0,
      onPlaySuccess: () => {
        setIsPlaying(true);
        startIntervals();
      },
      onPlayError: (err) => {
        console.error("Snippet play error:", err);
        doNextSong();
      },
    });
  }, [
    currentSong,
    initWaveSurfer,
    playSnippet,
    setIsPlaying,
    startIntervals,
    doNextSong,
  ]);

  // 8) Init round on mount or index change
  useEffect(() => {
    initRound(currentIndex);
    return () => stopAudio();
  }, [currentIndex, initRound, stopAudio]);

  // 9) Build answers on currentSong change
  useEffect(() => {
    if (!currentSong) return;
    const correctArtist = currentSong.ArtistMaster || "";

    getDistractors(correctArtist, config, 3)
      .then((distractors) => {
        const finalAnswers = shuffleArray([correctArtist, ...distractors]);
        setAnswers(finalAnswers);
      })
      .catch((err) => {
        console.error("Error in getDistractors:", err);
        setAnswers([correctArtist]); // fallback
      });
  }, [currentSong, config, setAnswers]);

  // A) timePercent for progress
  const timePercent = (timeElapsed / timeLimit) * 100;

  // B) Helper => performance text
  const getPerformanceMessage = () => {
    const pct = (roundScore / maxScore) * 100;
    if (pct >= 80) return "Excellent job!";
    if (pct >= 50) return "Great work!";
    if (pct >= 20) return "Not bad!";
    if (pct > 1) return "Just Barely.";
    return "You'll get the next one!";
  };

  // C) If final => summary with celebration
  if (showFinalSummary) {
    const totalRounds = roundStats.length;
    let avgTime = 0,
      avgDist = 0;
    if (totalRounds > 0) {
      const sumTime = roundStats.reduce((acc, r) => acc + r.timeUsed, 0);
      const sumDist = roundStats.reduce((acc, r) => acc + r.distractorsUsed, 0);
      avgTime = sumTime / totalRounds;
      avgDist = sumDist / totalRounds;
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
            // Trigger celebration on mount
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
              Average Time: <strong>{avgTime.toFixed(1)}s</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Wrong Guesses: <strong>{avgDist.toFixed(1)}</strong>
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

  // D) Main quiz UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        p: 2,
      }}
    >
      {/* Celebration overlay */}
      <Celebration ref={celebrationRef} id="quiz-celebration" />
      {/* 
          Top row with Title (left) and GameHubRoute (right)
      */}
      {/* Title Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Identify the Artist
        </Typography>

        {/* Icons Row (Justified Right) */}
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <GameHubRoute />
          <IconButton
            onClick={onCancel}
            color="primary"
            aria-label="Back"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Action Bar: Round Progress + Ready/Next Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          p: 1.5,
          backgroundColor: "var(--input-bg)",
          borderRadius: 2,
        }}
      >
        {/* Round Progress - left side */}
        <Box sx={{ flex: 1 }}>
          <RoundProgress totalRounds={numSongs} currentRound={currentIndex} />
        </Box>

        {/* Ready/Next Button - right side, always visible */}
        <Box sx={{ flexShrink: 0 }}>
          {!isPlaying && !roundOver && currentSong && (
            <AnimatedButton
              variant="contained"
              onClick={clickPlaySong}
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                fontWeight: "bold",
                px: 3,
                py: 1,
                minWidth: 100,
                "&:hover": { backgroundColor: "#43A047" },
              }}
            >
              Ready
            </AnimatedButton>
          )}
          {roundOver && (
            <AnimatedButton
              variant="contained"
              onClick={doNextSong}
              sx={{
                backgroundColor: "var(--accent)",
                color: "white",
                fontWeight: "bold",
                px: 3,
                py: 1,
                minWidth: 100,
                "&:hover": { opacity: 0.9 },
              }}
            >
              Next
            </AnimatedButton>
          )}
          {isPlaying && !roundOver && (
            <Box
              sx={{
                px: 3,
                py: 1,
                minWidth: 100,
                textAlign: "center",
                color: "var(--accent)",
                fontWeight: "bold",
              }}
            >
              Playing...
            </Box>
          )}
        </Box>
      </Box>

      {/* Score Display */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <AnimatedScore
          score={roundScore}
          label={`Available / ${Math.floor(maxScore)}`}
          size="medium"
          showChange={false}
        />
      </Box>

      {/* Time Progress Bar */}
      {isPlaying && (
        <Box sx={{ mx: "auto", mb: 2, maxWidth: 400 }}>
          <LinearProgress
            variant="determinate"
            value={timePercent}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Answers */}
      <List sx={{ mb: 2, maxWidth: 400, margin: "auto" }}>
        <AnimatePresence>
          {answers.map((ans, idx) => {
            const isWrong = wrongAnswers.includes(ans);
            const isChosenCorrect =
              roundOver &&
              selectedAnswer === ans &&
              ans.trim().toLowerCase() ===
                (currentSong?.ArtistMaster || "").trim().toLowerCase();

            let borderColor = "var(--border-color)";
            let bgColor = "transparent";
            if (roundOver && isChosenCorrect) {
              borderColor = "#4caf50";
              bgColor = "rgba(76, 175, 80, 0.1)";
            } else if (isWrong) {
              borderColor = "#f44336";
              bgColor = "rgba(244, 67, 54, 0.1)";
            }

            // disable if roundOver or not playing or isWrong or correct
            const disabled =
              roundOver || !isPlaying || isWrong || isChosenCorrect;

            return (
              <motion.div
                key={ans}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isChosenCorrect ? [1, 1.05, 1] : isWrong ? [1, 0.95, 1] : 1,
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
              >
                <ListItem
                  onClick={() => !disabled && handleAnswerSelect(ans)}
                  sx={{
                    mb: 1,
                    border: `2px solid ${borderColor}`,
                    borderRadius: "8px",
                    cursor: disabled ? "default" : "pointer",
                    backgroundColor: bgColor,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: disabled ? bgColor : "var(--input-bg)",
                      transform: disabled ? "none" : "translateX(4px)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ color: "var(--foreground)" }}>
                        {ans}
                      </Typography>
                    }
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </List>

      {/* If roundOver => show result feedback (Next button is in header now) */}
      <AnimatePresence>
        {roundOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ mt: 2, textAlign: "center" }}>
              {lastCorrect ? (
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
                    +{Math.floor(roundScore)} pts | Total: {Math.floor(sessionScore)}
                  </Typography>
                </motion.div>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ color: "#f44336", mb: 1 }}>
                    Answer: <strong>{currentSong?.ArtistMaster}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Total: {Math.floor(sessionScore)}
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

PlayTab.propTypes = {
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      SongID: PropTypes.string,
      AudioUrl: PropTypes.string.isRequired,
      ArtistMaster: PropTypes.string.isRequired,
    }),
  ).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
