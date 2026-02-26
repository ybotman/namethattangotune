//--------------------------------------------------------------
// src/app/games/same-song/CompareTab.js
// Compare different recordings of the same song - simplified
//--------------------------------------------------------------
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import useWaveSurfer from "@/hooks/useWaveSurfer";

export default function CompareTab({ songGroup, config, onCancel }) {
  const songs = songGroup?.songs || [];
  const isMountedRef = useRef(true);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    waveSurferRef,
    initWaveSurfer,
    cleanupWaveSurfer,
    loadSong,
  } = useWaveSurfer({
    onSongEnd: () => {
      setIsPlaying(false);
      setCurrentIndex(-1);
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupWaveSurfer();
    };
  }, [cleanupWaveSurfer]);

  // Stop playback
  const handleStop = useCallback(() => {
    cleanupWaveSurfer();
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, [cleanupWaveSurfer]);

  // Play a song
  const handlePlay = useCallback((idx) => {
    const song = songs[idx];
    if (!song || !isMountedRef.current) return;

    cleanupWaveSurfer();
    setCurrentIndex(idx);
    setIsPlaying(true);

    initWaveSurfer();
    loadSong(
      song.AudioUrl,
      () => {
        if (!isMountedRef.current) return;
        const ws = waveSurferRef.current;
        if (!ws) return;

        ws.play().catch((err) => {
          console.error("Playback error:", err);
          if (isMountedRef.current) {
            setIsPlaying(false);
            setCurrentIndex(-1);
          }
        });
      },
      (err) => {
        console.error("Load error:", song.SongID, err?.message || err);
        if (isMountedRef.current) {
          setIsPlaying(false);
          setCurrentIndex(-1);
        }
      }
    );
  }, [songs, initWaveSurfer, loadSong, waveSurferRef, cleanupWaveSurfer]);

  // Handle row click - toggle play/stop
  const handleRowClick = (idx) => {
    if (currentIndex === idx && isPlaying) {
      handleStop();
    } else {
      handlePlay(idx);
    }
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
      {/* Header */}
      <Box sx={{ flex: "0 0 auto", p: 2, borderBottom: "1px solid var(--border-color)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {songGroup.title}
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
        <Typography variant="body2" sx={{ color: "gray" }}>
          Click a recording to play. Click again to stop.
        </Typography>
      </Box>

      {/* Recording list */}
      <Box
        sx={{
          flex: "1 1 auto",
          overflowY: "auto",
          p: 2,
        }}
      >
        {songs.map((song, idx) => {
          const orchestra = song.ArtistMaster || "Unknown";
          const year = song.Year || "?";
          const isCurrent = idx === currentIndex;
          const isCurrentPlaying = isCurrent && isPlaying;

          return (
            <Box
              key={song.SongID}
              onClick={() => handleRowClick(idx)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5,
                px: 2,
                mb: 1,
                borderRadius: 2,
                cursor: "pointer",
                border: isCurrent ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                backgroundColor: isCurrentPlaying ? "rgba(255, 165, 0, 0.15)" : "transparent",
                "&:hover": { backgroundColor: "var(--input-bg)" },
              }}
            >
              {/* Play/Stop icon */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isCurrentPlaying ? "var(--accent)" : "var(--input-bg)",
                  color: isCurrentPlaying ? "var(--background)" : "var(--foreground)",
                }}
              >
                {isCurrentPlaying ? <StopIcon /> : <PlayArrowIcon />}
              </Box>

              {/* Orchestra and Year */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  {orchestra}
                </Typography>
              </Box>

              {/* Year chip */}
              <Chip
                label={year}
                size="small"
                sx={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--foreground)",
                }}
              />
            </Box>
          );
        })}
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
