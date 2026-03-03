//
// src/app/games/song-quiz/PlayTab.js
// Quiz to guess the song title
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { motion, AnimatePresence } from "motion/react";

import useWaveSurfer from "@/hooks/useWaveSurfer";
import useSongQuiz from "@/hooks/useSongQuiz";
import usePlay from "@/hooks/usePlay";
import useSongQuizScoring from "@/hooks/useSongQuizScoring";
import { shuffleArray } from "@/utils/dataFetching";
import { trackPlayClick, trackGuess, trackWrongAnswer, trackCorrectAnswer, trackGameComplete, trackGameCancel, trackGameAbandon } from "@/utils/analytics";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";
import AnimatedButton from "@/components/ui/AnimatedButton";
import SongFeedback from "@/components/ui/SongFeedback";

export default function PlayTab({ songs, config, onCancel }) {
  const { calculateMaxScore, INTERVAL_MS } = useSongQuiz();
  const timeLimit = config.timeLimit ?? 15;
  const maxScore = calculateMaxScore(timeLimit);

  const [roundOver, setRoundOver] = useState(false);
  const [roundScorePercents, setRoundScorePercents] = useState([]);
  const [audioReady, setAudioReady] = useState(false); // Gate answers until audio starts
  const lastSongRef = useRef(null);
  const numSongs = config.numSongs ?? 10;

  const { initWaveSurfer, cleanupWaveSurfer, playSnippet } = useWaveSurfer({
    onSongEnd: null,
  });

  const { getGoPhrase } = usePlay();

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
    isLockedOut,
    startIntervals,
    stopAllIntervals,
    initRound,
    handleAnswerSelect: scoringAnswerSelect,
    handleNextSong,
  } = useSongQuizScoring({
    timeLimit,
    maxScore,
    INTERVAL_MS,
    onTimesUp: () => {
      console.log("PlayTab-> onTimesUp => forcing 0 score + roundOver");
      setRoundScore(0);
      setRoundScorePercents(prev => [...prev, 0]);
      setRoundOver(true);
      stopAudio();
    },
    songs,
    config, // Pass config for difficulty multipliers
  });

  const stopAudio = useCallback(() => {
    cleanupWaveSurfer();
    stopAllIntervals();
  }, [cleanupWaveSurfer, stopAllIntervals]);

  const handleAnswerSelect = useCallback(
    (ans) => {
      const { roundEnded, correct } = scoringAnswerSelect(ans);

      // Track guess with song details
      const correctAns = currentSong?.Title || "";
      trackGuess("song-quiz", correct, ans, correctAns, currentSong?.AudioUrl);

      if (!correct && currentSong) {
        trackWrongAnswer("song-quiz", currentSong.AudioUrl, currentSong.Title, correctAns, ans, currentSong.ArtistMaster, currentSong.Year);
      } else if (correct && currentSong) {
        trackCorrectAnswer("song-quiz", currentSong.AudioUrl, roundScore, timeLimit - timeElapsed);
      }

      if (roundEnded) {
        setRoundOver(true);
        const scorePercent = (roundScore / maxScore) * 100;
        setRoundScorePercents(prev => [...prev, scorePercent]);
        stopAudio();
      }
    },
    [scoringAnswerSelect, stopAudio, roundScore, maxScore, currentSong, timeLimit, timeElapsed]
  );

  const doNextSong = useCallback(() => {
    setRoundOver(false);
    handleNextSong();
  }, [handleNextSong]);

  const clickPlaySong = useCallback(() => {
    trackPlayClick("song-quiz");
    if (!currentSong) return;
    if (lastSongRef.current === currentSong.AudioUrl) return;
    lastSongRef.current = currentSong.AudioUrl;

    // Hide GO button immediately, but keep answers disabled until audio ready
    setIsPlaying(true);
    setAudioReady(false);

    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetMaxStart: 90,
      fadeDurationSec: 1.0,
      onPlaySuccess: () => {
        setAudioReady(true);
        startIntervals();
      },
      onPlayError: (err) => {
        console.error("Snippet play error:", err);
        setIsPlaying(false);
        setAudioReady(false);
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

  // Init round on mount or index change
  useEffect(() => {
    setAudioReady(false); // Reset audio ready state for new round
    initRound(currentIndex);
    return () => stopAudio();
  }, [currentIndex, initRound, stopAudio]);

  // Build answers from titles in the filtered songs pool
  useEffect(() => {
    if (!currentSong) return;
    const correctTitle = currentSong.Title || "";

    // Get unique titles from the songs list as distractors
    const allTitles = [...new Set(songs.map((s) => s.Title).filter(Boolean))];
    const distractors = shuffleArray(
      allTitles.filter((t) => t !== correctTitle)
    ).slice(0, 3);

    const finalAnswers = shuffleArray([correctTitle, ...distractors]);
    setAnswers(finalAnswers);
  }, [currentSong, songs, setAnswers]);

  const timePercent = (timeElapsed / timeLimit) * 100;

  const getPerformanceMessage = () => {
    const pct = (roundScore / maxScore) * 100;
    if (pct >= 80) return "Excellent job!";
    if (pct >= 50) return "Great work!";
    if (pct >= 20) return "Not bad!";
    if (pct > 1) return "Just Barely.";
    return "You'll get the next one!";
  };

  // Final summary
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
        <Typography variant="h4" gutterBottom>
          Session Complete!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Total Score: {Math.floor(sessionScore)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Average Time: {avgTime.toFixed(1)}s
        </Typography>
        <Typography variant="body1" gutterBottom>
          Average Distractors: {avgDist.toFixed(1)}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            trackGameComplete("song-quiz", sessionScore, roundStats.length, numSongs, config);
            onCancel();
          }}
          sx={{
            backgroundColor: "var(--accent)",
            color: "var(--background)",
            "&:hover": { opacity: 0.8 },
            mt: 3,
          }}
        >
          Close
        </Button>
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
          Name That Song!
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <GameHubRoute />
          <IconButton onClick={() => {
            trackGameAbandon("song-quiz", currentIndex + 1, numSongs);
            trackGameCancel("song-quiz", currentIndex + 1, numSongs, config);
            onCancel();
          }} color="primary" aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Round Progress - Score-colored dashes */}
      <Box sx={{ mb: 1 }}>
        <RoundProgress
          totalRounds={numSongs}
          currentRound={currentIndex}
          roundScores={roundScorePercents}
        />
      </Box>

      {/* Show orchestra hint */}
      {currentSong && (
        <Typography
          variant="body2"
          sx={{ textAlign: "center", mb: 1, color: "var(--accent)" }}
        >
          {currentSong.ArtistMaster || "Unknown"}
          {currentSong.Singer && ` | ${currentSong.Singer}`}
        </Typography>
      )}

      {/* Score Display with color-coded bar - always rendered to prevent layout shift */}
      <Box sx={{ mx: "auto", mb: 1, maxWidth: "min(100%, 400px)", minHeight: 28 }}>
        {isPlaying ? (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
                Points
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: roundScore / maxScore > 0.6 ? "#4CAF50" :
                         roundScore / maxScore > 0.3 ? "#FF9800" : "#f44336"
                }}
              >
                {Math.floor(roundScore)} / {Math.floor(maxScore)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(roundScore / maxScore) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "var(--border-color)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: roundScore / maxScore > 0.6 ? "#4CAF50" :
                                   roundScore / maxScore > 0.3 ? "#FF9800" : "#f44336",
                  borderRadius: 3,
                }
              }}
            />
          </>
        ) : (
          <>
            {/* Placeholder when not playing - maintains layout */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.4 }}>
                Points
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.4 }}>
                0 / {Math.floor(maxScore)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={0}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "var(--border-color)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--border-color)",
                  borderRadius: 3,
                }
              }}
            />
          </>
        )}
      </Box>

      {/* Answers */}
      <List sx={{ mb: 2, maxWidth: "min(100%, 400px)", margin: "auto" }}>
        {answers.map((ans) => {
          const isWrong = wrongAnswers.includes(ans);
          const isChosenCorrect =
            roundOver &&
            selectedAnswer === ans &&
            ans.trim().toLowerCase() ===
              (currentSong?.Title || "").trim().toLowerCase();

          let borderColor = "var(--border-color)";
          let bgColor = "transparent";
          if (roundOver && isChosenCorrect) {
            borderColor = "#4caf50";
            bgColor = "rgba(76, 175, 80, 0.1)";
          } else if (isWrong) {
            borderColor = "#f44336";
            bgColor = "rgba(244, 67, 54, 0.1)";
          } else if (isLockedOut) {
            // Visual feedback during lockout
            borderColor = "var(--border-color)";
            bgColor = "rgba(128, 128, 128, 0.1)";
          }

          // disable if roundOver or audio not ready or isWrong or correct or locked out
          const disabled =
            roundOver || !audioReady || isWrong || isChosenCorrect || isLockedOut;

          return (
            <ListItem
              key={ans}
              onClick={() => !disabled && handleAnswerSelect(ans)}
              sx={{
                mb: 1,
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                cursor: disabled ? "default" : "pointer",
                backgroundColor: bgColor,
                opacity: isLockedOut && !isWrong ? 0.5 : 1,
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
          );
        })}
      </List>

      {/* Round result feedback */}
      {roundOver && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          {roundScore > 0 ? (
            <>
              <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}>
                {getPerformanceMessage()}
              </Typography>
              <Typography variant="body1">
                +{Math.floor(roundScore)} pts | Total: {Math.floor(sessionScore)}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ color: "#f44336", mb: 1 }}>
                Answer: <strong>{currentSong?.Title}</strong>
              </Typography>
              <Typography variant="body2">
                Total: {Math.floor(sessionScore)}
              </Typography>
            </>
          )}
          {/* Feedback button */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <SongFeedback
              song={currentSong}
              gameType="song-quiz"
              config={config}
              answers={answers}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentSong?.Title}
              wasCorrect={roundScore > 0}
              roundScore={roundScore}
              sessionScore={sessionScore}
            />
          </Box>
        </Box>
      )}

      {/* GO!/Next Button - Floating overlay, doesn't affect layout */}
      <Box
        sx={{
          position: "fixed",
          bottom: "15%",
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
                Next
              </AnimatedButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

PlayTab.propTypes = {
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      SongID: PropTypes.string,
      AudioUrl: PropTypes.string.isRequired,
      Title: PropTypes.string.isRequired,
    })
  ).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
