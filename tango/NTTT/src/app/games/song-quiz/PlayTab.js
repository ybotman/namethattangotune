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

import useWaveSurfer from "@/hooks/useWaveSurfer";
import useSongQuiz from "@/hooks/useSongQuiz";
import usePlay from "@/hooks/usePlay";
import useSongQuizScoring from "@/hooks/useSongQuizScoring";
import { shuffleArray, getTitleDistractors } from "@/utils/dataFetching";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";

export default function PlayTab({ songs, config, onCancel }) {
  const { calculateMaxScore, WRONG_PENALTY, INTERVAL_MS } = useSongQuiz();
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
  } = useSongQuizScoring({
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
    cleanupWaveSurfer();
    stopAllIntervals();
  }, [cleanupWaveSurfer, stopAllIntervals]);

  const handleAnswerSelect = useCallback(
    (ans) => {
      const { roundEnded, correct } = scoringAnswerSelect(ans);

      if (roundEnded) {
        setRoundOver(true);
        stopAudio();
      }
    },
    [scoringAnswerSelect, stopAudio]
  );

  const doNextSong = useCallback(() => {
    setRoundOver(false);
    handleNextSong();
  }, [handleNextSong]);

  const clickPlaySong = useCallback(() => {
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

  // Init round on mount or index change
  useEffect(() => {
    initRound(currentIndex);
    return () => stopAudio();
  }, [currentIndex, initRound, stopAudio]);

  // Build answers on currentSong change
  useEffect(() => {
    if (!currentSong) return;
    const correctTitle = currentSong.Title || "";

    getTitleDistractors(correctTitle, config, 3)
      .then((distractors) => {
        const finalAnswers = shuffleArray([correctTitle, ...distractors]);
        setAnswers(finalAnswers);
      })
      .catch((err) => {
        console.error("Error in getTitleDistractors:", err);
        setAnswers([correctTitle]);
      });
  }, [currentSong, config, setAnswers]);

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

  // Main quiz UI
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
          Name That Song!
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
          const isChosenCorrect =
            roundOver &&
            selectedAnswer === ans &&
            ans.trim().toLowerCase() ===
              (currentSong?.Title || "").trim().toLowerCase();

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
                Answer: <strong>{currentSong?.Title}</strong>
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
      Title: PropTypes.string.isRequired,
    })
  ).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
