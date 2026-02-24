// src/components/ui/SingersSelector.js

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Autocomplete, TextField } from "@mui/material";

export default function SingersSelector({
  label,
  availableSingers,
  selectedSingers,
  onChange,
  disabled,
  placeholder,
}) {
  const handleChange = (event, newValue) => {
    if (onChange) onChange(newValue);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Autocomplete
        multiple
        options={availableSingers}
        value={selectedSingers}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        onChange={handleChange}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={placeholder || "Select Singers"}
            placeholder={placeholder}
          />
        )}
      />
    </Box>
  );
}

SingersSelector.propTypes = {
  label: PropTypes.string,
  availableSingers: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
  selectedSingers: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

SingersSelector.defaultProps = {
  label: "Select Singers:",
  availableSingers: [],
  selectedSingers: [],
  disabled: false,
  placeholder: "Singers",
};
