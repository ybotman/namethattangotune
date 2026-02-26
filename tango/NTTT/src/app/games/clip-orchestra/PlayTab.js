//
// src/app/games/clip-orchestra/PlayTab.js
// No-timer clip quiz - replay as many times as needed
//
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { motion, AnimatePresence } from "motion/react";

import useWaveSurfer from "@/hooks/useWaveSurfer";
import { shuffleArray } from "@/utils/dataFetching";
import { trackPlayClick, trackGuess, trackWrongAnswer, trackCorrectAnswer, trackGameComplete, trackGameCancel, trackGameAbandon } from "@/utils/analytics";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";
import AnimatedButton from "@/components/ui/AnimatedButton";

const BASE_SCORE = 100;
const REPLAY_PENALTY = 0.03; // 3% reduction per replay
const WRONG_PENALTY = 0.33; // 33% reduction per wrong answer (3 wrong = ~0 points)
const NEW_CLIP_PENALTY = 0.10; // 10% reduction for getting a new clip

// Get base score from clip length (non-linear, heavily weighted to short clips)
// 1s=1000 (max), halving each second, 30s=10 (min)
function getClipBaseScore(clipLength) {
  const scoreMap = [
    [1, 1000],
    [2, 500],
    [3, 250],
    [4, 125],
    [5, 60],
    [10, 20],
    [30, 10],
  ];

  // Exact match or below minimum
  if (clipLength <= scoreMap[0][0]) return scoreMap[0][1];

  // Find range and interpolate
  for (let i = 0; i < scoreMap.length - 1; i++) {
    const [x1, y1] = scoreMap[i];
    const [x2, y2] = scoreMap[i + 1];
    if (clipLength <= x2) {
      // Linear interpolation between points
      const t = (clipLength - x1) / (x2 - x1);
      return Math.round(y1 + t * (y2 - y1));
    }
  }

  // Beyond 30s
  return scoreMap[scoreMap.length - 1][1];
}

// Calculate max possible score based on difficulty multipliers
function calculateMaxScore(config) {
  const clipLength = config.clipLength ?? 5;
  const tiers = config.recognitionTiers || [1];

  // Base score from clip length
  const clipScore = getClipBaseScore(clipLength);

  // Calculate average tier level (1=Iconic easiest, 5=Deep hardest)
  const avgTier = tiers.length > 0
    ? tiers.reduce((a, b) => a + b, 0) / tiers.length
    : 1;

  // Average tier 1 = 1x, average tier 5 = 2x
  const familiarityMultiplier = 1 + (avgTier - 1) * 0.25;

  return Math.round(clipScore * familiarityMultiplier);
}

export default function PlayTab({ songs, config, onCancel }) {
  const clipLength = config.clipLength ?? 5;
  const numSongs = config.numSongs ?? 10;
  const maxPossibleScore = calculateMaxScore(config);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(songs[0] || null);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [roundOver, setRoundOver] = useState(false);
  const [roundScore, setRoundScore] = useState(maxPossibleScore);
  const [sessionScore, setSessionScore] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [roundStats, setRoundStats] = useState([]);
  const [replayCount, setReplayCount] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundScorePercents, setRoundScorePercents] = useState([]);
  const [usedNewClip, setUsedNewClip] = useState(false); // Can only get new clip once

  const clipStartRef = useRef(null);
  const waveSurferRef = useRef(null);

  const { initWaveSurfer, cleanupWaveSurfer, playSnippet, wavesurfer } = useWaveSurfer({
    onSongEnd: () => {
      setIsPlaying(false);
    },
  });

  // Initialize round
  const initRound = useCallback((idx) => {
    if (!songs || idx >= songs.length) return;

    setCurrentIndex(idx);
    setCurrentSong(songs[idx]);
    setSelectedAnswer(null);
    setWrongAnswers([]);
    setRoundScore(maxPossibleScore);
    setReplayCount(0);
    setRoundOver(false);
    setHasPlayed(false);
    setIsPlaying(false);
    setUsedNewClip(false);
    clipStartRef.current = null;
  }, [songs]);

  // Build answers from artists in the filtered songs pool
  useEffect(() => {
    if (!currentSong) return;
    const correctArtist = currentSong.ArtistMaster || "";

    // Get unique artists from the songs list as distractors
    const allArtists = [...new Set(songs.map((s) => s.ArtistMaster).filter(Boolean))];
    const distractors = shuffleArray(
      allArtists.filter((a) => a !== correctArtist)
    ).slice(0, 3);

    const finalAnswers = shuffleArray([correctArtist, ...distractors]);
    setAnswers(finalAnswers);
  }, [currentSong, songs]);

  // Play the clip
  const playClip = useCallback(() => {
    trackPlayClick("clip-orchestra");
    if (!currentSong) return;

    // Generate random start on first play
    if (clipStartRef.current === null) {
      const maxStart = Math.max(0, 90 - clipLength);
      clipStartRef.current = Math.random() * maxStart;
    }

    // If replaying, penalize score
    if (hasPlayed) {
      setReplayCount((prev) => prev + 1);
      setRoundScore((prev) => Math.max(prev * (1 - REPLAY_PENALTY), 10));
    }

    const fadeDuration = 0.5; // seconds for fade in/out
    setIsPlaying(true);
    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetStart: clipStartRef.current,
      snippetDuration: clipLength,
      fadeDurationSec: fadeDuration,
      onPlaySuccess: () => {
        setHasPlayed(true);
      },
      onPlayError: (err) => {
        console.error("Clip play error:", err);
        setIsPlaying(false);
      },
    });

    // Total time = fade-in + clip duration + fade-out + buffer
    const totalPlayTime = (fadeDuration + clipLength + fadeDuration) * 1000 + 200;
    setTimeout(() => {
      cleanupWaveSurfer();
      setIsPlaying(false);
    }, totalPlayTime);
  }, [currentSong, clipLength, hasPlayed, initWaveSurfer, playSnippet, cleanupWaveSurfer]);

  // Get a different clip (10% penalty, can only do once)
  const getNewClip = useCallback(() => {
    if (!currentSong || usedNewClip || isPlaying) return;

    // Apply penalty
    setRoundScore((prev) => Math.max(prev * (1 - NEW_CLIP_PENALTY), 10));
    setUsedNewClip(true);

    // Generate new random start position
    const maxStart = Math.max(0, 90 - clipLength);
    clipStartRef.current = Math.random() * maxStart;

    // Auto-play the new clip
    const fadeDuration = 0.5;
    setIsPlaying(true);
    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetStart: clipStartRef.current,
      snippetDuration: clipLength,
      fadeDurationSec: fadeDuration,
      onPlaySuccess: () => {},
      onPlayError: (err) => {
        console.error("New clip play error:", err);
        setIsPlaying(false);
      },
    });

    const totalPlayTime = (fadeDuration + clipLength + fadeDuration) * 1000 + 200;
    setTimeout(() => {
      cleanupWaveSurfer();
      setIsPlaying(false);
    }, totalPlayTime);
  }, [currentSong, usedNewClip, isPlaying, clipLength, initWaveSurfer, playSnippet, cleanupWaveSurfer]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((ans) => {
    if (roundOver || !hasPlayed) return;

    setSelectedAnswer(ans);
    const correctArtist = (currentSong?.ArtistMaster || "").trim().toLowerCase();
    const correctAns = currentSong?.ArtistMaster || "";
    const guess = ans.trim().toLowerCase();
    const isCorrect = guess === correctArtist;

    // Track guess
    trackGuess("clip-orchestra", isCorrect, ans, correctAns, currentSong?.AudioUrl);

    if (isCorrect) {
      trackCorrectAnswer("clip-orchestra", currentSong.AudioUrl, roundScore, 0);
      cleanupWaveSurfer();
      setSessionScore((old) => old + Math.max(roundScore, 0));
      setRoundStats((old) => [
        ...old,
        { replays: replayCount, wrongGuesses: wrongAnswers.length },
      ]);
      setRoundScorePercents(prev => [...prev, (roundScore / maxPossibleScore) * 100]);
      setRoundOver(true);
    } else {
      trackWrongAnswer("clip-orchestra", currentSong.AudioUrl, currentSong.Title, correctAns, ans, currentSong.ArtistMaster, currentSong.Year);
      setWrongAnswers((old) => [...old, ans]);
      const newScore = Math.max(roundScore * (1 - WRONG_PENALTY), 0);
      setRoundScore(newScore);

      if (newScore <= 0) {
        cleanupWaveSurfer();
        setRoundStats((old) => [
          ...old,
          { replays: replayCount, wrongGuesses: wrongAnswers.length + 1 },
        ]);
        setRoundScorePercents(prev => [...prev, 0]);
        setRoundOver(true);
      }
    }
  }, [currentSong, roundOver, hasPlayed, roundScore, replayCount, wrongAnswers, cleanupWaveSurfer, maxPossibleScore]);

  // Next song
  const doNextSong = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (!songs || nextIndex >= songs.length) {
      setShowFinalSummary(true);
      return;
    }
    initRound(nextIndex);
  }, [currentIndex, songs, initRound]);

  // Initialize on mount
  useEffect(() => {
    initRound(0);
    return () => cleanupWaveSurfer();
  }, []);

  // Final summary
  if (showFinalSummary) {
    const totalRounds = roundStats.length;
    let avgReplays = 0, avgWrong = 0;
    if (totalRounds > 0) {
      avgReplays = roundStats.reduce((acc, r) => acc + r.replays, 0) / totalRounds;
      avgWrong = roundStats.reduce((acc, r) => acc + r.wrongGuesses, 0) / totalRounds;
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
          Average Replays: {avgReplays.toFixed(1)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Average Wrong Guesses: {avgWrong.toFixed(1)}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            trackGameComplete("clip-orchestra", sessionScore, roundStats.length, numSongs, config);
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Identify the Orchestra
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <GameHubRoute />
          <IconButton onClick={() => {
            trackGameAbandon("clip-orchestra", currentIndex + 1, numSongs);
            trackGameCancel("clip-orchestra", currentIndex + 1, numSongs, config);
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

      {/* Score Display with color-coded bar */}
      <Box sx={{ mx: "auto", mb: 1, maxWidth: 400 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
            Points {replayCount > 0 ? `(${replayCount} replays)` : ""}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: roundScore / maxPossibleScore > 0.6 ? "#4CAF50" :
                     roundScore / maxPossibleScore > 0.3 ? "#FF9800" : "#f44336"
            }}
          >
            {Math.floor(roundScore)} / {maxPossibleScore}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(roundScore / maxPossibleScore) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--border-color)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: roundScore / maxPossibleScore > 0.6 ? "#4CAF50" :
                               roundScore / maxPossibleScore > 0.3 ? "#FF9800" : "#f44336",
              borderRadius: 3,
            }
          }}
        />
      </Box>

      {/* Answers */}
      <List sx={{ mb: 2, maxWidth: 400, margin: "auto" }}>
        {answers.map((ans) => {
          const isWrong = wrongAnswers.includes(ans);
          const correctArtist = currentSong?.ArtistMaster || "";
          const isChosenCorrect =
            roundOver &&
            selectedAnswer === ans &&
            ans.trim().toLowerCase() === correctArtist.trim().toLowerCase();

          let borderColor = "var(--border-color)";
          if (roundOver && isChosenCorrect) borderColor = "green";
          else if (isWrong) borderColor = "red";

          const disabled = roundOver || !hasPlayed || isWrong || isChosenCorrect;

          return (
            <ListItem
              key={ans}
              onClick={() => handleAnswerSelect(ans)}
              disabled={disabled}
              sx={{
                mb: 1,
                border: `2px solid ${borderColor}`,
                borderRadius: "4px",
                cursor: disabled ? "default" : "pointer",
                opacity: !hasPlayed ? 0.5 : 1,
                "&:hover": {
                  backgroundColor: disabled ? "inherit" : "var(--input-bg)",
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "var(--foreground)" }}>
                      {ans}
                    </Typography>
                    {isWrong && (
                      <Typography sx={{ color: "#f44336", fontSize: "0.75rem", fontWeight: "bold" }}>
                        -33%
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>

      {!hasPlayed && !roundOver && (
        <Typography variant="body2" sx={{ textAlign: "center", color: "var(--accent)" }}>
          Play the clip to reveal answers
        </Typography>
      )}

      {/* Round result feedback */}
      {roundOver && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          {roundScore > 0 ? (
            <>
              <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}>
                Correct!
              </Typography>
              <Typography variant="body1">
                +{Math.floor(roundScore)} pts | Total: {Math.floor(sessionScore)}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ color: "#f44336", mb: 1 }}>
                Answer: <strong>{currentSong?.ArtistMaster}</strong>
              </Typography>
              <Typography variant="body2">
                Total: {Math.floor(sessionScore)}
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* GO!/Replay/Next Button - Floating overlay, doesn't affect layout */}
      <Box
        sx={{
          position: "fixed",
          bottom: "15%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {!roundOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{ pointerEvents: "auto", display: "flex", gap: 12 }}
            >
              {/* Replay / GO button */}
              <AnimatedButton
                variant="contained"
                onClick={playClip}
                disabled={isPlaying}
                startIcon={hasPlayed ? <ReplayIcon sx={{ fontSize: 18 }} /> : null}
                sx={{
                  backgroundColor: hasPlayed ? "var(--accent)" : "#4CAF50",
                  color: "white",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.2rem",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(76, 175, 80, 0.5)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": { opacity: 0.9 },
                  ...(!hasPlayed && {
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
                  }),
                }}
              >
                {isPlaying ? "..." : hasPlayed ? (
                  <>Replay <Typography component="span" sx={{ fontSize: "0.7rem", opacity: 0.7 }}>-3%</Typography></>
                ) : "GO!"}
              </AnimatedButton>

              {/* New Clip button - only shows after first play and if not already used */}
              {hasPlayed && !usedNewClip && (
                <AnimatedButton
                  variant="outlined"
                  onClick={getNewClip}
                  disabled={isPlaying}
                  startIcon={<ShuffleIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderColor: "#FF9800",
                    color: "#FF9800",
                    fontWeight: "bold",
                    px: 2,
                    py: 1.5,
                    fontSize: "0.9rem",
                    borderRadius: 3,
                    "&:hover": {
                      backgroundColor: "rgba(255, 152, 0, 0.1)",
                      borderColor: "#FF9800",
                    },
                  }}
                >
                  New Clip <Typography component="span" sx={{ fontSize: "0.65rem", opacity: 0.7 }}>-10%</Typography>
                </AnimatedButton>
              )}
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
      ArtistMaster: PropTypes.string.isRequired,
    }),
  ).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
