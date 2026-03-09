"use client";
//------------------------------------------------------------
// src/app/components/DebugOverlay.js
// Debug overlay for mobile debugging (enabled via Settings)
// Shows last N log messages on screen
//------------------------------------------------------------
import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BugReportIcon from "@mui/icons-material/BugReport";

// Check if debug mode is enabled in settings (default ON for now)
function isDebugEnabled() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("nttt_debugMode");
  // Default to true if not set
  return stored === null || stored === "true";
}

// Global log storage
const MAX_LOGS = 20;
let logMessages = [];
let logListeners = [];

// Override console methods to capture logs
if (typeof window !== "undefined") {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const addLog = (type, ...args) => {
    const message = args.map(a =>
      typeof a === "object" ? JSON.stringify(a, null, 2).slice(0, 200) : String(a)
    ).join(" ");

    const entry = {
      time: new Date().toLocaleTimeString(),
      type,
      message: message.slice(0, 300),
    };

    logMessages = [...logMessages.slice(-(MAX_LOGS - 1)), entry];
    logListeners.forEach(fn => fn(logMessages));
  };

  console.log = (...args) => {
    originalLog(...args);
    addLog("log", ...args);
  };

  console.error = (...args) => {
    originalError(...args);
    addLog("error", ...args);
  };

  console.warn = (...args) => {
    originalWarn(...args);
    addLog("warn", ...args);
  };

  // Capture unhandled errors
  window.addEventListener("error", (e) => {
    addLog("error", `UNHANDLED: ${e.message} at ${e.filename}:${e.lineno}`);
  });

  window.addEventListener("unhandledrejection", (e) => {
    addLog("error", `UNHANDLED PROMISE: ${e.reason}`);
  });
}

export default function DebugOverlay() {
  const [logs, setLogs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if debug mode is enabled
    setDebugEnabled(isDebugEnabled());

    const listener = (newLogs) => setLogs([...newLogs]);
    logListeners.push(listener);
    setLogs([...logMessages]);

    // Auto-show on first error (only if debug enabled)
    const errorListener = (newLogs) => {
      if (isDebugEnabled() && newLogs.some(l => l.type === "error")) {
        setVisible(true);
      }
    };
    logListeners.push(errorListener);

    return () => {
      logListeners = logListeners.filter(l => l !== listener && l !== errorListener);
    };
  }, []);

  // Copy all logs to clipboard
  const copyLogs = async () => {
    const logText = logs.map(l => `${l.time} [${l.type}] ${l.message}`).join("\n");
    try {
      await navigator.clipboard.writeText(logText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy logs:", e);
    }
  };

  // Don't render anything if debug mode is disabled
  if (!debugEnabled) {
    return null;
  }

  if (!visible) {
    return (
      <IconButton
        onClick={() => setVisible(true)}
        sx={{
          position: "fixed",
          bottom: 80,
          left: 8,
          bgcolor: "rgba(255,0,0,0.3)",
          color: "#fff",
          zIndex: 9999,
          width: 36,
          height: 36,
        }}
      >
        <BugReportIcon fontSize="small" />
      </IconButton>
    );
  }

  if (minimized) {
    return (
      <Box
        onClick={() => setMinimized(false)}
        sx={{
          position: "fixed",
          bottom: 80,
          left: 8,
          right: 8,
          bgcolor: "rgba(0,0,0,0.9)",
          color: "#0f0",
          p: 1,
          borderRadius: 1,
          zIndex: 9999,
          fontSize: "0.65rem",
          fontFamily: "monospace",
          cursor: "pointer",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: "0.65rem", color: "#0f0" }}>
            DEBUG: {logs.length} logs ({logs.filter(l => l.type === "error").length} errors) - tap to expand
          </Typography>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setVisible(false); }} sx={{ color: "#888", p: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "50vh",
        bgcolor: "rgba(0,0,0,0.95)",
        color: "#0f0",
        p: 1,
        zIndex: 9999,
        fontSize: "0.6rem",
        fontFamily: "monospace",
        overflow: "auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography sx={{ fontSize: "0.7rem", color: "#fff" }}>DEBUG LOG</Typography>
        <Box>
          <IconButton size="small" onClick={copyLogs} sx={{ color: copied ? "#0f0" : "#888", p: 0.5 }}>
            <Typography sx={{ fontSize: "0.6rem" }}>{copied ? "COPIED!" : "COPY"}</Typography>
          </IconButton>
          <IconButton size="small" onClick={() => setMinimized(true)} sx={{ color: "#888", p: 0.5 }}>
            <Typography sx={{ fontSize: "0.6rem" }}>MIN</Typography>
          </IconButton>
          <IconButton size="small" onClick={() => setVisible(false)} sx={{ color: "#888", p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {logs.slice(-15).reverse().map((log, i) => (
        <Box key={i} sx={{
          color: log.type === "error" ? "#f55" : log.type === "warn" ? "#fa0" : "#0f0",
          borderBottom: "1px solid #333",
          py: 0.25,
          wordBreak: "break-all",
        }}>
          <span style={{ color: "#888" }}>{log.time}</span> [{log.type}] {log.message}
        </Box>
      ))}
    </Box>
  );
}

// Helper to add explicit debug logs
export function debugLog(message, data) {
  console.log(`[DEBUG] ${message}`, data || "");
}
