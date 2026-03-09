//
// src/app/games/singer-quiz/PlayTab.js
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
import useSingerQuiz from "@/hooks/useSingerQuiz";
import usePlay from "@/hooks/usePlay";
import useSingerQuizScoring from "@/hooks/useSingerQuizScoring";
import { shuffleArray, fetchAllSingers } from "@/utils/dataFetching";
import { trackPlayClick, trackGuess, trackWrongAnswer, trackCorrectAnswer, trackGameComplete, trackGameCancel, trackGameAbandon } from "@/utils/analytics";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";
import AnimatedButton from "@/components/ui/AnimatedButton";
import SongFeedback from "@/components/ui/SongFeedback";

/**
 * Find a valid start position within a vocal segment.
 * Prioritizes segments long enough for full playback, but will use
 * any vocal segment if none are long enough (better to start singing
 * than random instrumental).
 */
function findVocalStartPosition(song, playDuration) {
  const segments = song.vocalSegments || [];

  if (segments.length === 0) {
    return null; // No vocal data - fall back to random
  }

  // First, try segments long enough for the full play duration
  const longSegments = segments.filter((seg) => seg.duration >= playDuration);

  let segment;
  if (longSegments.length > 0) {
    // Use a random long segment
    segment = longSegments[Math.floor(Math.random() * longSegments.length)];
    // Pick a random start within the segment that allows full playback
    const maxStart = segment.end - playDuration;
    const start = segment.start + Math.random() * Math.max(0, maxStart - segment.start);
    return Math.max(0, start);
  }

  // No segment long enough - use the longest available segment
  // Sort by duration descending and pick the longest
  const sorted = [...segments].sort((a, b) => b.duration - a.duration);
  segment = sorted[0];

  // Start at the beginning of this segment (it's shorter than playDuration
  // so there's no room to randomize within it)
  return Math.max(0, segment.start);
}

export default function PlayTab({ songs, config, onCancel }) {
  // Initialization gate - prevents AnimatePresence from re-rendering during rapid state changes
  // iOS PWA crashes when AnimatePresence handles too many rapid updates
  const [isReady, setIsReady] = useState(false);
  const isMountedRef = useRef(true);

  // Only log once per mount, not every render
  const hasLoggedRef = useRef(false);
  if (!hasLoggedRef.current) {
    console.log("[SingerPlayTab] Mounting with", songs?.length, "songs");
    hasLoggedRef.current = true;
  }

  const { calculateMaxScore, INTERVAL_MS } = useSingerQuiz();
  const timeLimit = config.timeLimit ?? 15;
  const maxScore = calculateMaxScore(timeLimit, config.gridCells);

  const [roundOver, setRoundOver] = useState(false);
  const [roundScorePercents, setRoundScorePercents] = useState([]);
  const [audioReady, setAudioReady] = useState(false); // Gate answers until audio starts
  const [allSingers, setAllSingers] = useState([]); // SingerMaster data for distractors
  const lastSongRef = useRef(null);
  const numSongs = config.numSongs ?? 10;

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch SingerMaster for distractor generation
  useEffect(() => {
    fetchAllSingers()
      .then((singers) => {
        if (isMountedRef.current) {
          setAllSingers(singers);
        }
      })
      .catch(console.error);
  }, []);

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
  } = useSingerQuizScoring({
    timeLimit,
    maxScore,
    INTERVAL_MS,
    onTimesUp: () => {
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
      const correctAns = currentSong?.Singer || "Unknown Singer";
      trackGuess("singer-quiz", correct, ans, correctAns, currentSong?.AudioUrl);

      if (!correct && currentSong) {
        trackWrongAnswer("singer-quiz", currentSong.AudioUrl, currentSong.Title, correctAns, ans, currentSong.ArtistMaster, currentSong.Year);
      } else if (correct && currentSong) {
        trackCorrectAnswer("singer-quiz", currentSong.AudioUrl, roundScore, timeLimit - timeElapsed);
      }

      if (roundEnded) {
        setRoundOver(true);
        const scorePercent = (roundScore / maxScore) * 100;
        setRoundScorePercents(prev => [...prev, scorePercent]);
        stopAudio();
        if (correct) {
        } else {
        }
      }
    },
    [scoringAnswerSelect, stopAudio, roundScore, maxScore, currentSong, timeLimit, timeElapsed],
  );

  const doNextSong = useCallback(() => {
    setRoundOver(false);
    handleNextSong();
  }, [handleNextSong]);

  const clickPlaySong = useCallback(() => {
    trackPlayClick("singer-quiz");
    if (!currentSong) return;
    if (lastSongRef.current === currentSong.AudioUrl) return;
    lastSongRef.current = currentSong.AudioUrl;

    // Hide GO button immediately, but keep answers disabled until audio ready
    setIsPlaying(true);
    setAudioReady(false);

    // Find a vocal segment start position
    const vocalStart = findVocalStartPosition(currentSong, timeLimit);

    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetStart: vocalStart, // Use vocal segment if available
      snippetMaxStart: vocalStart !== null ? null : 90, // Fall back to random if no vocal segment
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
    timeLimit,
    initWaveSurfer,
    playSnippet,
    setIsPlaying,
    startIntervals,
    doNextSong,
  ]);

  // Store functions in refs to avoid useEffect re-running when callbacks are recreated
  const initRoundRef = useRef(initRound);
  const stopAudioRef = useRef(stopAudio);
  initRoundRef.current = initRound;
  stopAudioRef.current = stopAudio;

  // Init round on mount or index change
  // IMPORTANT: Only depend on currentIndex to prevent iOS PWA crash from callback instability
  useEffect(() => {
    console.log("[SingerPlayTab] useEffect: initRound for index", currentIndex);
    setAudioReady(false); // Reset audio ready state for new round
    initRoundRef.current(currentIndex);
    return () => {
      console.log("[SingerPlayTab] useEffect cleanup: stopAudio");
      stopAudioRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Build answers from SingerMaster filtered by selected singer levels
  useEffect(() => {
    if (!currentSong || allSingers.length === 0) return;
    const correctSinger = currentSong.Singer || "Unknown Singer";

    // Get selected singer levels from config grid cells
    const singerGridCells = config.singerGridCells || ["Iconic-Famous"];
    const selectedLevels = new Set();
    singerGridCells.forEach(cell => {
      const [singerTier] = cell.split("-");
      if (singerTier === "Iconic") selectedLevels.add(1);
      else if (singerTier === "Essential") selectedLevels.add(2);
      else if (singerTier === "Standard") selectedLevels.add(3);
    });

    // Filter singers by selected levels for distractors
    const validSingers = allSingers
      .filter(s => selectedLevels.has(s.level))
      .map(s => s.singer);

    // Pick 3 distractors (excluding correct answer)
    const distractors = shuffleArray(
      validSingers.filter((s) => s !== correctSinger)
    ).slice(0, 3);

    const finalAnswers = shuffleArray([correctSinger, ...distractors]);
    setAnswers(finalAnswers);

    // Mark as ready - this gates AnimatePresence rendering to prevent iOS PWA crash
    if (!isReady && isMountedRef.current) {
      console.log("[SingerPlayTab] Initialization complete, setting isReady=true");
      setIsReady(true);
    }
  }, [currentSong, allSingers, config.singerGridCells, setAnswers, isReady]);

  const timePercent = (timeElapsed / timeLimit) * 100;

  const getPerformanceMessage = () => {
    const pct = (roundScore / maxScore) * 100;
    if (pct >= 80) return "Excellent!";
    if (pct >= 50) return "Great work!";
    if (pct >= 20) return "Not bad!";
    if (pct > 1) return "Just barely.";
    return "You'll get the next one!";
  };

  // Loading state - show while initializing to prevent AnimatePresence crash on iOS PWA
  if (!isReady) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loading...
        </Typography>
        <LinearProgress
          sx={{
            width: 200,
            "& .MuiLinearProgress-bar": {
              backgroundColor: "var(--accent)",
            },
          }}
        />
      </Box>
    );
  }

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
          Average Wrong Guesses: {avgDist.toFixed(1)}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            trackGameComplete("singer-quiz", sessionScore, roundStats.length, numSongs, config);
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
          Identify the Singer
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <GameHubRoute />
          <IconButton onClick={() => {
            trackGameAbandon("singer-quiz", currentIndex + 1, numSongs);
            trackGameCancel("singer-quiz", currentIndex + 1, numSongs, config);
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
          const correctSinger = currentSong?.Singer || "Unknown Singer";
          const isChosenCorrect =
            roundOver &&
            selectedAnswer === ans &&
            ans.trim().toLowerCase() === correctSinger.trim().toLowerCase();

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

      {/* Fixed height feedback area - prevents layout shift */}
      <Box sx={{ minHeight: 70, display: "flex", flexDirection: "column", justifyContent: "center", mt: 2 }}>
        {roundOver && (
          <Box sx={{ textAlign: "center" }}>
            {roundScore > 0 ? (
              <>
                <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold", mb: 0.5 }}>
                  {getPerformanceMessage()}
                </Typography>
                <Typography variant="body2">
                  +{Math.floor(roundScore)} pts | Total: {Math.floor(sessionScore)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: "#f44336", mb: 0.5 }}>
                  Answer: <strong>{currentSong?.Singer || "Unknown"}</strong>
                </Typography>
                <Typography variant="body2">
                  Total: {Math.floor(sessionScore)}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

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

      {/* Feedback button - below Next button */}
      {roundOver && (
        <Box sx={{
          position: "fixed",
          bottom: "5%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 99,
        }}>
          <SongFeedback
            song={currentSong}
            gameType="singer-quiz"
            config={config}
            answers={answers}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentSong?.Singer}
            wasCorrect={roundScore > 0}
            roundScore={roundScore}
            sessionScore={sessionScore}
          />
        </Box>
      )}
    </Box>
  );
}

PlayTab.propTypes = {
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      SongID: PropTypes.string,
      AudioUrl: PropTypes.string.isRequired,
      Singer: PropTypes.string,
      vocalSegments: PropTypes.array,
    }),
  ).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
