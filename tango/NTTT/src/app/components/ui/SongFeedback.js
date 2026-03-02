// ------------------------------------------------------------
// src/components/ui/SongFeedback.js
// Subtle feedback button for reporting song data issues
// Shows on roundOver for obscure songs (grid 3,5,6,7,8,9)
// ------------------------------------------------------------
"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { submitSongFeedback, FEEDBACK_TYPES } from "@/utils/feedbackService";

/**
 * SongFeedback - Subtle flag button for reporting song issues
 * Only shows for more obscure/complex songs where data quality matters most
 */
export default function SongFeedback({
  song,
  gameType,
  config,
  answers,
  selectedAnswer,
  correctAnswer,
  wasCorrect,
  roundScore,
  sessionScore,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setSelectedType(null);
    setUserAnswer("");
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedType(null);
    setUserAnswer("");
  };

  const handleTypeSelect = (type) => {
    if (type.hasUserAnswer) {
      // Show input field for user answer
      setSelectedType(type);
    } else {
      // Submit directly
      doSubmit(type.value, "");
    }
  };

  const doSubmit = async (feedbackType, suggestedAnswer) => {
    setSubmitting(true);
    handleClose();

    try {
      await submitSongFeedback({
        feedbackType,
        gameType,
        song,
        config,
        answers,
        selectedAnswer,
        correctAnswer,
        wasCorrect,
        roundScore,
        sessionScore,
        userSuggestedAnswer: suggestedAnswer,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission failed:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWithAnswer = () => {
    if (selectedType) {
      doSubmit(selectedType.value, userAnswer);
    }
  };

  // Don't show if already submitted
  if (submitted) {
    return (
      <Typography
        variant="caption"
        sx={{ color: "var(--foreground)", opacity: 0.5, fontSize: "0.65rem" }}
      >
        Thanks for the feedback
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      <IconButton
        onClick={handleClick}
        disabled={submitting}
        size="small"
        sx={{
          color: "var(--foreground)",
          opacity: 0.4,
          "&:hover": { opacity: 0.8 },
          p: 0.5,
        }}
        aria-label="Report issue with this song"
      >
        {submitting ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <FlagOutlinedIcon sx={{ fontSize: 16 }} />
        )}
      </IconButton>
      <Typography
        variant="caption"
        onClick={handleClick}
        sx={{
          color: "var(--foreground)",
          opacity: 0.4,
          fontSize: "0.65rem",
          cursor: "pointer",
          "&:hover": { opacity: 0.8 },
          ml: 0.25,
        }}
      >
        hmm...
      </Typography>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disablePortal
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--background)",
              border: "1px solid var(--border-color)",
              minWidth: 240,
              maxWidth: 300,
              zIndex: 9999,
            },
          },
        }}
      >
        {!selectedType
          ? [
              <MenuItem key="header" disabled sx={{ opacity: 0.6 }}>
                <Typography variant="caption">Something wrong?</Typography>
              </MenuItem>,
            ].concat(
              FEEDBACK_TYPES.map((type) => (
                <MenuItem
                  key={type.value}
                  onClick={() => handleTypeSelect(type)}
                  sx={{
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                    "&:hover": { backgroundColor: "var(--input-bg)" },
                  }}
                >
                  {type.label}
                </MenuItem>
              ))
            )
          : [
              <Box key="input-step" sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.7 }}>
                  {selectedType.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="What should it be?"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                  sx={{
                    mt: 1,
                    "& .MuiInputBase-root": {
                      backgroundColor: "var(--input-bg)",
                      color: "var(--foreground)",
                      fontSize: "0.85rem",
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmitWithAnswer();
                    }
                  }}
                />
                <Box sx={{ display: "flex", gap: 1, mt: 1.5, justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    onClick={handleClose}
                    sx={{ color: "var(--foreground)", opacity: 0.7, fontSize: "0.75rem" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSubmitWithAnswer}
                    sx={{
                      backgroundColor: "var(--accent)",
                      fontSize: "0.75rem",
                      "&:hover": { opacity: 0.9 },
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>,
            ]}
      </Menu>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

SongFeedback.propTypes = {
  song: PropTypes.object,
  gameType: PropTypes.string.isRequired,
  config: PropTypes.object,
  answers: PropTypes.arrayOf(PropTypes.string),
  selectedAnswer: PropTypes.string,
  correctAnswer: PropTypes.string,
  wasCorrect: PropTypes.bool,
  roundScore: PropTypes.number,
  sessionScore: PropTypes.number,
};
