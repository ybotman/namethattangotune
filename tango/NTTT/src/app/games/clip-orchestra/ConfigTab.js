"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Divider } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { motion, AnimatePresence } from "motion/react";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import OrchestraLevelSelector from "@/components/ui/OrchestraLevelSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import ClipScorePotential from "@/components/ui/ClipScorePotential";
import useClipQuiz from "@/hooks/useClipQuiz";
import { useGameContext } from "@/contexts/GameContext";
import PropTypes from "prop-types";

export default function ConfigTab({ showFilters, setShowFilters, isLandscape = false }) {
  const {
    primaryStyles,
    validationMessage,
    handleNumSongsChange,
    handleClipLengthChange,
    handleOrchestraTiersChange,
    handleStylesChange,
    handleIncludeSingerChange,
  } = useClipQuiz();

  const { config, updateConfig } = useGameContext();

  const [isConfigValid, setIsConfigValid] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const numSongs = config.numSongs ?? 10;
  const hasEnoughSongs = availableCount === null || availableCount >= numSongs;

  useEffect(() => {
    setIsConfigValid(!validationMessage && hasEnoughSongs);
  }, [validationMessage, hasEnoughSongs]);

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
        <GameSetupDials
          numSongs={config.numSongs ?? 10}
          onNumSongsChange={handleNumSongsChange}
          showSeconds={false}
          showClipLength
          clipLength={config.clipLength ?? 5}
          onClipLengthChange={handleClipLengthChange}
        />

        <Divider sx={dividerStyle} />

        <OrchestraLevelSelector
          selectedTiers={config.orchestraTiers || ["Big4"]}
          onChange={handleOrchestraTiersChange}
          compact
        />

        <Divider sx={dividerStyle} />

        <StylesSelector
          availableStyles={primaryStyles}
          selectedStyles={config.styles || {}}
          onChange={handleStylesChange}
          showVocals={true}
          includeSinger={config.includeSinger ?? false}
          onVocalsChange={handleIncludeSingerChange}
        />

        <Divider sx={dividerStyle} />

        <PeriodsSelector
          selectedPeriods={config.periods || []}
          onChange={(val) => updateConfig("periods", val)}
        />

        {!isConfigValid && (
          <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
            {validationMessage || `Not enough songs (need ${numSongs}, have ${availableCount})`}
          </Box>
        )}
      </Box>
    );
  }

  // PORTRAIT: Animated toggle between quick and levels
  return (
    <Box className={styles.configurationContainer} sx={{ overflow: "hidden", py: 1 }}>
      <ClipScorePotential config={config} />

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
              showSeconds={false}
              showClipLength
              clipLength={config.clipLength ?? 5}
              onClipLengthChange={handleClipLengthChange}
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

            <OrchestraLevelSelector
              selectedTiers={config.orchestraTiers || ["Big4"]}
              onChange={handleOrchestraTiersChange}
              compact
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <StylesSelector
              availableStyles={primaryStyles}
              selectedStyles={config.styles || {}}
              onChange={handleStylesChange}
              showVocals={true}
              includeSinger={config.includeSinger ?? false}
              onVocalsChange={handleIncludeSingerChange}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <PeriodsSelector
              selectedPeriods={config.periods || []}
              onChange={(val) => updateConfig("periods", val)}
            />

            {!isConfigValid && (
              <Box sx={{ color: "red", mt: 2, textAlign: "center", fontSize: "0.85rem" }}>
                {validationMessage || `Not enough songs (need ${numSongs}, have ${availableCount})`}
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
