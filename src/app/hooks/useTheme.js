// src/hooks/useTheme.js
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";

// 1) Create the actual ThemeContext
export const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

// 2) The custom hook that uses ThemeContext
export function useTheme() {
  return useContext(ThemeContext);
}

// 3) Theme provider that syncs CSS variables with MUI
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Default to dark
  const [mounted, setMounted] = useState(false);

  // Always use dark theme
  useEffect(() => {
    setMounted(true);
    setTheme("dark");
  }, []);

  // Apply the theme to <html data-theme="..."> and persist
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("nttt-theme", theme);
    }
  }, [theme, mounted]);

  // The toggler
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Create MUI theme that matches our CSS variables
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          ...(theme === "dark"
            ? {
                // Dark mode palette
                primary: { main: "#66aaff" },
                secondary: { main: "#bbd4de" },
                background: {
                  default: "#000517",
                  paper: "#0a0a1a",
                },
                text: {
                  primary: "#bbd4de",
                  secondary: "#999999",
                },
                divider: "#444",
              }
            : {
                // Light mode palette
                primary: { main: "#007bff" },
                secondary: { main: "#1b005a" },
                background: {
                  default: "#ffffff",
                  paper: "#f5f5f5",
                },
                text: {
                  primary: "#1b005a",
                  secondary: "#666666",
                },
                divider: "#ccc",
              }),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: theme === "dark" ? "#000517" : "#ffffff",
                color: theme === "dark" ? "#bbd4de" : "#1b005a",
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                color: "inherit",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [theme]
  );

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
