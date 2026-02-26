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

import useWaveSurfer from "@/hooks/useWaveSurfer";
import useSingerQuiz from "@/hooks/useSingerQuiz";
import usePlay from "@/hooks/usePlay";
import useSingerQuizScoring from "@/hooks/useSingerQuizScoring";
import { shuffleArray } from "@/utils/dataFetching";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";

/**
 * Find a valid start position within a vocal segment that ensures
 * the entire playback duration has vocals.
 */
function findVocalStartPosition(song, playDuration) {
  const segments = song.vocalSegments || [];

  // Find segments long enough for the play duration
  const validSegments = segments.filter(
    (seg) => seg.duration >= playDuration
  );

  if (validSegments.length === 0) {
    // No segment long enough - fall back to random start
    return null;
  }

  // Pick a random valid segment
  const segment = validSegments[Math.floor(Math.random() * validSegments.length)];

  // Pick a random start within the segment that allows full playback
  const maxStart = segment.end - playDuration;
  const start = segment.start + Math.random() * (maxStart - segment.start);

  return Math.max(0, start);
}

export default function PlayTab({ songs, config, onCancel }) {
  const { calculateMaxScore, INTERVAL_MS } = useSingerQuiz();
  const timeLimit = config.timeLimit ?? 15;
  const maxScore = calculateMaxScore(timeLimit);

  const [roundOver, setRoundOver] = useState(false);
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
  } = useSingerQuizScoring({
    timeLimit,
    maxScore,
    INTERVAL_MS,
    onTimesUp: () => {
      console.log("PlayTab-> onTimesUp => forcing 0 score + roundOver");
      setRoundScore(0);
      setRoundOver(true);
      stopAudio();
    },
    songs,
    config, // Pass config for difficulty multipliers
  });

  const stopAudio = useCallback(() => {
    console.log("PlayTab-> stopAudio => waveSurfer cleanup + stop intervals");
    cleanupWaveSurfer();
    stopAllIntervals();
  }, [cleanupWaveSurfer, stopAllIntervals]);

  const handleAnswerSelect = useCallback(
    (ans) => {
      console.log("PlayTab-> handleAnswerSelect =>", ans);
      const { roundEnded, correct } = scoringAnswerSelect(ans);

      if (roundEnded) {
        setRoundOver(true);
        stopAudio();
        if (correct) {
          console.log("PlayTab-> Correct!");
        } else {
          console.log("PlayTab-> Wrong => Round Over!");
        }
      }
    },
    [scoringAnswerSelect, stopAudio],
  );

  const doNextSong = useCallback(() => {
    console.log("PlayTab-> doNextSong");
    setRoundOver(false);
    handleNextSong();
  }, [handleNextSong]);

  const clickPlaySong = useCallback(() => {
    console.log("PlayTab-> clickPlaySong");
    if (!currentSong) return;
    if (lastSongRef.current === currentSong.AudioUrl) return;
    lastSongRef.current = currentSong.AudioUrl;

    // Find a vocal segment start position
    const vocalStart = findVocalStartPosition(currentSong, timeLimit);

    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetStart: vocalStart, // Use vocal segment if available
      snippetMaxStart: vocalStart !== null ? null : 90, // Fall back to random if no vocal segment
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
    timeLimit,
    initWaveSurfer,
    playSnippet,
    setIsPlaying,
    startIntervals,
    doNextSong,
  ]);

  useEffect(() => {
    initRound(currentIndex);
    return () => stopAudio();
  }, [currentIndex, initRound, stopAudio]);

  // Build answers from singer names
  useEffect(() => {
    if (!currentSong) return;
    const correctSinger = currentSong.Singer || "Unknown Singer";

    // Get unique singers from the songs list as distractors
    const allSingers = [...new Set(songs.map((s) => s.Singer).filter(Boolean))];
    const distractors = shuffleArray(
      allSingers.filter((s) => s !== correctSinger)
    ).slice(0, 3);

    const finalAnswers = shuffleArray([correctSinger, ...distractors]);
    setAnswers(finalAnswers);
  }, [currentSong, songs, setAnswers]);

  const timePercent = (timeElapsed / timeLimit) * 100;

  const getPerformanceMessage = () => {
    const pct = (roundScore / maxScore) * 100;
    if (pct >= 80) return "Excellent!";
    if (pct >= 50) return "Great work!";
    if (pct >= 20) return "Not bad!";
    if (pct > 1) return "Just barely.";
    return "You'll get the next one!";
  };

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
          onClick={onCancel}
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
          <IconButton onClick={onCancel} color="primary" aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Action Bar: Round Progress + GO!/Next Button - Compact */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1,
          px: 1,
          py: 0.5,
          backgroundColor: "var(--input-bg)",
          borderRadius: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RoundProgress totalRounds={numSongs} currentRound={currentIndex} />
        </Box>

        {/* Fixed height to prevent layout shift */}
        <Box sx={{ flexShrink: 0, minWidth: 60, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!isPlaying && !roundOver && currentSong && (
            <Button
              variant="contained"
              onClick={clickPlaySong}
              size="small"
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                fontWeight: "bold",
                px: 2,
                py: 0.25,
                minWidth: 60,
                fontSize: "0.85rem",
                "&:hover": { backgroundColor: "#43A047" },
              }}
            >
              GO!
            </Button>
          )}
          {roundOver && (
            <Button
              variant="contained"
              onClick={doNextSong}
              size="small"
              sx={{
                backgroundColor: "var(--accent)",
                color: "white",
                fontWeight: "bold",
                px: 2,
                py: 0.25,
                minWidth: 60,
                fontSize: "0.85rem",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Score Display with color-coded bar - always rendered to prevent layout shift */}
      <Box sx={{ mx: "auto", mb: 1, maxWidth: 400, minHeight: 28 }}>
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
      <List sx={{ mb: 2, maxWidth: 400, margin: "auto" }}>
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

          // disable if roundOver or not playing or isWrong or correct or locked out
          const disabled =
            roundOver || !isPlaying || isWrong || isChosenCorrect || isLockedOut;

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

      {/* Round result feedback (Next button is in header now) */}
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
