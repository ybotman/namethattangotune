"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  TextField,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SaveIcon from "@mui/icons-material/Save";
import styles from "../styles.module.css";

// Resolution options per category
const RESOLUTIONS = {
  wrong_year: [
    { value: "not_reviewed", label: "Not Reviewed", color: "#888" },
    { value: "update_year", label: "Update Year to Original", color: "#4CAF50" },
    { value: "duplicate_dnu", label: "Duplicate - Do Not Use", color: "#f44336" },
    { value: "review_later", label: "Review Later", color: "#FF9800" },
  ],
  true_duplicate: [
    { value: "not_reviewed", label: "Not Reviewed", color: "#888" },
    { value: "use_reissue", label: "Use Reissue + Mark isReissue", color: "#4CAF50" },
    { value: "duplicate_dnu", label: "Duplicate - Do Not Use", color: "#f44336" },
    { value: "true_duplicate_keep_both", label: "True Duplicate - Keep Both", color: "#2196F3" },
    { value: "review_later", label: "Review Later", color: "#FF9800" },
  ],
  no_orchestra: [
    { value: "not_reviewed", label: "Not Reviewed", color: "#888" },
    { value: "set_orchestra", label: "Set Orchestra (use suggested)", color: "#4CAF50" },
    { value: "duplicate_dnu", label: "Duplicate - Do Not Use", color: "#f44336" },
    { value: "review_later", label: "Review Later", color: "#FF9800" },
  ],
  other: [
    { value: "not_reviewed", label: "Not Reviewed", color: "#888" },
    { value: "valid_modern", label: "Valid Modern Recording", color: "#4CAF50" },
    { value: "wrong_year", label: "Actually Wrong Year", color: "#FF9800" },
    { value: "duplicate_dnu", label: "Duplicate - Do Not Use", color: "#f44336" },
  ],
};

const CATEGORY_INFO = {
  wrong_year: {
    label: "Wrong Year",
    description: "Classic orchestras with 1995+ year (no original found)",
    color: "#FF9800",
  },
  true_duplicate: {
    label: "True Duplicate",
    description: "Has both original and reissue versions",
    color: "#f44336",
  },
  no_orchestra: {
    label: "No Orchestra",
    description: "Songs with empty or 'Various Artists' orchestra field",
    color: "#9C27B0",
  },
  other: {
    label: "Other/Modern",
    description: "Modern orchestras (1995+) - likely valid neo-tango",
    color: "#2196F3",
  },
};

export default function DataQualityPage() {
  const [issues, setIssues] = useState({ metadata: {}, issues: [] });
  const [currentCategory, setCurrentCategory] = useState("wrong_year");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingOriginal, setPlayingOriginal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showFixed, setShowFixed] = useState(false); // false = hide fixed
  const [yearFilter, setYearFilter] = useState(""); // empty = all years
  const [noYearOnly, setNoYearOnly] = useState(false); // show only songs without year

  const audioRef = useRef(null);

  // Load issues on mount
  useEffect(() => {
    fetch("/songData/dataQualityIssues.json")
      .then((res) => res.json())
      .then((data) => setIssues(data))
      .catch((err) => console.error("Failed to load issues:", err));
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => {
      setIsPlaying(false);
      setPlayingOriginal(false);
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Filter issues by category, fixed status, and year
  const filteredIssues = issues.issues?.filter((i) => {
    // Category filter
    if (i.category !== currentCategory) return false;
    // Fixed filter
    if (!showFixed && i.status === "fixed") return false;
    // No Year filter
    if (noYearOnly && i.year) return false;
    // Year filter (only if not filtering for no year)
    if (!noYearOnly && yearFilter && !String(i.year || "").includes(yearFilter)) return false;
    return true;
  }) || [];
  const currentIssue = filteredIssues[currentIndex];

  // Stats
  const stats = {
    wrong_year: {
      total: issues.issues?.filter((i) => i.category === "wrong_year").length || 0,
      reviewed: issues.issues?.filter((i) => i.category === "wrong_year" && i.status !== "not_reviewed").length || 0,
    },
    true_duplicate: {
      total: issues.issues?.filter((i) => i.category === "true_duplicate").length || 0,
      reviewed: issues.issues?.filter((i) => i.category === "true_duplicate" && i.status !== "not_reviewed").length || 0,
    },
    no_orchestra: {
      total: issues.issues?.filter((i) => i.category === "no_orchestra").length || 0,
      reviewed: issues.issues?.filter((i) => i.category === "no_orchestra" && i.status !== "not_reviewed").length || 0,
    },
    other: {
      total: issues.issues?.filter((i) => i.category === "other").length || 0,
      reviewed: issues.issues?.filter((i) => i.category === "other" && i.status !== "not_reviewed").length || 0,
    },
  };

  // Play audio
  const playSong = useCallback((audioUrl, songId) => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    // Use proxy API
    const proxyUrl = `/api/audio/${songId}`;
    audioRef.current.src = proxyUrl;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error("Play error:", err));
  }, []);

  const togglePlay = (isOriginal = false) => {
    if (!currentIssue) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingOriginal(false);
    } else {
      if (isOriginal && currentIssue.originals?.length > 0) {
        setPlayingOriginal(true);
        playSong(currentIssue.originals[0].audioUrl, currentIssue.originals[0].songId);
      } else {
        setPlayingOriginal(false);
        playSong(currentIssue.audioUrl, currentIssue.songId);
      }
    }
  };

  // Navigation
  const goNext = () => {
    if (currentIndex < filteredIssues.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
      setPlayingOriginal(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(false);
      setPlayingOriginal(false);
    }
  };

  // Update resolution
  const updateResolution = (resolution) => {
    if (!currentIssue) return;

    setIssues((prev) => {
      const newIssues = { ...prev };
      const idx = newIssues.issues.findIndex((i) => i.issueId === currentIssue.issueId);
      if (idx >= 0) {
        newIssues.issues[idx] = {
          ...newIssues.issues[idx],
          resolution,
          status: resolution === "not_reviewed" ? "not_reviewed" : "reviewed",
          reviewedAt: resolution === "not_reviewed" ? null : new Date().toISOString(),
        };
        newIssues.metadata.lastModified = new Date().toISOString();
        newIssues.metadata.reviewed = newIssues.issues.filter((i) => i.status !== "not_reviewed").length;
      }
      return newIssues;
    });
    setHasChanges(true);
  };

  // Update suggested year
  const updateSuggestedYear = (year) => {
    if (!currentIssue) return;

    setIssues((prev) => {
      const newIssues = { ...prev };
      const idx = newIssues.issues.findIndex((i) => i.issueId === currentIssue.issueId);
      if (idx >= 0) {
        newIssues.issues[idx] = {
          ...newIssues.issues[idx],
          suggestedYear: year,
        };
      }
      return newIssues;
    });
    setHasChanges(true);
  };

  // Update suggested orchestra
  const updateSuggestedOrchestra = (orchestra) => {
    if (!currentIssue) return;

    setIssues((prev) => {
      const newIssues = { ...prev };
      const idx = newIssues.issues.findIndex((i) => i.issueId === currentIssue.issueId);
      if (idx >= 0) {
        newIssues.issues[idx] = {
          ...newIssues.issues[idx],
          suggestedOrchestra: orchestra,
        };
      }
      return newIssues;
    });
    setHasChanges(true);
  };

  // Update notes
  const updateNotes = (notes) => {
    if (!currentIssue) return;

    setIssues((prev) => {
      const newIssues = { ...prev };
      const idx = newIssues.issues.findIndex((i) => i.issueId === currentIssue.issueId);
      if (idx >= 0) {
        newIssues.issues[idx] = {
          ...newIssues.issues[idx],
          notes,
        };
      }
      return newIssues;
    });
    setHasChanges(true);
  };

  // Save to file via API
  const saveChanges = async () => {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/data-quality/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issues),
      });
      if (res.ok) {
        setSaveStatus("Saved!");
        setHasChanges(false);
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        setSaveStatus("Save failed");
      }
    } catch (err) {
      setSaveStatus("Save error: " + err.message);
    }
  };

  // Change category
  const handleCategoryChange = (_, newValue) => {
    setCurrentCategory(newValue);
    setCurrentIndex(0);
    setIsPlaying(false);
    setPlayingOriginal(false);
  };

  const resolutionOptions = RESOLUTIONS[currentCategory] || [];

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Data Quality Review
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {saveStatus && (
            <Typography variant="body2" sx={{ color: saveStatus.includes("error") ? "red" : "green" }}>
              {saveStatus}
            </Typography>
          )}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveChanges}
            disabled={!hasChanges}
            sx={{
              background: hasChanges ? "var(--accent)" : "gray",
              color: "var(--background)",
            }}
          >
            Save {hasChanges && "*"}
          </Button>
        </Box>
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={currentCategory}
        onChange={handleCategoryChange}
        sx={{
          mb: 2,
          "& .MuiTab-root": { color: "var(--foreground)" },
          "& .Mui-selected": { color: "var(--accent)" },
        }}
      >
        {Object.entries(CATEGORY_INFO).map(([key, info]) => (
          <Tab
            key={key}
            value={key}
            label={
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2">{info.label}</Typography>
                <Typography variant="caption" sx={{ color: info.color }}>
                  {stats[key].reviewed}/{stats[key].total}
                </Typography>
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* Category description */}
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        {CATEGORY_INFO[currentCategory].description}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Button
          variant={showFixed ? "contained" : "outlined"}
          size="small"
          onClick={() => {
            setShowFixed(!showFixed);
            setCurrentIndex(0);
          }}
          sx={{
            borderColor: showFixed ? "#4CAF50" : "#888",
            background: showFixed ? "#4CAF50" : "transparent",
            color: showFixed ? "white" : "#888",
          }}
        >
          {showFixed ? "Showing Fixed" : "Hiding Fixed"}
        </Button>
        <Button
          variant={noYearOnly ? "contained" : "outlined"}
          size="small"
          onClick={() => {
            setNoYearOnly(!noYearOnly);
            if (!noYearOnly) setYearFilter(""); // clear year filter when enabling
            setCurrentIndex(0);
          }}
          sx={{
            borderColor: noYearOnly ? "#FF9800" : "#888",
            background: noYearOnly ? "#FF9800" : "transparent",
            color: noYearOnly ? "white" : "#888",
          }}
        >
          {noYearOnly ? "No Year Only" : "All Years"}
        </Button>
        <TextField
          label="Year Filter"
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setCurrentIndex(0);
          }}
          size="small"
          sx={{ width: 120 }}
          placeholder="e.g. 2017"
          disabled={noYearOnly}
        />
      </Box>

      {/* Progress */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Issue {currentIndex + 1} of {filteredIssues.length}
      </Typography>

      {/* Current Issue */}
      {currentIssue && (
        <Box
          sx={{
            p: 3,
            background: "var(--input-bg)",
            borderRadius: 2,
            borderLeft: `4px solid ${CATEGORY_INFO[currentCategory].color}`,
            mb: 2,
          }}
        >
          {/* Issue ID and Status */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Chip
              label={currentIssue.issueId}
              size="small"
              sx={{ fontFamily: "monospace" }}
            />
            <Chip
              label={currentIssue.status}
              size="small"
              sx={{
                background: currentIssue.status === "not_reviewed" ? "#888" : "#4CAF50",
                color: "white",
              }}
            />
          </Box>

          {/* Song Info */}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {currentIssue.title}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {currentIssue.orchestra}
            {currentIssue.singer && ` - ${currentIssue.singer}`}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Year: <strong style={{ color: "#f44336" }}>{currentIssue.year}</strong>
          </Typography>

          {/* Play Controls */}
          <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={isPlaying && !playingOriginal ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={() => togglePlay(false)}
              sx={{
                background: isPlaying && !playingOriginal ? "#f44336" : "var(--accent)",
                color: "var(--background)",
              }}
            >
              {isPlaying && !playingOriginal ? "Stop" : "Play"} Reissue ({currentIssue.year})
            </Button>

            {currentIssue.originals?.length > 0 && (
              <Button
                variant="contained"
                startIcon={isPlaying && playingOriginal ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={() => togglePlay(true)}
                sx={{
                  background: isPlaying && playingOriginal ? "#f44336" : "#4CAF50",
                  color: "white",
                }}
              >
                {isPlaying && playingOriginal ? "Stop" : "Play"} Original ({currentIssue.originals[0].year})
              </Button>
            )}
          </Box>

          {/* Originals List */}
          {currentIssue.originals?.length > 0 && (
            <Box sx={{ mb: 3, p: 2, background: "rgba(76, 175, 80, 0.1)", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#4CAF50" }}>
                Original Versions Found:
              </Typography>
              {currentIssue.originals.map((orig, idx) => (
                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="body2">
                    {orig.orchestra} {orig.singer && `- ${orig.singer}`}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {orig.year}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Resolution Selector */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={currentIssue.resolution || "not_reviewed"}
              label="Resolution"
              onChange={(e) => updateResolution(e.target.value)}
            >
              {resolutionOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: opt.color,
                      }}
                    />
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Suggested Year (for wrong_year category) */}
          {currentCategory === "wrong_year" && (
            <TextField
              label="Suggested Original Year"
              value={currentIssue.suggestedYear || ""}
              onChange={(e) => updateSuggestedYear(e.target.value)}
              size="small"
              sx={{ mb: 2, width: 200 }}
            />
          )}

          {/* Suggested Orchestra (for no_orchestra category) */}
          {currentCategory === "no_orchestra" && (
            <TextField
              label="Suggested Orchestra"
              value={currentIssue.suggestedOrchestra || ""}
              onChange={(e) => updateSuggestedOrchestra(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
              placeholder="e.g., Orquesta Romantica Milonguera"
            />
          )}

          {/* Notes */}
          <TextField
            label="Notes"
            value={currentIssue.notes || ""}
            onChange={(e) => updateNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
            size="small"
          />
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<SkipPreviousIcon />}
          onClick={goPrev}
          disabled={currentIndex === 0}
          sx={{ borderColor: "var(--accent)", color: "var(--accent)" }}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          endIcon={<SkipNextIcon />}
          onClick={goNext}
          disabled={currentIndex >= filteredIssues.length - 1}
          sx={{ background: "var(--accent)", color: "var(--background)" }}
        >
          Next
        </Button>
      </Box>

      {/* Issue List */}
      <Box sx={{ mt: 3, maxHeight: "30vh", overflowY: "auto" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          All {currentCategory.replace("_", " ")} issues:
        </Typography>
        {filteredIssues.map((issue, idx) => (
          <Box
            key={issue.issueId}
            onClick={() => {
              setCurrentIndex(idx);
              setIsPlaying(false);
            }}
            sx={{
              py: 1,
              px: 2,
              cursor: "pointer",
              borderRadius: 1,
              mb: 0.5,
              background: idx === currentIndex ? "var(--accent)" : "transparent",
              color: idx === currentIndex ? "var(--background)" : "inherit",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              "&:hover": {
                background: idx === currentIndex ? "var(--accent)" : "var(--input-bg)",
              },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: idx === currentIndex ? "bold" : "normal" }}>
                {issue.title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {issue.orchestra}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption">{issue.year}</Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: issue.status === "not_reviewed" ? "#888" : "#4CAF50",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
