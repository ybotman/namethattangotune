"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Autocomplete, TextField, ToggleButton, ToggleButtonGroup, Button, Divider } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { motion, AnimatePresence } from "motion/react";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import { useGameContext } from "@/contexts/GameContext";
import PropTypes from "prop-types";

export default function ConfigTab({ onConfigValid, showFilters, setShowFilters, isLandscape = false }) {
  const { config, updateConfig } = useGameContext();

  // Local state for orchestra selector
  const [selectedOrchestra, setSelectedOrchestra] = useState(null);
  const [orchestraOptions, setOrchestraOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize defaults for this game (Golden Age only, Tango only, D'Arienzo default)
  useEffect(() => {
    if (!initialized) {
      updateConfig("periods", ["Golden Age"]);
      updateConfig("styles", { Tango: true });
      setInitialized(true);
    }
  }, [initialized, updateConfig]);

  // Set default orchestra to D'Arienzo once options are loaded
  useEffect(() => {
    if (!loading && orchestraOptions.length > 0 && !selectedOrchestra) {
      const darienzo = orchestraOptions.find(o => o.name === "Juan D'Arienzo");
      if (darienzo) {
        setSelectedOrchestra(darienzo);
      }
    }
  }, [loading, orchestraOptions, selectedOrchestra]);

  // Get selected era and style from config
  const selectedEra = (config.periods || ["Golden Age"])[0] || "Golden Age";
  const selectedStyle = Object.keys(config.styles || { Tango: true }).find(k => config.styles[k]) || "Tango";

  // Fetch orchestras filtered by era and style
  useEffect(() => {
    const fetchFilteredOrchestras = async () => {
      setLoading(true);
      try {
        const [songsData, periodsData] = await Promise.all([
          fetch("/songData/djSongsWeighted.json").then((r) => r.json()),
          fetch("/songData/TangoPeriods.json").then((r) => r.json()),
        ]);

        // Get year range for selected era
        const era = periodsData.find((p) => p.period === selectedEra);
        const [startYear, endYear] = era ? [era.start_year, era.end_year] : [1935, 1955];

        // Filter songs by era, style, and instrumental only
        const filteredSongs = songsData.songs.filter((song) => {
          if (song.doNotPlay) return false;
          const year = parseInt(song.Year, 10);
          if (isNaN(year) || year < startYear || year > endYear) return false;
          if (song.Style?.toLowerCase() !== selectedStyle.toLowerCase()) return false;
          // Instrumental only - exclude songs with singers
          if (song.Singer && song.Singer.trim() !== "") return false;
          if (!song.ArtistMaster || song.ArtistMaster.trim() === "") return false;
          return true;
        });

        // Get unique orchestras with song counts
        const orchestraCounts = {};
        filteredSongs.forEach((song) => {
          const orch = song.ArtistMaster.trim();
          orchestraCounts[orch] = (orchestraCounts[orch] || 0) + 1;
        });

        // Convert to array and sort by count (most songs first)
        const orchestras = Object.entries(orchestraCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setOrchestraOptions(orchestras);

        // Clear selection if current orchestra not in new list
        if (selectedOrchestra && !orchestras.find((o) => o.name === selectedOrchestra.name)) {
          setSelectedOrchestra(null);
        }
      } catch (err) {
        console.error("Error fetching orchestras:", err);
      }
      setLoading(false);
    };

    fetchFilteredOrchestras();
  }, [selectedEra, selectedStyle]);

  // Update config when orchestra changes
  useEffect(() => {
    updateConfig("selectedOrchestra", selectedOrchestra?.name || null);
    updateConfig("includeSinger", false); // Always instrumental

    // Notify parent if config is valid
    if (onConfigValid) {
      onConfigValid(!!selectedOrchestra);
    }
  }, [selectedOrchestra, updateConfig, onConfigValid]);

  const handleNumSongsChange = (value) => updateConfig("numSongs", value);
  const handleTimeLimitChange = (value) => updateConfig("timeLimit", value);

  const handlePeriodsChange = (periods) => {
    updateConfig("periods", periods);
    // Clear orchestra when era changes
    setSelectedOrchestra(null);
  };

  const handleStylesChange = (styles) => {
    updateConfig("styles", styles);
    // Clear orchestra when style changes
    setSelectedOrchestra(null);
  };

  // Orchestra selector component (reused in both layouts)
  const OrchestraSelector = () => (
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
        }}
      >
        Orchestra (required)
      </Typography>
      <Autocomplete
        options={orchestraOptions}
        getOptionLabel={(option) => `${option.name} (${option.count} songs)`}
        value={selectedOrchestra}
        onChange={(e, newValue) => setSelectedOrchestra(newValue)}
        loading={loading}
        isOptionEqualToValue={(option, value) => option.name === value?.name}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={loading ? "Loading..." : "Type to search orchestras..."}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--foreground)",
                backgroundColor: "var(--input-bg)",
                "& fieldset": {
                  borderColor: selectedOrchestra ? "var(--accent)" : "#666",
                  borderWidth: selectedOrchestra ? 2 : 1,
                },
                "&:hover fieldset": { borderColor: "var(--accent)" },
                "&.Mui-focused fieldset": { borderColor: "var(--accent)" },
              },
              "& .MuiInputBase-input": { color: "var(--foreground)" },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.name}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Typography>{option.name}</Typography>
              <Typography sx={{ color: "gray", ml: 2 }}>{option.count} songs</Typography>
            </Box>
          </li>
        )}
        sx={{
          "& .MuiAutocomplete-paper": {
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          },
        }}
      />
      {!selectedOrchestra && (
        <Typography variant="caption" sx={{ color: "#FF9800", display: "block", textAlign: "center", mt: 0.5 }}>
          Select an orchestra to start
        </Typography>
      )}
    </Box>
  );

  // Sort Order Toggle component
  const SortOrderToggle = () => (
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
        Song Order
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={config.sortByYear ? "year" : "random"}
          exclusive
          onChange={(e, val) => val && updateConfig("sortByYear", val === "year")}
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
          <ToggleButton value="random">Random</ToggleButton>
          <ToggleButton value="year">By Year</ToggleButton>
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
        <GameSetupDials
          numSongs={config.numSongs ?? 10}
          onNumSongsChange={handleNumSongsChange}
          timeLimit={config.timeLimit ?? 15}
          onTimeLimitChange={handleTimeLimitChange}
          secondsLabel="Time"
        />

        <Divider sx={dividerStyle} />

        <PeriodsSelector
          selectedPeriods={config.periods || ["Golden Age"]}
          onChange={handlePeriodsChange}
          singleSelect={true}
          label="Era (select one)"
        />

        <Divider sx={dividerStyle} />

        <StylesSelector
          selectedStyles={config.styles || { Tango: true }}
          onChange={handleStylesChange}
          singleSelect={true}
          showVocals={false}
        />

        <Divider sx={dividerStyle} />

        <OrchestraSelector />

        <Divider sx={dividerStyle} />

        <SortOrderToggle />

        {/* Info */}
        <Box sx={{ px: 2 }}>
          <Typography variant="caption" sx={{ color: "gray", textAlign: "center", display: "block" }}>
            Instrumental only
          </Typography>
        </Box>
      </Box>
    );
  }

  // PORTRAIT: Animated toggle between quick and filters
  return (
    <Box className={styles.configurationContainer} sx={{ overflow: "hidden", py: 1 }}>
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

            <OrchestraSelector />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <PeriodsSelector
              selectedPeriods={config.periods || ["Golden Age"]}
              onChange={handlePeriodsChange}
              singleSelect={true}
              label="Era (select one)"
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <StylesSelector
              selectedStyles={config.styles || { Tango: true }}
              onChange={handleStylesChange}
              singleSelect={true}
              showVocals={false}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />

            <SortOrderToggle />

            {/* Info */}
            <Box sx={{ mt: 1, px: 2 }}>
              <Typography variant="caption" sx={{ color: "gray", textAlign: "center", display: "block" }}>
                Instrumental only • {orchestraOptions.length} orchestras available
              </Typography>
            </Box>
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
