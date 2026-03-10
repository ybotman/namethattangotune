"use client";

import React, { useState, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography, Autocomplete, TextField, Button, Divider } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { motion, AnimatePresence } from "motion/react";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import useSingerLearn from "@/hooks/useSingerLearn";
import { useGameContext } from "@/contexts/GameContext";
import PropTypes from "prop-types";

export default function ConfigTab({ onConfigValid, showFilters, setShowFilters, isLandscape = false }) {
  const {
    primaryStyles,
    validationMessage,
    handleNumSongsChange,
    handleTimeLimitChange,
    handleStylesChange,
  } = useSingerLearn();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);
  const [singerOptions, setSingerOptions] = useState([]);
  const [selectedSinger, setSelectedSinger] = useState(null);
  const [loadingSingers, setLoadingSingers] = useState(true);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  // Load singers on mount
  useEffect(() => {
    (async () => {
      try {
        const singerData = await fetch("/songData/SingerMaster.json").then((r) => r.json());
        const opts = singerData
          .map((s) => ({ label: s.singer, value: s.singer }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setSingerOptions(opts);
      } catch (err) {
        console.error("Error loading singers:", err);
      }
      setLoadingSingers(false);
    })();
  }, []);

  // Update config when singer changes
  useEffect(() => {
    updateConfig("singers", selectedSinger ? [selectedSinger] : []);
  }, [selectedSinger, updateConfig]);

  // Notify parent about validation state
  useEffect(() => {
    const valid = !validationMessage && hasEnoughSongs && !!selectedSinger;
    setIsConfigValid(valid);
    if (onConfigValid) {
      onConfigValid(valid);
    }
  }, [validationMessage, hasEnoughSongs, selectedSinger, onConfigValid]);

  // Singer selector component (reused in both layouts)
  const SingerSelector = () => (
    <Box sx={{ mb: 2, px: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "var(--foreground)",
          opacity: 0.6,
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.65rem",
          fontWeight: 700,
        }}
      >
        Singer (required)
      </Typography>
      <Autocomplete
        options={singerOptions}
        getOptionLabel={(option) => option.label || ""}
        value={selectedSinger}
        onChange={(e, newValue) => setSelectedSinger(newValue)}
        loading={loadingSingers}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={loadingSingers ? "Loading..." : "Select a singer..."}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--foreground)",
                backgroundColor: "var(--input-bg)",
                "& fieldset": {
                  borderColor: selectedSinger ? "var(--accent)" : "#666",
                  borderWidth: selectedSinger ? 2 : 1,
                },
                "&:hover fieldset": { borderColor: "var(--accent)" },
                "&.Mui-focused fieldset": { borderColor: "var(--accent)" },
              },
              "& .MuiInputBase-input": { color: "var(--foreground)" },
            }}
          />
        )}
        sx={{
          "& .MuiAutocomplete-paper": {
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          },
        }}
      />
      {!selectedSinger && (
        <Typography variant="caption" sx={{ color: "#FF9800", display: "block", textAlign: "center", mt: 0.5 }}>
          Select a singer to start
        </Typography>
      )}
    </Box>
  );

  // Singer Type Toggle component
  const SingerTypeToggle = () => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "var(--foreground)",
          opacity: 0.6,
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.65rem",
        }}
      >
        Singer Type
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={config.duetFilter || "solo"}
          exclusive
          onChange={(e, val) => val && updateConfig("duetFilter", val)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "var(--foreground)",
              borderColor: "var(--accent)",
              backgroundColor: "transparent !important",
              fontSize: "0.7rem",
              py: 0.5,
              px: 1.5,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15) !important",
              },
              "&:focus": {
                backgroundColor: "transparent !important",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--accent) !important",
                color: "white",
                "&:hover, &:focus": {
                  backgroundColor: "var(--accent) !important",
                  filter: "brightness(1.1)",
                },
              },
            },
          }}
        >
          <ToggleButton value="solo">Solo</ToggleButton>
          <ToggleButton value="duetsOnly">Duets+</ToggleButton>
          <ToggleButton value="all">Both</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );

  const dividerStyle = { borderColor: "rgba(255,255,255,0.15)", my: 1 };

  // LANDSCAPE: Show everything, no animation, evenly distributed
  if (isLandscape) {
    return (
      <Box
        className={styles.configurationContainer}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          height: "100%",
          py: 2,
        }}
      >
        <SingerSelector />

        <Divider sx={dividerStyle} />

        <GameSetupDials
          numSongs={config.numSongs ?? 10}
          onNumSongsChange={handleNumSongsChange}
          timeLimit={config.timeLimit ?? 15}
          onTimeLimitChange={handleTimeLimitChange}
          secondsLabel="Time"
        />

        <Divider sx={dividerStyle} />

        <SingerTypeToggle />

        <Divider sx={dividerStyle} />

        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          compact
        />

        <Divider sx={dividerStyle} />

        <StylesSelector
          availableStyles={primaryStyles}
          selectedStyles={config.styles || {}}
          onChange={handleStylesChange}
        />

        <Divider sx={dividerStyle} />

        <PeriodsSelector
          selectedPeriods={config.periods || []}
          onChange={(val) => updateConfig("periods", val)}
        />

        {/* Validation Message */}
        {!isConfigValid && validationMessage && (
          <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
            {validationMessage}
          </Box>
        )}
      </Box>
    );
  }

  // PORTRAIT: Animated toggle between quick and filters
  return (
    <Box className={styles.configurationContainer} sx={{ overflow: "hidden", py: 1 }}>
      {/* Singer selector always visible */}
      <SingerSelector />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />

      <AnimatePresence mode="wait">
        {!showFilters ? (
          <motion.div
            key="quick"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <GameSetupDials
              numSongs={config.numSongs ?? 10}
              onNumSongsChange={handleNumSongsChange}
              timeLimit={config.timeLimit ?? 15}
              onTimeLimitChange={handleTimeLimitChange}
              secondsLabel="Time"
            />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={() => setShowFilters(true)}
                sx={{
                  borderColor: "var(--accent)",
                  color: "var(--foreground)",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    borderColor: "var(--accent)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Filters
              </Button>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Button
                variant="contained"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={() => setShowFilters(false)}
                sx={{
                  backgroundColor: "var(--accent)",
                  color: "#000",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "var(--accent)",
                    filter: "brightness(1.1)",
                  },
                }}
              >
                Ready
              </Button>
            </Box>

            <SingerTypeToggle />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <RecognitionSelector
              selectedTiers={config.recognitionTiers || [1]}
              onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
              compact
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <StylesSelector
              availableStyles={primaryStyles}
              selectedStyles={config.styles || {}}
              onChange={handleStylesChange}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <PeriodsSelector
              selectedPeriods={config.periods || []}
              onChange={(val) => updateConfig("periods", val)}
            />

            {/* Validation Message */}
            {!isConfigValid && validationMessage && (
              <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
                {validationMessage}
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

ConfigTab.propTypes = {
  onConfigValid: PropTypes.func,
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  isLandscape: PropTypes.bool,
};
