"use client";
//------------------------------------------------------------
// src/app/components/InstallPWA.js
// PWA Install Button with platform-specific instructions
// v2.0.0 - Mobile-aware with iOS/Android detection
//------------------------------------------------------------
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

// Platform detection utilities
function getPlatformInfo() {
  if (typeof window === "undefined") {
    return { isIOS: false, isAndroid: false, isMobile: false, isStandalone: false };
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid || /Mobile|webOS|Opera Mini/i.test(ua);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;

  return { isIOS, isAndroid, isMobile, isStandalone };
}

// Check if user dismissed install prompt permanently
function isDismissedPermanently() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("nttt-pwa-dont-ask") === "true";
}

function setDismissedPermanently(value) {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem("nttt-pwa-dont-ask", "true");
  } else {
    localStorage.removeItem("nttt-pwa-dont-ask");
  }
}

// Main InstallPWA Component
export default function InstallPWA({
  variant = "button", // "button" | "banner" | "modal" | "menuItem"
  showOnlyIfInstallable = true,
  autoShowOnMobile = false, // Auto-show modal on mobile first visit
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [platform, setPlatform] = useState({ isIOS: false, isAndroid: false, isMobile: false, isStandalone: false });
  const [showDialog, setShowDialog] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    const platformInfo = getPlatformInfo();
    setPlatform(platformInfo);

    // Already installed - nothing to do
    if (platformInfo.isStandalone) return;

    // Check permanent dismissal
    if (isDismissedPermanently()) {
      setSessionDismissed(true);
      return;
    }

    // iOS is always "installable" via manual steps
    if (platformInfo.isIOS) {
      setIsInstallable(true);
    }

    // Listen for beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Auto-show modal on mobile first visit
    if (autoShowOnMobile && platformInfo.isMobile) {
      const hasSeenInstallPrompt = sessionStorage.getItem("nttt-seen-install-prompt");
      if (!hasSeenInstallPrompt) {
        // Delay slightly so page loads first
        setTimeout(() => {
          setShowDialog(true);
          sessionStorage.setItem("nttt-seen-install-prompt", "true");
        }, 2000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [autoShowOnMobile]);

  const handleInstallClick = async () => {
    // iOS/iPad - show instructions dialog
    if (platform.isIOS) {
      setShowDialog(true);
      return;
    }

    // Android with native prompt available
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      return;
    }

    // Android without prompt (or other) - show instructions
    setShowDialog(true);
  };

  const handleDismiss = (permanent = false) => {
    setSessionDismissed(true);
    setShowDialog(false);
    if (permanent || dontAskAgain) {
      setDismissedPermanently(true);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    if (dontAskAgain) {
      setDismissedPermanently(true);
      setSessionDismissed(true);
    }
  };

  // Don't render if already installed
  if (platform.isStandalone) return null;

  // Don't render if not installable and required
  if (showOnlyIfInstallable && !isInstallable) return null;

  // Don't render banner if dismissed
  if (variant === "banner" && sessionDismissed) return null;

  // Menu item variant - for swiper menu
  if (variant === "menuItem") {
    return (
      <>
        <Paper
          onClick={handleInstallClick}
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 2,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(212, 175, 55, 0.2)",
              transform: "scale(1.02)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <GetAppIcon sx={{ color: "#D4AF37", fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#D4AF37" }}>
                Install NTTT App
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.8 }}>
                {platform.isIOS ? "Add to Home Screen for quick access" : "Install for offline access"}
              </Typography>
            </Box>
            {platform.isIOS ? (
              <PhoneIphoneIcon sx={{ color: "#888", fontSize: 20 }} />
            ) : (
              <PhoneAndroidIcon sx={{ color: "#888", fontSize: 20 }} />
            )}
          </Box>
        </Paper>
        <InstallDialog
          open={showDialog}
          onClose={handleCloseDialog}
          platform={platform}
          dontAskAgain={dontAskAgain}
          setDontAskAgain={setDontAskAgain}
        />
      </>
    );
  }

  // Banner variant
  if (variant === "banner") {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "rgba(212, 175, 55, 0.15)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 2,
            px: 2,
            py: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GetAppIcon sx={{ color: "#D4AF37" }} />
            <Typography variant="body2" sx={{ color: "#fff" }}>
              Install NTTT for quick access
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleInstallClick}
              sx={{
                bgcolor: "#D4AF37",
                color: "#1a1a2e",
                "&:hover": { bgcolor: "#c9a431" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Install
            </Button>
            <IconButton size="small" onClick={() => handleDismiss(false)} sx={{ color: "#888" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <InstallDialog
          open={showDialog}
          onClose={handleCloseDialog}
          platform={platform}
          dontAskAgain={dontAskAgain}
          setDontAskAgain={setDontAskAgain}
        />
      </>
    );
  }

  // Default button variant
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<GetAppIcon />}
        onClick={handleInstallClick}
        sx={{
          borderColor: "#D4AF37",
          color: "#D4AF37",
          "&:hover": {
            borderColor: "#c9a431",
            bgcolor: "rgba(212, 175, 55, 0.1)",
          },
          textTransform: "none",
        }}
      >
        Install App
      </Button>
      <InstallDialog
        open={showDialog}
        onClose={handleCloseDialog}
        platform={platform}
        dontAskAgain={dontAskAgain}
        setDontAskAgain={setDontAskAgain}
      />
    </>
  );
}

// Platform-specific Install Dialog
function InstallDialog({ open, onClose, platform, dontAskAgain, setDontAskAgain }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1a1a2e",
          color: "#fff",
          borderRadius: 3,
          mx: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {platform.isIOS ? (
            <PhoneIphoneIcon sx={{ color: "#D4AF37" }} />
          ) : (
            <PhoneAndroidIcon sx={{ color: "#D4AF37" }} />
          )}
          <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
            Install NTTT
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#888" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {platform.isIOS ? (
          <IOSInstructions />
        ) : (
          <AndroidInstructions />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              sx={{
                color: "#888",
                "&.Mui-checked": { color: "#D4AF37" },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: "0.8rem", color: "#888" }}>
              Don&apos;t show this again
            </Typography>
          }
          sx={{ alignSelf: "flex-start", m: 0 }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: "#D4AF37",
            color: "#1a1a2e",
            "&:hover": { bgcolor: "#c9a431" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// iOS-specific instructions
function IOSInstructions() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
      <Typography sx={{ fontSize: "0.85rem", color: "#aaa", mb: 1 }}>
        Add NTTT to your home screen for the best experience:
      </Typography>

      {/* Step 1 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <StepNumber>1</StepNumber>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Tap the Share button
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Box
              sx={{
                bgcolor: "#007AFF",
                borderRadius: 1,
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IosShareIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>
              at the bottom of Safari
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Step 2 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <StepNumber>2</StepNumber>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Scroll and tap &quot;Add to Home Screen&quot;
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Box
              sx={{
                bgcolor: "#333",
                borderRadius: 1,
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddBoxOutlinedIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>
              in the share menu
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Step 3 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <StepNumber>3</StepNumber>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Tap &quot;Add&quot; to confirm
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#aaa", mt: 0.5 }}>
            NTTT will appear on your home screen
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Android-specific instructions
function AndroidInstructions() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
      <Typography sx={{ fontSize: "0.85rem", color: "#aaa", mb: 1 }}>
        Install NTTT on your device for quick access:
      </Typography>

      {/* Step 1 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <StepNumber>1</StepNumber>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Tap the menu button
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Box
              sx={{
                bgcolor: "#333",
                borderRadius: 1,
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MoreVertIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>
              in the top-right corner of Chrome
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Step 2 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <StepNumber>2</StepNumber>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Tap &quot;Add to Home screen&quot;
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#aaa", mt: 0.5 }}>
            or &quot;Install app&quot; if shown
          </Typography>
        </Box>
      </Box>

      {/* Step 3 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <StepNumber>3</StepNumber>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Tap &quot;Install&quot; to confirm
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#aaa", mt: 0.5 }}>
            NTTT will be added to your home screen
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Step number circle component
function StepNumber({ children }) {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        bgcolor: "#D4AF37",
        color: "#1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.9rem",
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}
