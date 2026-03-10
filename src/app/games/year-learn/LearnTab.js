"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import InfoIcon from "@mui/icons-material/Info";
import useWaveSurfer from "@/hooks/useWaveSurfer";

export default function LearnTab({ songs, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const currentSong = songs[currentIndex];

  const { initWaveSurfer, cleanupWaveSurfer, playSnippet, waveSurferRef } = useWaveSurfer({
    onSongEnd: () => setIsPlaying(false),
  });

  // Initialize WaveSurfer on mount
  useEffect(() => {
    initWaveSurfer();
    return () => cleanupWaveSurfer();
  }, [initWaveSurfer, cleanupWaveSurfer]);

  // Play current song when index changes
  const playCurrent = useCallback(() => {
    if (!currentSong?.AudioUrl) return;

    playSnippet(currentSong.AudioUrl, {
      snippetMaxStart: 30,
      fadeDurationSec: 0.5,
      onPlaySuccess: () => setIsPlaying(true),
      onPlayError: (err) => console.error("Play error:", err),
    });
  }, [currentSong, playSnippet]);

  // Auto-play on song change
  useEffect(() => {
    playCurrent();
  }, [currentIndex]);

  const handlePlayPause = () => {
    if (!waveSurferRef.current) return;

    if (isPlaying) {
      try { waveSurferRef.current.pause(); } catch (e) {}
      setIsPlaying(false);
    } else {
      playCurrent();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowInfo(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowInfo(false);
    }
  };

  // Group songs by year for display
  const songsByYear = songs.reduce((acc, song) => {
    const year = song.Year || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(song);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 2, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "var(--foreground)" }}>
          Learn Mode
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
          sx={{ color: "var(--foreground)", borderColor: "var(--foreground)" }}
        >
          Done
        </Button>
      </Box>

      {/* Current Song Info */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          backgroundColor: "#222",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "var(--accent)", textAlign: "center", mb: 1 }}
        >
          {currentSong?.Year || "Unknown Year"}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "var(--foreground)", textAlign: "center" }}
        >
          {currentSong?.Title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--foreground)", textAlign: "center", opacity: 0.7 }}
        >
          {currentSong?.ArtistMaster}
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <IconButton
          onClick={handlePrev}
          disabled={currentIndex === 0}
          sx={{ color: "var(--foreground)" }}
        >
          <SkipPreviousIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={handlePlayPause}
          sx={{
            color: "white",
            backgroundColor: "var(--accent)",
            "&:hover": { backgroundColor: "var(--accent)", opacity: 0.8 },
            width: 60,
            height: 60,
          }}
        >
          {isPlaying ? (
            <PauseIcon fontSize="large" />
          ) : (
            <PlayArrowIcon fontSize="large" />
          )}
        </IconButton>
        <IconButton
          onClick={handleNext}
          disabled={currentIndex === songs.length - 1}
          sx={{ color: "var(--foreground)" }}
        >
          <SkipNextIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={() => setShowInfo(!showInfo)}
          sx={{ color: showInfo ? "var(--accent)" : "var(--foreground)" }}
        >
          <InfoIcon />
        </IconButton>
      </Box>

      {/* Song Progress */}
      <Typography
        variant="body2"
        sx={{ textAlign: "center", color: "var(--foreground)", mb: 2 }}
      >
        Song {currentIndex + 1} of {songs.length}
      </Typography>

      {/* Expanded Info */}
      {showInfo && currentSong && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#222",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
            <strong>Title:</strong> {currentSong.Title}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
            <strong>Orchestra:</strong> {currentSong.ArtistMaster}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
            <strong>Year:</strong> {currentSong.Year}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
            <strong>Style:</strong> {currentSong.Style}
          </Typography>
          {currentSong.Singer && (
            <Typography variant="body2" sx={{ color: "var(--foreground)" }}>
              <strong>Singer:</strong> {currentSong.Singer}
            </Typography>
          )}
        </Box>
      )}

      {/* Song List by Year */}
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="body2"
          sx={{ color: "var(--foreground)", mb: 1, fontWeight: "bold" }}
        >
          Songs in this set:
        </Typography>
        {Object.entries(songsByYear)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([year, yearSongs]) => (
            <Box key={year} sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{ color: "var(--accent)", fontWeight: "bold" }}
              >
                {year}
              </Typography>
              {yearSongs.map((song, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    color: "var(--foreground)",
                    opacity: song === currentSong ? 1 : 0.6,
                    fontWeight: song === currentSong ? "bold" : "normal",
                    pl: 1,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                  onClick={() => {
                    const newIndex = songs.indexOf(song);
                    if (newIndex >= 0) setCurrentIndex(newIndex);
                  }}
                >
                  {song.Title} - {song.ArtistMaster}
                </Typography>
              ))}
            </Box>
          ))}
      </Box>
    </Box>
  );
}
