"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { motion, AnimatePresence } from "motion/react";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import RecognitionSelector from "@/components/ui/RecognitionSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import { useGameContext } from "@/contexts/GameContext";
import PropTypes from "prop-types";

const PRIMARY_STYLES = [
  { style: "Tango" },
  { style: "Vals" },
  { style: "Milonga" },
];

export default function ConfigTab({ showFilters, setShowFilters, isLandscape = false }) {
  const { config, updateConfig } = useGameContext();
  const [availableCount, setAvailableCount] = useState(null);
  const [isConfigValid, setIsConfigValid] = useState(true);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    setIsConfigValid(hasEnoughSongs);
  }, [hasEnoughSongs]);

  const handleIncludeSingerChange = (val) => updateConfig("includeSinger", val);

  // LANDSCAPE: Show everything, no animation, evenly distributed
  if (isLandscape) {
    const dividerStyle = { borderColor: "rgba(255,255,255,0.15)", my: 1 };

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
        <Box sx={{ textAlign: "center", px: 2 }}>
          <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.6 }}>
            Guess the year - within 3 years = 1 point
          </Typography>
        </Box>

        <GameSetupDials
          numSongs={config.numSongs ?? 10}
          onNumSongsChange={(val) => updateConfig("numSongs", val)}
          timeLimit={config.timeLimit ?? 15}
          onTimeLimitChange={(val) => updateConfig("timeLimit", val)}
          secondsLabel="Time"
        />

        <Divider sx={dividerStyle} />

        <RecognitionSelector
          selectedTiers={config.recognitionTiers || [1]}
          onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
          compact
        />

        <Divider sx={dividerStyle} />

        <StylesSelector
          availableStyles={PRIMARY_STYLES}
          selectedStyles={config.styles || { Tango: true }}
          onChange={(val) => updateConfig("styles", val)}
          showVocals={true}
          includeSinger={config.includeSinger ?? true}
          onVocalsChange={handleIncludeSingerChange}
        />

        {!isConfigValid && (
          <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
            Not enough songs (need {numSongs}, have {availableCount})
          </Box>
        )}
      </Box>
    );
  }

  // PORTRAIT: Animated toggle between quick and levels
  return (
    <Box className={styles.configurationContainer} sx={{ overflow: "hidden", py: 1 }}>
      <Box sx={{ textAlign: "center", mb: 1, px: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--foreground)", opacity: 0.6 }}>
          Guess the year - within 3 years = 1 point
        </Typography>
      </Box>

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
              onNumSongsChange={(val) => updateConfig("numSongs", val)}
              timeLimit={config.timeLimit ?? 15}
              onTimeLimitChange={(val) => updateConfig("timeLimit", val)}
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
                Levels
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

            <RecognitionSelector
              selectedTiers={config.recognitionTiers || [1]}
              onChange={(tiers) => updateConfig("recognitionTiers", tiers)}
              compact
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <StylesSelector
              availableStyles={PRIMARY_STYLES}
              selectedStyles={config.styles || { Tango: true }}
              onChange={(val) => updateConfig("styles", val)}
              showVocals={true}
              includeSinger={config.includeSinger ?? true}
              onVocalsChange={handleIncludeSingerChange}
            />

            {!isConfigValid && (
              <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
                Not enough songs (need {numSongs}, have {availableCount})
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

ConfigTab.propTypes = {
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  isLandscape: PropTypes.bool,
};
