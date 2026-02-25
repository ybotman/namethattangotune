//--------------------------------------------------------------
// src/app/games/same-song/CompareTab.js
// Compare different recordings of the same song
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
  Chip,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import styles from "../styles.module.css";
import SongSnippet from "@/components/ui/SongSnippet";
import useWaveSurfer from "@/hooks/useWaveSurfer";

export default function CompareTab({ songGroup, config, onCancel }) {
  const listRef = useRef(null);
  const songs = songGroup?.songs || [];

  const [duration, setDuration] = useState(0);
  const [randomStart, setRandomStart] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const PLAY_DURATION = config.timeLimit ?? 15;
  const FADE_DURATION = 0.8;

  // Refs for intervals
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

  // Cleanup timers
  const clearLocalTimers = useCallback(() => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    playTimeoutRef.current = null;
    countdownRef.current = null;
  }, []);

  const cleanupEverything = useCallback(() => {
    cleanupWaveSurfer();
    clearLocalTimers();
    setReady(false);
    setDuration(0);
    setTimeLeft(0);
    setRandomStart(0);
  }, [cleanupWaveSurfer, clearLocalTimers]);

  // Stop current playback
  const handleStop = useCallback(() => {
    cleanupEverything();
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, [cleanupEverything]);

  // Start playback with fade
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
            // Don't auto-advance - let user pick next
            setIsPlaying(false);
          });
        },
        (PLAY_DURATION - FADE_DURATION) * 1000
      );
    });
  }, [waveSurferRef, fadeVolume, PLAY_DURATION, FADE_DURATION]);

  // Load and play a song
  const loadAndPlaySong = useCallback(
    (idx) => {
      cleanupEverything();

      const currentSong = songs[idx];
      if (!currentSong) return;

      setCurrentIndex(idx);
      setIsPlaying(true);

      initWaveSurfer();
      loadSong(
        currentSong.AudioUrl,
        () => {
          setReady(true);

          const ws = waveSurferRef.current;
          if (!ws) return;

          const dur = ws.getDuration();
          setDuration(dur);

          // Random start in first 75%
          const maxStart = dur * 0.75;
          const startVal = Math.random() * maxStart;
          setRandomStart(startVal);
          ws.seekTo(startVal / dur);

          ws.play()
            .then(() => {
              startPlaybackWithFade();
            })
            .catch((err) => {
              console.error("Error playing audio:", err);
              setIsPlaying(false);
            });
        },
        (err) => {
          console.error("AUDIO_ERROR:", {
            songId: currentSong.SongID,
            title: currentSong.Title,
            error: err?.message || err,
          });
          setIsPlaying(false);
        }
      );
    },
    [
      songs,
      initWaveSurfer,
      loadSong,
      waveSurferRef,
      cleanupEverything,
      startPlaybackWithFade,
    ]
  );

  // Handle song click
  const handleSongClick = (idx) => {
    if (currentIndex === idx && isPlaying) {
      // Clicking current playing song - stop it
      handleStop();
    } else {
      // Play the clicked song
      loadAndPlaySong(idx);
    }
  };

  // Scroll to active
  useEffect(() => {
    if (listRef.current && currentIndex >= 0) {
      const listItem = listRef.current.querySelector(
        `[data-idx="${currentIndex}"]`
      );
      if (listItem) {
        listItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupEverything;
  }, [cleanupEverything]);

  const progressValue = timeLeft > 0 ? (timeLeft / PLAY_DURATION) * 100 : 0;

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
      {/* Header */}
      <Box sx={{ flex: "0 0 auto", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ flex: 1 }}>
            {songGroup.title}
          </Typography>
          <Chip
            label={`${songs.length} recordings`}
            color="warning"
            size="small"
          />
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
            Close
          </Button>
        </Box>

        {/* Progress bar */}
        {isPlaying && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{ height: "8px", borderRadius: "4px" }}
            />
          </Box>
        )}

        {/* Snippet visualization */}
        {duration > 0 && (
          <SongSnippet
            duration={duration}
            lower={randomStart}
            upper={Math.min(duration, randomStart + PLAY_DURATION)}
          />
        )}
      </Box>

      {/* Recording list */}
      <Box
        sx={{
          flex: "1 1 auto",
          overflowY: "auto",
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ mb: 2, color: "gray" }}>
          Click a recording to play. Compare how different orchestras interpret
          the same song.
        </Typography>

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
              const orchestra = song.ArtistMaster || "Unknown Orchestra";
              const year = song.Year || "?";
              const singer = song.Singer;
              const style = song.Style || "";
              const isCurrent = idx === currentIndex;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <ListItem
                  key={song.SongID}
                  data-idx={idx}
                  onClick={() => handleSongClick(idx)}
                  sx={{
                    cursor: "pointer",
                    mb: 1,
                    border: isCurrent ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                    borderRadius: "8px",
                    backgroundColor: isCurrentPlaying ? "rgba(255, 165, 0, 0.1)" : "transparent",
                    "&:hover": { background: "var(--input-bg)" },
                  }}
                >
                  <IconButton
                    sx={{ mr: 1, color: "var(--accent)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongClick(idx);
                    }}
                  >
                    {isCurrentPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography component="span" fontWeight="bold">
                          {orchestra}
                        </Typography>
                        <Chip label={year} size="small" variant="outlined" />
                        {singer && (
                          <Chip
                            label={singer}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {style} | Tier {song.recognitionTier || "?"}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </Box>
  );
}

CompareTab.propTypes = {
  songGroup: PropTypes.shape({
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    songs: PropTypes.array.isRequired,
  }).isRequired,
  config: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};
