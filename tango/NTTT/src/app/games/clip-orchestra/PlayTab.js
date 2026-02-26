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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";

import useWaveSurfer from "@/hooks/useWaveSurfer";
import { shuffleArray } from "@/utils/dataFetching";
import { getDistractors } from "@/utils/dataFetching";
import RoundProgress from "@/components/ui/RoundProgress";
import GameHubRoute from "@/components/ui/GameHubRoute";

const BASE_SCORE = 100;
const REPLAY_PENALTY = 0.15; // 15% reduction per replay
const WRONG_PENALTY = 0.25; // 25% reduction per wrong answer

export default function PlayTab({ songs, config, onCancel }) {
  const clipLength = config.clipLength ?? 5;
  const numSongs = config.numSongs ?? 10;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(songs[0] || null);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [roundOver, setRoundOver] = useState(false);
  const [roundScore, setRoundScore] = useState(BASE_SCORE);
  const [sessionScore, setSessionScore] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [roundStats, setRoundStats] = useState([]);
  const [replayCount, setReplayCount] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
    setRoundScore(BASE_SCORE);
    setReplayCount(0);
    setRoundOver(false);
    setHasPlayed(false);
    setIsPlaying(false);
    clipStartRef.current = null;
  }, [songs]);

  // Build answers when song changes
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
        setAnswers([correctArtist]);
      });
  }, [currentSong, config]);

  // Play the clip
  const playClip = useCallback(() => {
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

    setIsPlaying(true);
    initWaveSurfer();
    playSnippet(currentSong.AudioUrl, {
      snippetStart: clipStartRef.current,
      snippetDuration: clipLength,
      fadeDurationSec: 0.3,
      onPlaySuccess: () => {
        setHasPlayed(true);
      },
      onPlayError: (err) => {
        console.error("Clip play error:", err);
        setIsPlaying(false);
      },
    });

    // Stop after clip length
    setTimeout(() => {
      cleanupWaveSurfer();
      setIsPlaying(false);
    }, clipLength * 1000 + 300);
  }, [currentSong, clipLength, hasPlayed, initWaveSurfer, playSnippet, cleanupWaveSurfer]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((ans) => {
    if (roundOver || !hasPlayed) return;

    setSelectedAnswer(ans);
    const correctArtist = (currentSong?.ArtistMaster || "").trim().toLowerCase();
    const guess = ans.trim().toLowerCase();
    const isCorrect = guess === correctArtist;

    if (isCorrect) {
      cleanupWaveSurfer();
      setSessionScore((old) => old + Math.max(roundScore, 0));
      setRoundStats((old) => [
        ...old,
        { replays: replayCount, wrongGuesses: wrongAnswers.length },
      ]);
      setRoundOver(true);
    } else {
      setWrongAnswers((old) => [...old, ans]);
      const newScore = Math.max(roundScore * (1 - WRONG_PENALTY), 0);
      setRoundScore(newScore);

      if (newScore <= 0) {
        cleanupWaveSurfer();
        setRoundStats((old) => [
          ...old,
          { replays: replayCount, wrongGuesses: wrongAnswers.length + 1 },
        ]);
        setRoundOver(true);
      }
    }
  }, [currentSong, roundOver, hasPlayed, roundScore, replayCount, wrongAnswers, cleanupWaveSurfer]);

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
          <IconButton onClick={onCancel} color="primary" aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Action Bar: Round Progress + Play/Next Button - Compact */}
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

        <Box sx={{ flexShrink: 0 }}>
          {!roundOver && (
            <Button
              variant="contained"
              onClick={playClip}
              disabled={isPlaying}
              startIcon={hasPlayed ? <ReplayIcon sx={{ fontSize: 16 }} /> : null}
              size="small"
              sx={{
                backgroundColor: hasPlayed ? "var(--accent)" : "#4CAF50",
                color: "white",
                fontWeight: "bold",
                px: 1.5,
                py: 0.5,
                minWidth: 60,
                fontSize: "0.85rem",
                "&:hover": { opacity: 0.9 },
              }}
            >
              {isPlaying ? "..." : hasPlayed ? "" : "GO!"}
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
                py: 0.5,
                minWidth: 60,
                fontSize: "0.9rem",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Next
            </Button>
          )}
        </Box>
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
              color: roundScore / BASE_SCORE > 0.6 ? "#4CAF50" :
                     roundScore / BASE_SCORE > 0.3 ? "#FF9800" : "#f44336"
            }}
          >
            {Math.floor(roundScore)} / {BASE_SCORE}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(roundScore / BASE_SCORE) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--border-color)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: roundScore / BASE_SCORE > 0.6 ? "#4CAF50" :
                               roundScore / BASE_SCORE > 0.3 ? "#FF9800" : "#f44336",
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
                  <Typography sx={{ color: "var(--foreground)" }}>
                    {ans}
                  </Typography>
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

      {/* Round result feedback (Next button is in header now) */}
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
