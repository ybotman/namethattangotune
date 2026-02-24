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
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import styles from "../styles.module.css";
import useWaveSurfer from "@/hooks/useWaveSurfer";

const PAUSE_BETWEEN_SONGS = 3; // seconds

export default function ListenTab({ songs, onCancel }) {
  const listRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const countdownRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const progressRef = useRef(null);

  const {
    waveSurferRef,
    initWaveSurfer,
    cleanupWaveSurfer,
    loadSong,
  } = useWaveSurfer({
    onSongEnd: null,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupWaveSurfer();
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timeUpdateRef.current) clearInterval(timeUpdateRef.current);
    };
  }, [cleanupWaveSurfer]);

  // Go to next song with countdown pause
  const goToNext = useCallback(() => {
    cleanupWaveSurfer();
    if (timeUpdateRef.current) clearInterval(timeUpdateRef.current);

    if (currentIndex + 1 >= songs.length) {
      setAllDone(true);
      setIsPlaying(false);
      return;
    }

    // Start countdown
    setCountdown(PAUSE_BETWEEN_SONGS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCurrentIndex((i) => i + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentIndex, songs.length, cleanupWaveSurfer]);

  // Go to previous song
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      cleanupWaveSurfer();
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timeUpdateRef.current) clearInterval(timeUpdateRef.current);
      setCountdown(0);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, cleanupWaveSurfer]);

  // Load and play current song
  const loadCurrentSong = useCallback(() => {
    const song = songs[currentIndex];
    if (!song) return;

    cleanupWaveSurfer();
    initWaveSurfer();

    loadSong(song.AudioUrl, () => {
      const ws = waveSurferRef.current;
      if (!ws) return;

      const dur = ws.getDuration();
      setDuration(dur);
      setCurrentTime(0);

      // Time update interval
      timeUpdateRef.current = setInterval(() => {
        if (waveSurferRef.current) {
          setCurrentTime(waveSurferRef.current.getCurrentTime());
        }
      }, 500);

      // Listen for song end
      ws.on("finish", () => {
        goToNext();
      });

      // Auto play
      ws.play().catch((err) => {
        console.error("Playback error:", err);
      });
      setIsPlaying(true);
      setIsPaused(false);
    }, (err) => {
      console.error("Load error:", err);
      goToNext();
    });
  }, [songs, currentIndex, initWaveSurfer, loadSong, waveSurferRef, cleanupWaveSurfer, goToNext]);

  // Load song when index changes (and not in countdown)
  useEffect(() => {
    if (countdown === 0 && !allDone && songs.length > 0) {
      loadCurrentSong();
    }
  }, [currentIndex, countdown, allDone, songs.length, loadCurrentSong]);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!waveSurferRef.current) return;

    if (isPaused) {
      waveSurferRef.current.play();
      setIsPaused(false);
    } else {
      waveSurferRef.current.pause();
      setIsPaused(true);
    }
  };

  // Skip to next
  const skipNext = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
      setCountdown(0);
      if (currentIndex + 1 < songs.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setAllDone(true);
      }
    } else {
      goToNext();
    }
  };

  // Scroll to active song
  useEffect(() => {
    if (listRef.current && currentIndex >= 0) {
      const listItem = listRef.current.querySelector(`[data-idx="${currentIndex}"]`);
      if (listItem) {
        listItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentIndex]);

  // Seek when clicking progress bar
  const handleProgressClick = (e) => {
    if (!waveSurferRef.current || !progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    waveSurferRef.current.seekTo(percentage);
    setCurrentTime(seekTime);
  };

  const currentSong = songs[currentIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (allDone) {
    return (
      <Box
        className={styles.container}
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
        <Typography variant="h5" sx={{ mb: 2 }}>
          Listening Complete
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You listened to {songs.length} songs.
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
    );
  }

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
      {/* Top controls */}
      <Box sx={{ flex: "0 0 auto", p: 2 }}>
        {/* Song info */}
        {currentSong && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {currentSong.Title}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setInfoOpen(true)}
                sx={{ color: "var(--accent)" }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {currentSong.ArtistMaster}
              {currentSong.Singer && ` - ${currentSong.Singer}`}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {currentSong.Year && `(${currentSong.Year})`} {currentSong.Style}
            </Typography>
          </Box>
        )}

        {/* Countdown between songs */}
        {countdown > 0 && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h4" sx={{ color: "var(--accent)" }}>
              Next song in {countdown}...
            </Typography>
          </Box>
        )}

        {/* Progress bar - clickable to seek */}
        {countdown === 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              ref={progressRef}
              onClick={handleProgressClick}
              sx={{ cursor: "pointer", position: "relative" }}
            >
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: "12px",
                  borderRadius: "6px",
                  "&:hover": { height: "16px" },
                  transition: "height 0.1s",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography variant="caption">
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
              </Typography>
              <Typography variant="caption">
                {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Playback controls */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton
            onClick={goToPrev}
            disabled={currentIndex === 0}
            sx={{ color: "var(--foreground)" }}
          >
            <SkipPreviousIcon fontSize="large" />
          </IconButton>

          <IconButton
            onClick={togglePlayPause}
            sx={{
              color: "var(--background)",
              background: "var(--accent)",
              "&:hover": { opacity: 0.8 },
              width: 56,
              height: 56,
            }}
          >
            {isPaused ? <PlayArrowIcon fontSize="large" /> : <PauseIcon fontSize="large" />}
          </IconButton>

          <IconButton
            onClick={skipNext}
            sx={{ color: "var(--foreground)" }}
          >
            <SkipNextIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* Song counter and close button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">
            Song {currentIndex + 1} of {songs.length}
          </Typography>
          <Button
            variant="outlined"
            onClick={onCancel}
            size="small"
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
      </Box>

      {/* Song list - compact single line */}
      <Box
        ref={listRef}
        sx={{
          flex: "1 1 auto",
          overflowY: "auto",
          px: 2,
          pb: 2,
        }}
      >
        {songs.map((song, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <Box
              key={song.SongID}
              data-idx={idx}
              onClick={() => {
                cleanupWaveSurfer();
                if (countdownRef.current) clearInterval(countdownRef.current);
                setCountdown(0);
                setCurrentIndex(idx);
              }}
              sx={{
                cursor: "pointer",
                py: 0.75,
                px: 1,
                borderRadius: 1,
                mb: 0.25,
                background: isCurrent ? "var(--accent)" : isPast ? "rgba(128,128,128,0.1)" : "transparent",
                color: isCurrent ? "var(--background)" : "inherit",
                opacity: isPast ? 0.5 : 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "0.85rem",
                fontWeight: isCurrent ? "bold" : "normal",
                "&:hover": { background: isCurrent ? "var(--accent)" : "var(--input-bg)" },
              }}
            >
              {idx + 1}. {song.Title} - {song.ArtistMaster}{song.Singer && ` (${song.Singer})`}
            </Box>
          );
        })}
      </Box>

      {/* Info Dialog */}
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Song Info
          <IconButton onClick={() => setInfoOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentSong && (
            <Box sx={{ "& > div": { mb: 1.5 } }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Title</Typography>
                <Typography variant="body1" fontWeight="bold">{currentSong.Title}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Orchestra</Typography>
                <Typography variant="body1">{currentSong.ArtistMaster}</Typography>
              </Box>
              {currentSong.Orchestra && currentSong.Orchestra !== currentSong.ArtistMaster && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Orchestra Name</Typography>
                  <Typography variant="body1">{currentSong.Orchestra}</Typography>
                </Box>
              )}
              {currentSong.Singer && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Singer</Typography>
                  <Typography variant="body1">{currentSong.Singer}</Typography>
                </Box>
              )}
              {currentSong.Year && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Year</Typography>
                  <Typography variant="body1">{currentSong.Year}</Typography>
                </Box>
              )}
              {currentSong.Style && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Style</Typography>
                  <Typography variant="body1">{currentSong.Style}</Typography>
                </Box>
              )}
              {currentSong.Composer && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Composer</Typography>
                  <Typography variant="body1">{currentSong.Composer}</Typography>
                </Box>
              )}
              {currentSong.Alternative === "true" && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1">Alternative</Typography>
                </Box>
              )}
              {currentSong.Candombe === "true" && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1">Candombe</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

ListenTab.propTypes = {
  songs: PropTypes.array.isRequired,
  onCancel: PropTypes.func.isRequired,
};
