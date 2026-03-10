"use client";

import React from "react";
import { trackReactError } from "@/utils/analytics";
import { Box, Typography, Button } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Track error to GA4
    trackReactError(error, errorInfo);
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            bgcolor: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: "#f44336" }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7, textAlign: "center", maxWidth: 400 }}>
            The app encountered an error. This has been logged for review.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ bgcolor: "var(--accent)" }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = "/"}
              sx={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              Go Home
            </Button>
          </Box>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <Box sx={{ mt: 4, p: 2, bgcolor: "#1a1a1a", borderRadius: 1, maxWidth: 600, overflow: "auto" }}>
              <Typography variant="caption" component="pre" sx={{ color: "#f44336", fontSize: 10 }}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
