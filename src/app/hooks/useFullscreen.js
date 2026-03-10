"use client";

import { useState, useCallback, useEffect } from "react";

export default function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check fullscreen state on mount and changes
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen(); // Safari
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen(); // Safari
      }
    } catch (err) {
      console.error("Exit fullscreen error:", err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}

// Standalone function for use outside of React components
export const enterFullscreenNow = async () => {
  try {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen();
    }
  } catch (err) {
    console.log("Fullscreen not available:", err.message);
  }
};

// Back button trap - prevents accidental navigation during gameplay
let backTrapActive = false;

export const enableBackTrap = () => {
  if (backTrapActive) return;
  backTrapActive = true;

  // Push a state to trap the back button
  history.pushState({ gameActive: true }, "", location.href);

  window.addEventListener("popstate", handlePopState);
};

export const disableBackTrap = () => {
  if (!backTrapActive) return;
  backTrapActive = false;

  window.removeEventListener("popstate", handlePopState);
};

const handlePopState = (event) => {
  if (backTrapActive) {
    // Re-push state to keep user in game
    history.pushState({ gameActive: true }, "", location.href);
  }
};

// Combined function for game start
export const enterGameMode = async () => {
  enterFullscreenNow();
  enableBackTrap();
};

// Combined function for game end
export const exitGameMode = () => {
  disableBackTrap();
  // Don't auto-exit fullscreen - let user control that
};
