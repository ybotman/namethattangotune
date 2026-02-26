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
  const { calculateMaxScore, WRONG_PENALTY, INTERVAL_MS } = useSingerQuiz();
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
    startIntervals,
    stopAllIntervals,
    initRound,
    handleAnswerSelect: scoringAnswerSelect,
    handleNextSong,
  } = useSingerQuizScoring({
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
        <Box sx={{ flex: 1 }}>
          <RoundProgress totalRounds={numSongs} currentRound={currentIndex} />
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          {!isPlaying && !roundOver && currentSong && (
            <Button
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
            </Button>
          )}
          {roundOver && (
            <Button
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
            </Button>
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
      <Typography variant="body1" sx={{ mb: 1, textAlign: "center" }}>
        Points: {Math.floor(roundScore)}/{Math.floor(maxScore)}
      </Typography>

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
        {answers.map((ans) => {
          const isWrong = wrongAnswers.includes(ans);
          const correctSinger = currentSong?.Singer || "Unknown Singer";
          const isChosenCorrect =
            roundOver &&
            selectedAnswer === ans &&
            ans.trim().toLowerCase() === correctSinger.trim().toLowerCase();

          let borderColor = "var(--border-color)";
          if (roundOver && isChosenCorrect) borderColor = "green";
          else if (isWrong) borderColor = "red";

          const disabled =
            roundOver || !isPlaying || isWrong || isChosenCorrect;

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
                "&:hover": {
                  backgroundColor: disabled ? "inherit" : "var(--input-bg)",
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
