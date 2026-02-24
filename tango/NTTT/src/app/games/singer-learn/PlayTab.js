//--------------------------------------------------------------
// src/app/games/singer-learn/PlayTab.js
//--------------------------------------------------------------
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Chip,
} from "@mui/material";
import styles from "../styles.module.css";
import SongSnippet from "@/components/ui/SongSnippet";
import { useGameContext } from "@/contexts/GameContext";
import useWaveSurfer from "@/hooks/useWaveSurfer";

// iOS check
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function PlayTab({ songs, config, onCancel }) {
  // Basic Game Context & local states
  const { currentScore, setCurrentScore, completeGame } = useGameContext();
  const listRef = useRef(null);

  const [duration, setDuration] = useState(0);
  const [randomStart, setRandomStart] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [ready, setReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const onIOS = isIOS();
  const [autoNext, setAutoNext] = useState(!onIOS);
  const [iosBugOpen, setIosBugOpen] = useState(onIOS);

  const PLAY_DURATION = config.timeLimit ?? 15;
  const FADE_DURATION = 0.8;

  // Refs for game-specific intervals
  const playTimeoutRef = useRef(null);
  const countdownRef = useRef(null);

  // WaveSurfer hook
  const {
    waveSurferRef,
    initWaveSurfer,
    cleanupWaveSurfer,
    loadSong,
    fadeVolume,
  } = useWaveSurfer({
    onSongEnd: null,
  });

  useEffect(() => {
    console.log("Singer Learn PlayTab - config:", config);
  }, [config]);

  // Timers / Intervals Cleanup
  const clearLocalTimers = useCallback(() => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    playTimeoutRef.current = null;
    countdownRef.current = null;
  }, []);

  // Overall Cleanup
  const cleanupEverything = useCallback(() => {
    cleanupWaveSurfer();
    clearLocalTimers();
    setReady(false);
    setDuration(0);
    setTimeLeft(0);
    setRandomStart(0);
  }, [cleanupWaveSurfer, clearLocalTimers]);

  // Next Song
  const handleNextSong = useCallback(() => {
    cleanupEverything();
    if (currentIndex + 1 < songs.length) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {}, 500);
    } else {
      setIsPlaying(false);
      setCurrentIndex(-1);
      setGameOver(true);
      const finalScore = currentScore + 1;
      setCurrentScore(finalScore);
      completeGame(finalScore);
    }
  }, [
    cleanupEverything,
    currentIndex,
    songs,
    currentScore,
    setCurrentScore,
    completeGame,
  ]);

  // Start Playback & Fade Logic
  const startPlaybackWithFade = useCallback(() => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.setVolume(0);

    setTimeLeft(PLAY_DURATION);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    fadeVolume(0, 1, FADE_DURATION, () => {
      playTimeoutRef.current = setTimeout(
        () => {
          fadeVolume(1, 0, FADE_DURATION, () => {
            if (autoNext) handleNextSong();
          });
        },
        (PLAY_DURATION - FADE_DURATION) * 1000,
      );
    });
  }, [
    waveSurferRef,
    fadeVolume,
    PLAY_DURATION,
    FADE_DURATION,
    autoNext,
    handleNextSong,
  ]);

  // Load Current Song
  const loadCurrentSong = useCallback(() => {
    cleanupEverything();

    const currentSong = songs[currentIndex];
    if (!currentSong) {
      setIsPlaying(false);
      setCurrentIndex(-1);
      return;
    }
    console.log("Ready to Play Song:", currentSong);
    initWaveSurfer();
    loadSong(currentSong.AudioUrl, () => {
      setReady(true);

      const ws = waveSurferRef.current;
      if (!ws) return;

      const dur = ws.getDuration();
      setDuration(dur);

      // For singer mode: start at a vocal segment if available
      let startVal = 0;
      const vocalSegments = currentSong.vocalSegments || [];

      if (vocalSegments.length > 0) {
        // Find segments long enough for play duration
        const validSegments = vocalSegments.filter(
          (seg) => seg.duration >= PLAY_DURATION
        );

        if (validSegments.length > 0) {
          // Pick a random valid segment
          const segment = validSegments[Math.floor(Math.random() * validSegments.length)];
          // Random start within the segment (ensuring clip fits)
          const maxStart = segment.end - PLAY_DURATION;
          startVal = segment.start + Math.random() * (maxStart - segment.start);
          startVal = Math.max(0, startVal);
          console.log("Playing vocal segment:", segment, "from:", startVal);
        } else {
          // No segment long enough - use longest segment, start at beginning
          const longestSeg = vocalSegments.reduce((a, b) =>
            a.duration > b.duration ? a : b
          );
          startVal = Math.max(0, longestSeg.start);
          console.log("Playing longest vocal segment:", longestSeg);
        }
      } else {
        // Fallback: random start in first 75%
        const maxStart = dur * 0.75;
        startVal = Math.random() * maxStart;
      }

      setRandomStart(startVal);
      ws.seekTo(startVal / dur);

      ws.play()
        .then(() => {
          startPlaybackWithFade();
        })
        .catch((err) => {
          console.error("Error playing audio:", err);
          handleNextSong();
        });
    }, (err) => {
      // Error loading audio - log details and skip to next song
      console.error("AUDIO_ERROR:", {
        songId: currentSong.SongID,
        title: currentSong.Title,
        artist: currentSong.ArtistMaster,
        url: currentSong.AudioUrl,
        error: err?.message || err,
      });
      handleNextSong();
    });
  }, [
    songs,
    currentIndex,
    initWaveSurfer,
    loadSong,
    waveSurferRef,
    handleNextSong,
    cleanupEverything,
    startPlaybackWithFade,
  ]);

  // If playing & currentIndex changes => load
  useEffect(() => {
    if (isPlaying && currentIndex >= 0 && currentIndex < songs.length) {
      loadCurrentSong();
    }
    return cleanupEverything;
  }, [isPlaying, currentIndex, songs, loadCurrentSong, cleanupEverything]);

  // Auto-start if songs exist
  useEffect(() => {
    if (gameOver) return;
    if (songs.length > 0 && !isPlaying && currentIndex === -1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [songs, isPlaying, currentIndex, gameOver]);

  // Scroll to active
  useEffect(() => {
    if (listRef.current && currentIndex >= 0) {
      const listItem = listRef.current.querySelector(
        `[data-idx="${currentIndex}"]`,
      );
      if (listItem) {
        listItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentIndex]);

  const progressValue = timeLeft > 0 ? (timeLeft / PLAY_DURATION) * 100 : 0;

  // If gameOver
  if (gameOver) {
    return (
      <Box
        className={styles.container}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            All done!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You listened to {songs.length} songs with singers.
          </Typography>
          <Button
            variant="contained"
            onClick={onCancel}
            sx={{
              background: "var(--accent)",
              color: "var(--background)",
              "&:hover": { opacity: 0.8 },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    );
  }

  // Render metadata with emphasis on singer
  const renderMetadata = (song) => {
    const singer = song.Singer || "Unknown Singer";
    const artist = song.ArtistMaster || "";
    const style = song.Style || "";
    const year = song.Year || "";
    return [artist, style, year].filter(Boolean).join(" | ");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top portion with Switch/Next/Cancel, plus progress & snippet */}
      <Box sx={{ flex: "0 0 auto", p: 2 }}>
        {/* iOS bug message */}
        <Snackbar
          open={iosBugOpen && onIOS}
          autoHideDuration={6000}
          onClose={() => setIosBugOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setIosBugOpen(false)}
            severity="info"
            sx={{ width: "100%" }}
          >
            Bug: This iPhone cannot auto-play. Please tap the songs to play!
          </Alert>
        </Snackbar>

        {/* Switch/Next/Cancel row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
                disabled={onIOS}
              />
            }
            label="Auto-Next"
          />

          {isPlaying && (
            <Button
              variant="contained"
              onClick={handleNextSong}
              disabled={!ready}
              sx={{
                background: "var(--accent)",
                color: "var(--background)",
                "&:hover": { opacity: 0.8 },
              }}
            >
              Next
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              borderColor: "var(--foreground)",
              color: "var(--foreground)",
              "&:hover": {
                background: "var(--foreground)",
                color: "var(--background)",
              },
            }}
          >
            Cancel
          </Button>
        </Box>

        {/* If playing => show time & progress */}
        {isPlaying && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{ height: "8px", borderRadius: "4px" }}
            />
          </Box>
        )}

        {/* Current Song Singer Display */}
        {isPlaying && currentIndex >= 0 && songs[currentIndex] && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip
              label={songs[currentIndex].Singer || "Unknown Singer"}
              color="warning"
              sx={{ fontSize: "1.2rem", py: 2, px: 1 }}
            />
          </Box>
        )}

        {/* Snippet if duration > 0 */}
        {duration > 0 && (
          <SongSnippet
            duration={duration}
            lower={randomStart}
            upper={Math.min(duration, randomStart + PLAY_DURATION)}
          />
        )}
      </Box>

      {/* Bottom portion: scrollable list */}
      <Box
        sx={{
          flex: "1 1 auto",
          overflowY: "auto",
          p: 2,
        }}
      >
        {songs.length === 0 ? (
          <Typography>No songs. Adjust configuration and try again.</Typography>
        ) : (
          <Box
            ref={listRef}
            sx={{
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              p: 2,
            }}
          >
            <List>
              {songs.map((song, idx) => {
                const title = song.Title || "Unknown Title";
                const singer = song.Singer || "Unknown Singer";
                const isCurrent = idx === currentIndex;
                return (
                  <ListItem
                    key={song.SongID}
                    data-idx={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      mb: 1,
                      border: isCurrent ? "2px solid var(--accent)" : "none",
                      "&:hover": { background: "var(--input-bg)" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography component="span" fontWeight="bold">
                            {singer}
                          </Typography>
                          <Typography component="span" color="text.secondary">
                            - {title}
                          </Typography>
                        </Box>
                      }
                      secondary={renderMetadata(song)}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
}

PlayTab.propTypes = {
  songs: PropTypes.array.isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
