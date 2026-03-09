//
// src/app/games/orchestra-quiz/PlayTab.js
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
import useSessionTracking from "@/hooks/useSessionTracking";
import { shuffleArray, fetchAllArtists } from "@/utils/dataFetching";
import { gridToFilters } from "@/components/ui/DifficultyGrid";
import { trackPlayClick, trackGuess, trackWrongAnswer, trackCorrectAnswer, trackGameComplete, trackGameCancel, trackRoundStart, trackRoundComplete, trackGameAbandon } from "@/utils/analytics";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";
import Celebration from "@/components/ui/Celebration";

/**
 * Find a random instrumental (non-vocal) start position for a song.
 * Returns null if no suitable gap found, allowing fallback to random.
 * @param {Object} song - Song with vocalSegments array
 * @param {number} minGap - Minimum gap length in seconds (default 15)
 * @param {number} maxStart - Maximum start position (default 90)
 * @returns {number|null} - Start position in seconds, or null
 */
function findInstrumentalStart(song, minGap = 15, maxStart = 90) {
  const segments = song.vocalSegments || [];
  if (segments.length === 0) return null; // No vocal data, use random

  // Build list of instrumental gaps
  const gaps = [];
  let prevEnd = 0;

  // Sort segments by start time
  const sorted = [...segments].sort((a, b) => a.start - b.start);

  for (const seg of sorted) {
    const gapStart = prevEnd;
    const gapEnd = seg.start;
    const gapLength = gapEnd - gapStart;

    if (gapLength >= minGap && gapStart < maxStart) {
      gaps.push({ start: gapStart, end: Math.min(gapEnd, maxStart), length: gapLength });
    }
    prevEnd = seg.end;
  }

  // Also check gap after last vocal segment (if song continues instrumentally)
  // We'd need totalDuration for this, but for safety just use what we have

  if (gaps.length === 0) return null;

  // Pick a random gap, weighted by length
  const totalLength = gaps.reduce((sum, g) => sum + g.length, 0);
  let pick = Math.random() * totalLength;
  for (const gap of gaps) {
    pick -= gap.length;
    if (pick <= 0) {
      // Pick random position within this gap (leaving room for clip)
      const safeEnd = gap.end - minGap;
      if (safeEnd <= gap.start) return gap.start;
      return gap.start + Math.random() * (safeEnd - gap.start);
    }
  }

  return gaps[0].start; // Fallback
}
import AnimatedScore from "@/components/ui/AnimatedScore";
import AnimatedButton from "@/components/ui/AnimatedButton";
import SongFeedback from "@/components/ui/SongFeedback";

export default function PlayTab({ songs, config, onCancel }) {
  console.log("[PlayTab] Mounted with", songs?.length, "songs, config:", JSON.stringify(config?.gridCells));

  // 2) Quiz config
  const { calculateMaxScore, INTERVAL_MS } = useArtistQuiz();
  const timeLimit = config.timeLimit ?? 15;
  const maxScore = calculateMaxScore(timeLimit, config.gridCells);

  // Local state
  const [roundOver, setRoundOver] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [roundScorePercents, setRoundScorePercents] = useState([]); // Track score % per round
  const [allArtists, setAllArtists] = useState([]); // ArtistMaster data for distractors
  const [audioReady, setAudioReady] = useState(false); // Gate answers until audio starts
  const lastSongRef = useRef(null);
  const answersGeneratedForRef = useRef(null); // Track which song's answers were generated
  const celebrationRef = useRef(null);
  const numSongs = config.numSongs ?? 10;

  // Fetch ArtistMaster for distractor generation
  useEffect(() => {
    fetchAllArtists().then(setAllArtists).catch(console.error);
  }, []);

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
    isLockedOut,
    startIntervals,
    stopAllIntervals,
    initRound,
    handleAnswerSelect: scoringAnswerSelect,
    handleNextSong,
  } = useArtistQuizScoring({
    timeLimit,
    maxScore,
    INTERVAL_MS,
    onTimesUp: () => {
      setRoundScore(0);
      setRoundScorePercents(prev => [...prev, 0]); // Record 0% for timeout
      setRoundOver(true);
      setLastCorrect(false); // Show correct answer when time runs out
      // Note: roundStats timeout recording is handled internally by the hook
      stopAudio();
    },
    songs,
    config, // Pass config for difficulty multipliers
  });

  // Session tracking - saves to Firestore when session completes
  useSessionTracking({
    gameType: "orchestra-quiz",
    config,
    showFinalSummary,
    roundStats,
    sessionScore,
  });

  // 4) Stop audio & intervals
  const stopAudio = useCallback(() => {
    cleanupWaveSurfer();
    stopAllIntervals();
  }, [cleanupWaveSurfer, stopAllIntervals]);

  // 5) handleAnswerSelect => see if correct => end round
  const handleAnswerSelect = useCallback(
    (ans) => {
      const { roundEnded, correct } = scoringAnswerSelect(ans);

      // Track guess with song details
      const correctAns = currentSong?.ArtistMaster || "";
      trackGuess("orchestra-quiz", correct, ans, correctAns, currentSong?.AudioUrl);

      if (!correct && currentSong) {
        trackWrongAnswer("orchestra-quiz", currentSong.AudioUrl, currentSong.Title, correctAns, ans, currentSong.ArtistMaster, currentSong.Year);
      } else if (correct && currentSong) {
        trackCorrectAnswer("orchestra-quiz", currentSong.AudioUrl, roundScore, timeLimit - timeElapsed);
      }

      if (roundEnded) {
        setRoundOver(true);
        setLastCorrect(correct);
        // Record score percentage for this round
        const scorePercent = (roundScore / maxScore) * 100;
        setRoundScorePercents(prev => [...prev, scorePercent]);
        stopAudio();
        // Trigger celebration on correct answer
        if (correct && celebrationRef.current) {
          // Use emoji celebration for high scores, confetti for others
          if (scorePercent >= 80) {
            celebrationRef.current.celebrate("emoji");
          } else if (scorePercent >= 50) {
            celebrationRef.current.celebrate("confetti");
          }
        }
      }
    },
    [scoringAnswerSelect, stopAudio, roundScore, maxScore, currentSong, timeLimit, timeElapsed],
  );

  // 6) doNextSong => proceed to next
  const doNextSong = useCallback(() => {
    console.log("[PlayTab] doNextSong called");
    setRoundOver(false);
    handleNextSong();
  }, [handleNextSong]);

  // 6b) handleCancel => track abandonment and close
  const handleCancel = useCallback(() => {
    console.log("[PlayTab] handleCancel called at index", currentIndex);
    trackGameAbandon("orchestra-quiz", currentIndex + 1, numSongs);
    trackGameCancel("orchestra-quiz", currentIndex + 1, numSongs, config);
    onCancel();
  }, [currentIndex, numSongs, config, onCancel]);

  // 7) clickPlaySong => waveSurfer snippet
  const clickPlaySong = useCallback(() => {
    console.log("[PlayTab] clickPlaySong, currentSong:", currentSong?.Title);
    trackPlayClick("orchestra-quiz");
    if (!currentSong) {
      console.log("[PlayTab] No currentSong, returning");
      return;
    }
    if (lastSongRef.current === currentSong.AudioUrl) return;
    lastSongRef.current = currentSong.AudioUrl;

    // Hide GO button immediately, but keep answers disabled until audio ready
    setIsPlaying(true);
    setAudioReady(false);

    // Determine start position - avoid vocals if enabled
    let snippetStart = null;
    const avoidVocals = config.avoidVocals ?? true;
    if (avoidVocals && currentSong.hasSinger && currentSong.vocalSegments?.length > 0) {
      snippetStart = findInstrumentalStart(currentSong, 15, 90);
      if (snippetStart !== null) {
      }
    }

    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetStart,
      snippetMaxStart: 90,
      fadeDurationSec: 1.0,
      onPlaySuccess: () => {
        setAudioReady(true);
        startIntervals();
      },
      onPlayError: (err) => {
        console.error("[PlayTab] onPlayError:", err?.message || err);
        setIsPlaying(false);
        doNextSong();
      },
    });
  }, [
    currentSong,
    config.avoidVocals,
    initWaveSurfer,
    playSnippet,
    setIsPlaying,
    startIntervals,
    doNextSong,
  ]);

  // 8) Init round on mount or index change
  useEffect(() => {
    console.log("[PlayTab] useEffect: initRound for index", currentIndex, "currentSong:", currentSong?.Title);
    setAudioReady(false); // Reset audio ready state for new round
    initRound(currentIndex);
    return () => {
      console.log("[PlayTab] useEffect cleanup: stopAudio");
      stopAudio();
    };
  }, [currentIndex, initRound, stopAudio]);

  // 9) Build answers from ArtistMaster filtered by selected orchestra levels
  // Distractors come ONLY from the same tier(s) selected - no bleeding across tiers
  // IMPORTANT: Only generate once per song to prevent answer positions from shifting
  useEffect(() => {
    if (!currentSong || allArtists.length === 0) return;

    // Skip if we already generated answers for this exact song
    const songId = currentSong.SongID || currentSong.AudioUrl;
    if (answersGeneratedForRef.current === songId) return;
    answersGeneratedForRef.current = songId;

    const correctArtist = currentSong.ArtistMaster || "";

    // Get selected orchestra levels from gridCells (e.g., ["Icons-Famous"] → [1])
    const gridCells = config.gridCells || ["Icons-Famous"];
    const { orchestraLevels } = gridToFilters(gridCells);
    const selectedLevels = orchestraLevels.length > 0 ? orchestraLevels : [1];

    // Filter ArtistMaster to only include orchestras at the selected levels
    // Exclude soloists (e.g., Gardel) from orchestra distractors
    const validArtists = allArtists
      .filter(a => a.active === "true")
      .filter(a => a.type === "orchestra")
      .filter(a => {
        const level = parseInt(a.level, 10);
        return selectedLevels.includes(level);
      })
      .map(a => a.artist);

    // Pick 3 distractors from valid artists (excluding correct answer)
    const distractors = shuffleArray(
      validArtists.filter((a) => a !== correctArtist)
    ).slice(0, 3);

    const finalAnswers = shuffleArray([correctArtist, ...distractors]);
    setAnswers(finalAnswers);
  }, [currentSong, allArtists, config.gridCells, setAnswers]);

  // A) timePercent for progress
  const timePercent = (timeElapsed / timeLimit) * 100;

  // B) Helper => performance text with variety (includes tango-centric phrases)
  const getPerformanceMessage = () => {
    const pct = (roundScore / maxScore) * 100;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (pct >= 90) return pick([
      "Perfect!", "Nailed it!", "Lightning fast!", "Incredible!",
      "Masterful!", "Flawless!", "On fire!", "Brilliant!",
      "Unstoppable!", "Pro level!", "Tango master!",
      "Pure compás!", "Milonguero approved!", "D'Arienzo would be proud!"
    ]);
    if (pct >= 70) return pick([
      "Excellent!", "Great job!", "Well done!", "Impressive!",
      "Nice work!", "Sharp ears!", "You know your stuff!", "Solid!",
      "Smooth!", "Right on!", "You've got this!",
      "Muy bien!", "Good oído!", "Finding the compás!"
    ]);
    if (pct >= 50) return pick([
      "Good one!", "Not bad!", "Pretty good!", "Nice!",
      "Getting there!", "Decent!", "Respectable!", "Fair enough!",
      "Steady!", "On track!", "Keep it up!",
      "Building your oído!", "Learning the orquestas!", "Tanda by tanda!"
    ]);
    if (pct >= 20) return pick([
      "Close enough!", "Just made it!", "Squeaked by!", "Phew!",
      "That was tight!", "Barely!", "By a whisker!", "Cutting it close!",
      "Narrow escape!", "Photo finish!", "Down to the wire!",
      "Saved by the bandoneón!", "Last cabeceo!", "Cortina was close!"
    ]);
    if (pct > 1) return pick([
      "Just barely.", "Scraped through.", "That was rough.",
      "Tough one.", "Hard-fought.", "A point is a point!",
      "Hung in there.", "Never gave up.", "Gritty!",
      "Even Troilo had off nights.", "The milonga continues.", "Stay in the ronda!"
    ]);
    return pick([
      "You'll get the next one!", "Tricky one!", "Keep going!",
      "Don't give up!", "Next time!", "Shake it off!", "Stay focused!",
      "Learning curve!", "Part of the journey!", "Onward!",
      "Every milonguero starts somewhere!", "Back to the práctica!", "Feel the music!"
    ]);
  };

  // C) If final => summary with celebration
  if (showFinalSummary) {
    console.log("[PlayTab] Showing final summary");
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
            onClick={handleCancel}
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
        position: "relative",
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        pt: { xs: 2, md: 4 },
      }}
    >
      {/* Desktop: constrain width, Mobile: full width */}
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 500 },
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
      {/* Celebration overlay */}
      <Celebration ref={celebrationRef} id="quiz-celebration" />

      {/* Title Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
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
            onClick={handleCancel}
            color="primary"
            aria-label="Back"
          >
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
            {/* Score text */}
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
            {/* Color-coded progress bar - green to yellow to red */}
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

      {/* Fixed spacer - no flex to prevent layout shift */}
      <Box sx={{ height: 24 }} />

      {/* Answers */}
      <List sx={{ maxWidth: "min(100%, 400px)", mx: "auto", width: "100%" }}>
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
            } else if (isLockedOut) {
              // Visual feedback during lockout
              borderColor = "var(--border-color)";
              bgColor = "rgba(128, 128, 128, 0.1)";
            }

            // disable if roundOver or audio not ready or isWrong or correct or locked out
            const disabled =
              roundOver || !audioReady || isWrong || isChosenCorrect || isLockedOut;

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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </List>

      {/* FIXED HEIGHT bottom section - prevents answer position shift */}
      <Box sx={{ height: 180, display: "flex", flexDirection: "column", justifyContent: "flex-start", mt: 2 }}>
        {/* Feedback area - fixed 60px */}
        <Box sx={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnimatePresence>
            {roundOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Box sx={{ textAlign: "center" }}>
                  {lastCorrect ? (
                    <>
                      <Typography
                        variant="h6"
                        sx={{ color: "#4caf50", fontWeight: "bold", mb: 0.5 }}
                      >
                        {getPerformanceMessage()}
                      </Typography>
                      <Typography variant="body2">
                        +{Math.floor(roundScore)} pts | Total: {Math.floor(sessionScore)}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ color: "#f44336", mb: 0.5 }}>
                        Answer: <strong>{currentSong?.ArtistMaster}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Total: {Math.floor(sessionScore)}
                      </Typography>
                    </>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Button area - fixed 80px */}
        <Box
          sx={{
            height: 80,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
        </Box>{/* Close button area */}

        {/* Feedback button - fixed 40px */}
        <Box sx={{ height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {roundOver && (
            <SongFeedback
              song={currentSong}
              gameType="orchestra-quiz"
              config={config}
              answers={answers}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentSong?.ArtistMaster}
              wasCorrect={lastCorrect}
              roundScore={roundScore}
              sessionScore={sessionScore}
            />
          )}
        </Box>
      </Box>{/* Close 180px fixed height bottom section */}
      </Box>{/* Close inner constrained Box */}
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
