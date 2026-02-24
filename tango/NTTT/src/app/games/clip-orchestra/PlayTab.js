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
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Identify the Orchestra
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <GameHubRoute />
          <IconButton onClick={onCancel} color="primary" aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>

      <RoundProgress totalRounds={numSongs} currentRound={currentIndex} />

      {/* Score and Replay Info */}
      <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
        Points: {Math.floor(roundScore)}/{BASE_SCORE}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center", color: "var(--accent)" }}>
        Replays: {replayCount} | Clip: {clipLength}s
      </Typography>

      {/* Play/Replay Button */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Button
          variant="contained"
          onClick={playClip}
          disabled={isPlaying || roundOver}
          startIcon={hasPlayed ? <ReplayIcon /> : null}
          sx={{
            backgroundColor: "var(--accent)",
            color: "var(--background)",
            "&:hover": { opacity: 0.8 },
            minWidth: 150,
          }}
        >
          {isPlaying ? "Playing..." : hasPlayed ? "Replay Clip" : "Play Clip"}
        </Button>
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

      {/* Round Over */}
      {roundOver && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          {roundScore > 0 ? (
            <Typography variant="h6" gutterBottom>
              Correct! Score: {Math.floor(roundScore)}
            </Typography>
          ) : (
            <Typography variant="h6" gutterBottom>
              Answer: {currentSong?.ArtistMaster}
            </Typography>
          )}

          <Typography variant="body1" gutterBottom>
            Session Total: {Math.floor(sessionScore)}
          </Typography>

          <Button variant="contained" onClick={doNextSong} sx={{ mr: 2 }}>
            Next
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              cleanupWaveSurfer();
              onCancel();
            }}
            sx={{
              borderColor: "var(--foreground)",
              color: "var(--foreground)",
              "&:hover": {
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              },
            }}
          >
            Cancel
          </Button>
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
