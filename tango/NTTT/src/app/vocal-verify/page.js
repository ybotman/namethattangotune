"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function VocalVerifyPage() {
  const [songs, setSongs] = useState([]);
  const [vocalData, setVocalData] = useState({});
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [filter, setFilter] = useState("analyzed"); // analyzed by default
  const [searchTerm, setSearchTerm] = useState("");
  const [verifications, setVerifications] = useState({});
  const audioRef = useRef(null);
  const audioObjRef = useRef(null); // Use Audio() object instead of element

  // Load songs and vocal analysis data
  useEffect(() => {
    Promise.all([
      fetch("/songData/djSongs.json").then((r) => r.json()),
      fetch("/api/vocal-data").then((r) => r.json()).catch(() => ({})),
    ]).then(([djData, vocal]) => {
      setSongs(djData.songs || []);
      setVocalData(vocal);
    });

    // Load verifications from localStorage
    const saved = localStorage.getItem("vocalVerifications");
    if (saved) {
      setVerifications(JSON.parse(saved));
    }
  }, []);

  // Create and manage Audio object
  useEffect(() => {
    if (!currentSong) return;

    // IMPORTANT: Stop and destroy previous audio completely
    if (audioObjRef.current) {
      const oldAudio = audioObjRef.current;
      oldAudio.pause();
      oldAudio.currentTime = 0;
      oldAudio.src = "";
      oldAudio.load(); // Force release
      audioObjRef.current = null;
    }

    // Create new Audio object - use proxy for range request support
    const proxyUrl = `/api/audio/${currentSong.SongID}`;
    const audio = new Audio(proxyUrl);
    audioObjRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("progress", handleProgress);

    // Auto-play when ready
    audio.addEventListener("canplay", () => {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }, { once: true });

    return () => {
      // Cleanup on unmount or song change
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("progress", handleProgress);
    };
  }, [currentSong]);

  const playSong = useCallback((song, startTime = 0) => {
    // If same song, just toggle play
    if (currentSong?.SongID === song.SongID && audioObjRef.current) {
      audioObjRef.current.play().catch(console.error);
      setIsPlaying(true);
      return;
    }
    // Set new song - the useEffect will create the Audio object
    setCurrentSong(song);
    setIsPlaying(true);
  }, [currentSong]);

  const togglePlay = useCallback(() => {
    const audio = audioObjRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekTo = useCallback((time) => {
    const audio = audioObjRef.current;
    if (!audio) return;

    console.log("seekTo:", time);
    audio.currentTime = time;
    audio.play().catch(console.error);
    setIsPlaying(true);
  }, []);

  const markVerification = useCallback((songId, correct) => {
    const newVerifications = {
      ...verifications,
      [songId]: { correct, timestamp: new Date().toISOString() },
    };
    setVerifications(newVerifications);
    localStorage.setItem("vocalVerifications", JSON.stringify(newVerifications));
  }, [verifications]);

  // Filter songs
  const filteredSongs = songs.filter((song) => {
    const vocal = vocalData[song.SongID];
    const matchesSearch =
      song.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.Orchestra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.ArtistMaster?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "singer") return vocal?.hasSinger === true;
    if (filter === "instrumental") return vocal?.hasSinger === false;
    if (filter === "unverified") return !verifications[song.SongID];
    if (filter === "analyzed") return !!vocal;
    return true;
  });

  return (
    <Box sx={{ p: 2, maxWidth: 1200, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Vocal Detection Verification
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Search"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filter} label="Filter" onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="all">All Songs</MenuItem>
              <MenuItem value="analyzed">Analyzed Only</MenuItem>
              <MenuItem value="singer">Has Singer</MenuItem>
              <MenuItem value="instrumental">Instrumental</MenuItem>
              <MenuItem value="unverified">Unverified</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredSongs.length} of {songs.length} songs |{" "}
            {Object.keys(vocalData).length} analyzed |{" "}
            {Object.keys(verifications).length} verified
          </Typography>
        </Stack>
      </Paper>

      {/* Current Song Player */}
      {currentSong && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#1a1a2e" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={togglePlay} color="primary" size="large">
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" color="white">
                {currentSong.Title}
              </Typography>
              <Typography variant="body2" color="grey.400">
                {currentSong.ArtistMaster} | {currentSong.Orchestra}
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Stack>

          {/* Timeline */}
          <SongTimeline
            song={currentSong}
            vocalData={vocalData[currentSong.SongID]}
            currentTime={currentTime}
            duration={duration}
            onSeek={seekTo}
          />

          {/* Quick jump buttons for vocal segments */}
          {vocalData[currentSong.SongID]?.vocalSegments?.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              <Button size="small" variant="outlined" onClick={() => seekTo(0)}>
                Start
              </Button>
              {vocalData[currentSong.SongID].vocalSegments.map((seg, i) => (
                <Button
                  key={i}
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => seekTo(seg.start)}
                >
                  Vocal {i + 1} ({formatTime(seg.start)})
                </Button>
              ))}
            </Stack>
          )}

          {/* Audio handled via Audio() object in useEffect */}
          {buffered > 0 && (
            <Typography variant="caption" color="grey.500" sx={{ mt: 1, display: "block" }}>
              Buffered: {formatTime(buffered)} / {formatTime(duration)}
            </Typography>
          )}
        </Paper>
      )}

      {/* Song List */}
      <Stack spacing={1}>
        {filteredSongs.slice(0, 50).map((song, index) => (
          <SongRow
            key={`${song.SongID}-${index}`}
            song={song}
            vocalData={vocalData[song.SongID]}
            verification={verifications[song.SongID]}
            isActive={currentSong?.SongID === song.SongID}
            onPlay={playSong}
            onVerify={markVerification}
          />
        ))}
        {filteredSongs.length > 50 && (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Showing first 50 of {filteredSongs.length} songs. Use search to find more.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// Song row component
function SongRow({ song, vocalData, verification, isActive, onPlay, onVerify }) {
  const hasSinger = vocalData?.hasSinger;
  const vocalPct = vocalData?.vocalPercentage || 0;

  return (
    <Paper
      sx={{
        p: 1.5,
        bgcolor: isActive ? "#2a2a4e" : "background.paper",
        border: isActive ? "2px solid #6366f1" : "1px solid #333",
        cursor: "pointer",
        "&:hover": { bgcolor: "#252540" },
      }}
      onClick={() => onPlay(song)}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Play button */}
        <IconButton size="small" color="primary">
          <PlayArrowIcon />
        </IconButton>

        {/* Song info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" noWrap>
            {song.Title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {song.ArtistMaster} | {song.Orchestra}
          </Typography>
        </Box>

        {/* Vocal status */}
        {vocalData ? (
          <Chip
            label={hasSinger ? `Singer ${vocalPct}%` : "Instrumental"}
            color={hasSinger ? "warning" : "success"}
            size="small"
            sx={{ minWidth: 100 }}
          />
        ) : (
          <Chip label="Not analyzed" size="small" variant="outlined" />
        )}

        {/* Mini timeline preview */}
        {vocalData && (
          <Box sx={{ width: 150, height: 20 }}>
            <MiniTimeline vocalData={vocalData} />
          </Box>
        )}

        {/* Verification buttons */}
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color={verification?.correct === true ? "success" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onVerify(song.SongID, true);
            }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            size="small"
            color={verification?.correct === false ? "error" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onVerify(song.SongID, false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

// Full song timeline with playback position
function SongTimeline({ song, vocalData, currentTime, duration, onSeek, audioRef }) {
  const segments = vocalData?.vocalSegments || [];
  const totalDuration = duration || vocalData?.totalDuration || 180;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const time = pct * totalDuration;
    console.log("Seeking to:", time);
    onSeek(time);
  };

  return (
    <Box
      sx={{
        mt: 2,
        height: 60,
        bgcolor: "#333",
        borderRadius: 1,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        "&:hover": { bgcolor: "#444" },
      }}
      onClick={handleClick}
    >
      {/* Vocal segments */}
      {segments.map((seg, i) => {
        const left = (seg.start / totalDuration) * 100;
        const width = ((seg.end - seg.start) / totalDuration) * 100;
        return (
          <Box
            key={i}
            sx={{
              position: "absolute",
              left: `${left}%`,
              width: `${width}%`,
              height: "100%",
              bgcolor: "#f59e0b",
              opacity: 0.7,
              "&:hover": { opacity: 1 },
            }}
            title={`${formatTime(seg.start)} - ${formatTime(seg.end)}`}
          />
        );
      })}

      {/* Playback position */}
      <Box
        sx={{
          position: "absolute",
          left: `${(currentTime / totalDuration) * 100}%`,
          width: 2,
          height: "100%",
          bgcolor: "#fff",
          zIndex: 10,
        }}
      />

      {/* Time markers */}
      {[0, 25, 50, 75, 100].map((pct) => (
        <Typography
          key={pct}
          variant="caption"
          sx={{
            position: "absolute",
            left: `${pct}%`,
            bottom: 2,
            transform: "translateX(-50%)",
            color: "#888",
            fontSize: 10,
          }}
        >
          {formatTime((pct / 100) * totalDuration)}
        </Typography>
      ))}
    </Box>
  );
}

// Mini timeline for song list
function MiniTimeline({ vocalData }) {
  const segments = vocalData?.vocalSegments || [];
  const totalDuration = vocalData?.totalDuration || 180;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#222",
        borderRadius: 0.5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {segments.map((seg, i) => {
        const left = (seg.start / totalDuration) * 100;
        const width = ((seg.end - seg.start) / totalDuration) * 100;
        return (
          <Box
            key={i}
            sx={{
              position: "absolute",
              left: `${left}%`,
              width: `${Math.max(width, 2)}%`,
              height: "100%",
              bgcolor: "#f59e0b",
            }}
          />
        );
      })}
    </Box>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
