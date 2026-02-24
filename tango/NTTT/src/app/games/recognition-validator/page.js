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
import InfoIcon from "@mui/icons-material/Info";
import styles from "../styles.module.css";

const TIER_CONFIG = {
  1: { name: "Iconic", vibe: "Everyone knows it", color: "#FFD700" },      // Gold
  2: { name: "Essential", vibe: "Milonga staples", color: "#C0C0C0" },     // Silver
  3: { name: "Familiar", vibe: "You've heard it", color: "#CD7F32" },      // Bronze
  4: { name: "Challenging", vibe: "Tests your ears", color: "#4A90D9" },   // Blue
  5: { name: "Deep Cuts", vibe: "DJ-level knowledge", color: "#808080" },  // Gray
};

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

  // Play range definitions (groups of ~3)
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

  // Use simple HTML5 Audio instead of WaveSurfer to avoid CORS fetch issues
  const audioRef = useRef(null);

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
  }, [allSongs, filterMode, selectedRatings, selectedPlayRanges, selectedTiers, sortBy, PLAY_RANGES]);

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
    audioRef.current.pause();
    // Use the audio proxy API to avoid CORS issues
    const audioUrl = `/api/audio/${song.SongID}`;
    audioRef.current.src = audioUrl;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
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

  const playNext = () => {
    if (currentIndex + 1 < filteredSongs.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      playSong(filteredSongs[nextIdx]);
    }
  };

  const playAtIndex = (idx) => {
    setCurrentIndex(idx);
    playSong(filteredSongs[idx]);
  };

  const toggleTier = (tier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
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
  }, [allSongs, PLAY_RANGES]);

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

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="recognitionScore">Recognition Score (High to Low)</MenuItem>
            <MenuItem value="plays">Times Played (High to Low)</MenuItem>
            <MenuItem value="rating">Rating (High to Low)</MenuItem>
            <MenuItem value="title">Title (A-Z)</MenuItem>
            <MenuItem value="orchestra">Orchestra (A-Z)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results count */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        {filteredSongs.length} songs match filters
        {loadError && (
          <Typography component="span" sx={{ color: "error.main", ml: 2 }}>
            {loadError}
          </Typography>
        )}
      </Typography>

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={togglePlay}
              sx={{
                background: "var(--accent)",
                color: "var(--background)",
                "&:hover": { opacity: 0.8 },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <IconButton onClick={playNext} disabled={currentIndex + 1 >= filteredSongs.length}>
              <SkipNextIcon />
            </IconButton>

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
            <Typography variant="caption" sx={{ opacity: 0.7, flexShrink: 0 }}>
              {(song.recognitionScore || 0).toFixed(2)} | {song.TimesPlayed || 0}x
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
