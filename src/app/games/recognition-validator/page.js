"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import styles from "../styles.module.css";

const TIER_CONFIG = {
  1: { name: "Iconic", vibe: "Everyone knows it", color: "#FFD700" },      // Gold
  2: { name: "Essential", vibe: "Milonga staples", color: "#C0C0C0" },     // Silver
  3: { name: "Familiar", vibe: "You've heard it", color: "#CD7F32" },      // Bronze
  4: { name: "Challenging", vibe: "Tests your ears", color: "#4A90D9" },   // Blue
  5: { name: "Deep Cuts", vibe: "DJ-level knowledge", color: "#808080" },  // Gray
};

// Play range definitions (moved outside component to avoid re-creation)
const PLAY_RANGES = [
  { label: "0", min: 0, max: 0 },
  { label: "1-3", min: 1, max: 3 },
  { label: "4-6", min: 4, max: 6 },
  { label: "7-9", min: 7, max: 9 },
  { label: "10-12", min: 10, max: 12 },
  { label: "13-15", min: 13, max: 15 },
  { label: "16-18", min: 16, max: 18 },
  { label: "19-21", min: 19, max: 21 },
  { label: "22-24", min: 22, max: 24 },
  { label: "25+", min: 25, max: 100 },
];

export default function RecognitionValidatorPage() {
  const [allSongs, setAllSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Filters
  const [selectedRatings, setSelectedRatings] = useState([5]); // Individual ratings 1-5
  const [selectedPlayRanges, setSelectedPlayRanges] = useState([]); // Play ranges like "0-2", "3-5", etc.
  const [selectedTiers, setSelectedTiers] = useState([1]);
  const [filterMode, setFilterMode] = useState("tiers"); // "tiers" or "manual" (rating+plays)
  const [sortBy, setSortBy] = useState("recognitionScore");
  const [loadError, setLoadError] = useState(null);

  // Song info/similar dialogs
  const [infoDialogSong, setInfoDialogSong] = useState(null);
  const [similarSongs, setSimilarSongs] = useState([]);

  // Use simple HTML5 Audio instead of WaveSurfer to avoid CORS fetch issues
  const audioRef = useRef(null);
  const stopTimerRef = useRef(null);

  // Clip playback settings
  const CLIP_DURATION = 20; // seconds
  const MAX_START_TIME = 90; // seconds (random start between 0-90s)

  // Load songs on mount
  useEffect(() => {
    fetch("/songData/djSongsWeighted.json")
      .then((res) => res.json())
      .then((data) => {
        setAllSongs(data.songs || []);
      })
      .catch((err) => console.error("Failed to load songs:", err));
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = allSongs.filter((song) => {
      const rating = song.Rating || 0;
      const plays = song.TimesPlayed || 0;
      const tier = song.recognitionTier || 5;

      if (filterMode === "tiers") {
        // Filter by recognition tier only
        return selectedTiers.includes(tier);
      } else {
        // Filter by rating and play ranges
        const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(rating);

        let playsMatch = selectedPlayRanges.length === 0; // If no ranges selected, match all
        if (!playsMatch) {
          for (const rangeLabel of selectedPlayRanges) {
            const range = PLAY_RANGES.find(r => r.label === rangeLabel);
            if (range && plays >= range.min && plays <= range.max) {
              playsMatch = true;
              break;
            }
          }
        }

        return ratingMatch && playsMatch;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recognitionScore":
          return (b.recognitionScore || 0) - (a.recognitionScore || 0);
        case "plays":
          return (b.TimesPlayed || 0) - (a.TimesPlayed || 0);
        case "rating":
          return (b.Rating || 0) - (a.Rating || 0);
        case "title":
          return (a.Title || "").localeCompare(b.Title || "");
        case "orchestra":
          return (a.ArtistMaster || "").localeCompare(b.ArtistMaster || "");
        default:
          return 0;
      }
    });

    setFilteredSongs(filtered);
    setCurrentIndex(0);
  }, [allSongs, filterMode, selectedRatings, selectedPlayRanges, selectedTiers, sortBy]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    audioRef.current.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      setLoadError("Failed to load audio");
      setIsPlaying(false);
    });
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const currentSong = filteredSongs[currentIndex];

  const playSong = useCallback((song) => {
    if (!audioRef.current) return;
    setLoadError(null);

    // Clear any existing stop timer
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);

    audioRef.current.pause();
    // Use the audio proxy API to avoid CORS issues
    const audioUrl = `/api/audio/${song.SongID}`;
    audioRef.current.src = audioUrl;

    // Random start position between 0 and MAX_START_TIME
    const randomStart = Math.floor(Math.random() * MAX_START_TIME);

    // Wait for audio to load, then seek and play
    audioRef.current.onloadedmetadata = () => {
      // Make sure we don't seek past the end
      const maxSeek = Math.max(0, audioRef.current.duration - CLIP_DURATION - 5);
      audioRef.current.currentTime = Math.min(randomStart, maxSeek);
    };

    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        // Auto-stop after CLIP_DURATION seconds
        stopTimerRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }, CLIP_DURATION * 1000);
      })
      .catch((err) => {
        console.error("Play error:", err);
        setLoadError("Failed to play audio");
        setIsPlaying(false);
      });
  }, []);

  const togglePlay = () => {
    if (!currentSong || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Check if we already have this song loaded
      if (audioRef.current.src && audioRef.current.src.endsWith(currentSong.SongID)) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Resume error:", err);
            playSong(currentSong); // Retry with fresh load
          });
      } else {
        playSong(currentSong);
      }
    }
  };

  const playNext = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (currentIndex + 1 < filteredSongs.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      playSong(filteredSongs[nextIdx]);
    }
  }, [currentIndex, filteredSongs, playSong]);

  const playAtIndex = (idx) => {
    setCurrentIndex(idx);
    playSong(filteredSongs[idx]);
  };

  // Single-select tier toggle
  const toggleTier = (tier) => {
    setSelectedTiers([tier]);
  };

  // Shuffle the current filtered songs
  const shuffleSongs = () => {
    setFilteredSongs((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
  };

  // Find similar songs (same title + same artist, different versions)
  const findSimilarSongs = (song) => {
    if (!song) return;

    // Normalize for matching
    const normalizeStr = (s) => (s || "").toLowerCase().trim()
      .replace(/[^\w\s]/g, "")  // Remove punctuation
      .replace(/\s+/g, " ");     // Normalize whitespace

    const targetTitle = normalizeStr(song.Title);
    const targetArtist = normalizeStr(song.ArtistMaster);

    // Find songs with similar title AND same artist
    const similar = allSongs.filter((s) => {
      if (s.SongID === song.SongID) return false; // Exclude self

      const sTitle = normalizeStr(s.Title);
      const sArtist = normalizeStr(s.ArtistMaster);

      // Same artist and similar title (starts with same prefix or contains)
      const sameArtist = sArtist === targetArtist;
      const similarTitle = sTitle.includes(targetTitle.slice(0, 10)) ||
                          targetTitle.includes(sTitle.slice(0, 10)) ||
                          sTitle === targetTitle;

      return sameArtist && similarTitle;
    });

    // Sort by plays descending
    similar.sort((a, b) => (b.TimesPlayed || 0) - (a.TimesPlayed || 0));

    setSimilarSongs(similar);
    setInfoDialogSong(song);
  };

  // Show song info dialog
  const showSongInfo = (song, e) => {
    e.stopPropagation();
    setInfoDialogSong(song);
    setSimilarSongs([]);
  };

  // Find similar and show
  const handleFindSimilar = (song, e) => {
    e.stopPropagation();
    findSimilarSongs(song);
  };

  // Stats - count songs per tier, rating, and play range
  const stats = useMemo(() => {
    const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const playRangeCounts = {};
    PLAY_RANGES.forEach(r => playRangeCounts[r.label] = 0);

    allSongs.forEach((song) => {
      const rating = song.Rating || 0;
      const plays = song.TimesPlayed || 0;
      const tier = song.recognitionTier || 5;

      tierCounts[tier]++;
      if (rating >= 1 && rating <= 5) ratingCounts[rating]++;

      for (const range of PLAY_RANGES) {
        if (plays >= range.min && plays <= range.max) {
          playRangeCounts[range.label]++;
          break;
        }
      }
    });

    return { tierCounts, ratingCounts, playRangeCounts };
  }, [allSongs]);

  // Toggle helpers
  const toggleRating = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const togglePlayRange = (rangeLabel) => {
    setSelectedPlayRanges(prev =>
      prev.includes(rangeLabel) ? prev.filter(r => r !== rangeLabel) : [...prev, rangeLabel]
    );
  };

  return (
    <Box
      className={styles.container}
      sx={{
        color: "var(--foreground)",
        background: "var(--background)",
        minHeight: "100vh",
        p: 2,
      }}
    >
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        Recognition Validator
      </Typography>

      {/* Filter Mode Toggle */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Button
          variant={filterMode === "tiers" ? "contained" : "outlined"}
          onClick={() => setFilterMode("tiers")}
          size="small"
          sx={{
            background: filterMode === "tiers" ? "var(--accent)" : "transparent",
            borderColor: "var(--accent)",
            color: filterMode === "tiers" ? "var(--background)" : "var(--accent)",
          }}
        >
          Filter by Tiers
        </Button>
        <Button
          variant={filterMode === "manual" ? "contained" : "outlined"}
          onClick={() => setFilterMode("manual")}
          size="small"
          sx={{
            background: filterMode === "manual" ? "var(--accent)" : "transparent",
            borderColor: "var(--accent)",
            color: filterMode === "manual" ? "var(--background)" : "var(--accent)",
          }}
        >
          Filter by Rating + Plays
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, p: 2, background: "var(--input-bg)", borderRadius: 2 }}>

        {filterMode === "tiers" ? (
          /* Recognition Tiers */
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
              Recognition Tiers
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[1, 2, 3, 4, 5].map((tier) => (
                <Chip
                  key={tier}
                  label={`${tier}. ${TIER_CONFIG[tier].name} (${stats.tierCounts[tier]})`}
                  onClick={() => toggleTier(tier)}
                  sx={{
                    background: selectedTiers.includes(tier) ? TIER_CONFIG[tier].color : "transparent",
                    border: `2px solid ${TIER_CONFIG[tier].color}`,
                    color: selectedTiers.includes(tier) ? "#000" : "var(--foreground)",
                    fontWeight: selectedTiers.includes(tier) ? "bold" : "normal",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          /* Manual Rating + Plays filters */
          <>
            {/* Rating buttons */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                Rating (Stars)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Chip
                    key={rating}
                    label={`${"★".repeat(rating)} (${stats.ratingCounts[rating]})`}
                    onClick={() => toggleRating(rating)}
                    size="small"
                    sx={{
                      background: selectedRatings.includes(rating) ? "var(--accent)" : "transparent",
                      border: "1px solid var(--accent)",
                      color: selectedRatings.includes(rating) ? "var(--background)" : "var(--foreground)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Play range buttons */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                Times Played
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {PLAY_RANGES.map((range) => (
                  <Chip
                    key={range.label}
                    label={`${range.label} (${stats.playRangeCounts[range.label]})`}
                    onClick={() => togglePlayRange(range.label)}
                    size="small"
                    sx={{
                      background: selectedPlayRanges.includes(range.label) ? "var(--accent)" : "transparent",
                      border: "1px solid var(--accent)",
                      color: selectedPlayRanges.includes(range.label) ? "var(--background)" : "var(--foreground)",
                      cursor: "pointer",
                      minWidth: 60,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Sort and Shuffle */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="recognitionScore">Recognition Score (High→Low)</MenuItem>
              <MenuItem value="plays">Times Played (High→Low)</MenuItem>
              <MenuItem value="rating">Rating (High→Low)</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
              <MenuItem value="orchestra">Orchestra (A-Z)</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ShuffleIcon />}
            onClick={shuffleSongs}
            size="small"
            sx={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Shuffle
          </Button>
        </Box>
      </Box>

      {/* Results count and playback info */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2">
          {filteredSongs.length} songs • Playing {CLIP_DURATION}s clips from random position (0-{MAX_START_TIME}s)
          {loadError && (
            <Typography component="span" sx={{ color: "error.main", ml: 2 }}>
              {loadError}
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {currentIndex + 1} / {filteredSongs.length}
        </Typography>
      </Box>

      {/* Current Song Player */}
      {currentSong && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            background: "var(--input-bg)",
            borderRadius: 2,
            borderLeft: `4px solid ${TIER_CONFIG[currentSong.recognitionTier || 5].color}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={togglePlay}
              sx={{
                background: "var(--accent)",
                color: "var(--background)",
                "&:hover": { opacity: 0.8 },
                width: 48,
                height: 48,
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <Button
              onClick={playNext}
              disabled={currentIndex + 1 >= filteredSongs.length}
              variant="contained"
              startIcon={<SkipNextIcon />}
              sx={{
                background: "var(--accent)",
                color: "var(--background)",
                "&:hover": { opacity: 0.8 },
                "&:disabled": { opacity: 0.3 },
              }}
            >
              Next
            </Button>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {currentSong.Title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {currentSong.ArtistMaster}
                {currentSong.Singer && ` - ${currentSong.Singer}`}
              </Typography>
            </Box>

            <IconButton onClick={() => setShowInfo(!showInfo)}>
              <InfoIcon />
            </IconButton>
          </Box>

          {showInfo && (
            <Box sx={{ mt: 2, pl: 7, fontSize: "0.85rem" }}>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Recognition Score</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {(currentSong.recognitionScore || 0).toFixed(3)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Tier</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {currentSong.recognitionTier}. {TIER_CONFIG[currentSong.recognitionTier]?.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Rating</Typography>
                  <Typography variant="body2">{currentSong.Rating}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Times Played</Typography>
                  <Typography variant="body2">{currentSong.TimesPlayed || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Orchestra Level</Typography>
                  <Typography variant="body2">{currentSong.orchestraLevel || "-"}</Typography>
                </Box>
                {currentSong.Year && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Year</Typography>
                    <Typography variant="body2">{currentSong.Year}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Style</Typography>
                  <Typography variant="body2">{currentSong.Style}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Song List */}
      <Box sx={{ maxHeight: "50vh", overflowY: "auto" }}>
        {filteredSongs.map((song, idx) => (
          <Box
            key={song.SongID}
            onClick={() => playAtIndex(idx)}
            sx={{
              py: 1,
              px: 2,
              cursor: "pointer",
              borderRadius: 1,
              mb: 0.5,
              background: idx === currentIndex ? "var(--accent)" : "transparent",
              color: idx === currentIndex ? "var(--background)" : "inherit",
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                background: idx === currentIndex ? "var(--accent)" : "var(--input-bg)",
              },
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: TIER_CONFIG[song.recognitionTier || 5].color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {song.Title} - {song.ArtistMaster}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, flexShrink: 0, mr: 1 }}>
              {(song.recognitionScore || 0).toFixed(2)} | {song.TimesPlayed || 0}x
            </Typography>
            {/* Info and Find Similar buttons */}
            <IconButton
              size="small"
              onClick={(e) => showSongInfo(song, e)}
              title="Song Info"
              sx={{ p: 0.5, color: idx === currentIndex ? "var(--background)" : "inherit" }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleFindSimilar(song, e)}
              title="Find Similar"
              sx={{ p: 0.5, color: idx === currentIndex ? "var(--background)" : "inherit" }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* Song Info / Similar Songs Dialog */}
      <Dialog
        open={!!infoDialogSong}
        onClose={() => { setInfoDialogSong(null); setSimilarSongs([]); }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { background: "var(--background)", color: "var(--foreground)" }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            {infoDialogSong?.Title}
            <Typography variant="body2" color="text.secondary">
              {infoDialogSong?.ArtistMaster}
            </Typography>
          </Box>
          <IconButton onClick={() => { setInfoDialogSong(null); setSimilarSongs([]); }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* All Song Facts */}
          {infoDialogSong && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Song Facts
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Recognition Score</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {(infoDialogSong.recognitionScore || 0).toFixed(4)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Recognition Tier</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: TIER_CONFIG[infoDialogSong.recognitionTier]?.color }}>
                    {infoDialogSong.recognitionTier}. {TIER_CONFIG[infoDialogSong.recognitionTier]?.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Rating (Stars)</Typography>
                  <Typography variant="body2">{"★".repeat(infoDialogSong.Rating || 0)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Times Played</Typography>
                  <Typography variant="body2">{infoDialogSong.TimesPlayed || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Orchestra Level</Typography>
                  <Typography variant="body2">{infoDialogSong.orchestraLevel || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Year</Typography>
                  <Typography variant="body2">{infoDialogSong.Year || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Style</Typography>
                  <Typography variant="body2">{infoDialogSong.Style || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Singer</Typography>
                  <Typography variant="body2">{infoDialogSong.Singer || "Instrumental"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Composer</Typography>
                  <Typography variant="body2">{infoDialogSong.Composer || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Song ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {infoDialogSong.SongID}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Similar Songs Section */}
          {similarSongs.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Similar Songs ({similarSongs.length} found)
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {similarSongs.map((song) => (
                  <Box
                    key={song.SongID}
                    sx={{
                      py: 1,
                      px: 2,
                      mb: 0.5,
                      background: "var(--input-bg)",
                      borderRadius: 1,
                      borderLeft: `3px solid ${TIER_CONFIG[song.recognitionTier || 5].color}`,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{song.Title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {song.Singer || "Instrumental"} • {song.Year || "?"}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2">
                          {"★".repeat(song.Rating || 0)} | {song.TimesPlayed || 0}x
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tier {song.recognitionTier}: {TIER_CONFIG[song.recognitionTier]?.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {similarSongs.length === 0 && infoDialogSong && (
            <Button
              variant="outlined"
              onClick={() => findSimilarSongs(infoDialogSong)}
              startIcon={<ContentCopyIcon />}
              sx={{ mt: 2 }}
            >
              Find Similar Songs
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
