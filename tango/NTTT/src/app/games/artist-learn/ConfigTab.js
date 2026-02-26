"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Autocomplete, TextField } from "@mui/material";
import styles from "../styles.module.css";

import GameSetupDials from "@/components/ui/GameSetupDials";
import PeriodsSelector from "@/components/ui/PeriodsSelector";
import StylesSelector from "@/components/ui/StylesSelector";
import { useGameContext } from "@/contexts/GameContext";

export default function ConfigTab({ onConfigValid }) {
  const { config, updateConfig } = useGameContext();

  // Local state for orchestra selector
  const [selectedOrchestra, setSelectedOrchestra] = useState(null);
  const [orchestraOptions, setOrchestraOptions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box className={styles.configurationContainer}>
      {/* Era - single select */}
      <PeriodsSelector
        selectedPeriods={config.periods || ["Golden Age"]}
        onChange={handlePeriodsChange}
        singleSelect={true}
        label="Era (select one)"
      />

      {/* Style - single select, no vocals */}
      <StylesSelector
        selectedStyles={config.styles || { Tango: true }}
        onChange={handleStylesChange}
        singleSelect={true}
        showVocals={false}
      />

      {/* Orchestra selector - type-ahead */}
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

      {/* Dial Controls */}
      <GameSetupDials
        numSongs={config.numSongs ?? 10}
        onNumSongsChange={handleNumSongsChange}
        timeLimit={config.timeLimit ?? 15}
        onTimeLimitChange={handleTimeLimitChange}
        secondsLabel="Time"
      />

      {/* Info */}
      <Box sx={{ mt: 1, px: 2 }}>
        <Typography variant="caption" sx={{ color: "gray", textAlign: "center", display: "block" }}>
          Instrumental only • {orchestraOptions.length} orchestras available
        </Typography>
      </Box>
    </Box>
  );
}
