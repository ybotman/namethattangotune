"use client";

import { useRef, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";

/**
 * Manages WaveSurfer instance for audio playback.
 */
export default function useWaveSurfer({ onSongEnd }) {
  const waveSurferRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const onErrorRef = useRef(null);

  // 1) Init
  const initWaveSurfer = useCallback(() => {
    if (waveSurferRef.current) {
      console.warn("WaveSurfer is already initialized.");
      return;
    }
    waveSurferRef.current = WaveSurfer.create({
      container: document.createElement("div"),
      waveColor: "transparent",
      progressColor: "transparent",
      barWidth: 0,
      height: 0,
      backend: "WebAudio",
    });
    waveSurferRef.current.on("finish", () => {
      if (onSongEnd) onSongEnd();
    });
    waveSurferRef.current.on("error", (err) => {
      if (err?.name === "AbortError") {
        console.info("WaveSurfer fetch aborted - ignoring...");
        return;
      }
      console.error("WaveSurfer error:", err);
      // Call the error callback if set
      if (onErrorRef.current) {
        onErrorRef.current(err);
        onErrorRef.current = null;
      } else if (onSongEnd) {
        onSongEnd();
      }
    });
  }, [onSongEnd]);

  // 2) Cleanup
  const cleanupWaveSurfer = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (waveSurferRef.current) {
      const ws = waveSurferRef.current;
      waveSurferRef.current = null; // Clear ref first to prevent re-entry

      // Remove all event listeners first to prevent callbacks
      try {
        ws.unAll();
      } catch (e) {
        // Ignore
      }

      // Use setTimeout to let any in-flight operations settle
      setTimeout(() => {
        try {
          // Check if WaveSurfer is still valid before cleanup
          if (ws && !ws.isDestroyed) {
            try { ws.pause(); } catch (e) { /* ignore */ }
            try { ws.stop(); } catch (e) { /* ignore */ }
            // Call destroy and ignore the returned promise - don't await
            // This prevents AbortError from propagating as unhandled rejection
            const destroyPromise = ws.destroy();
            if (destroyPromise && destroyPromise.catch) {
              destroyPromise.catch(() => {});
            }
          }
        } catch (err) {
          // Ignore all cleanup errors - AbortError is common and expected
          // when destroying while a fetch is in progress
        }
      }, 0);
    }
    // Clear error callback
    onErrorRef.current = null;
  }, []);

  // 3) Load
  const loadSong = useCallback((songUrl, onReady, onError) => {
    if (!waveSurferRef.current) {
      console.error("WaveSurfer is not initialized.");
      if (onError) onError(new Error("WaveSurfer not initialized"));
      return;
    }

    // Store error callback for global error handler
    onErrorRef.current = onError;

    waveSurferRef.current.once("ready", () => {
      onErrorRef.current = null; // Clear on success
      if (onReady) onReady();
    });

    try {
      waveSurferRef.current.load(songUrl);
    } catch (err) {
      console.error("WaveSurfer load exception:", err);
      if (onError) onError(err);
    }
  }, []);

  // 4) Fade
  const fadeVolume = useCallback((fromVol, toVol, durationSec, callback) => {
    if (!waveSurferRef.current) {
      console.error("WaveSurfer is not initialized.");
      return;
    }
    const steps = 15;
    const stepTime = (durationSec * 1000) / steps;
    let currentStep = 0;
    const volumeStep = (toVol - fromVol) / steps;
    let currentVol = fromVol;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      currentVol += volumeStep;
      waveSurferRef.current.setVolume(Math.max(0, Math.min(currentVol, 1)));
      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        if (callback) callback();
      }
    }, stepTime);
  }, []);

  // 5) Play snippet => start at specific position or random
  const playSnippet = useCallback(
    (
      songUrl,
      {
        snippetStart = null,     // Specific start time in seconds (e.g., vocal segment)
        snippetMaxStart = 90,    // Max random start if snippetStart not provided
        snippetDuration = null,  // Duration of clip (fades are ADDED to this, not subtracted)
        fadeDurationSec = 0.5,   // Fade in/out duration (added to both sides)
        onPlaySuccess,
        onPlayError,
      },
    ) => {
      if (!waveSurferRef.current) {
        console.error("WaveSurfer is not initialized. Call initWaveSurfer().");
        return;
      }
      loadSong(songUrl, () => {
        const ws = waveSurferRef.current;
        if (!ws) return;

        const dur = ws.getDuration();

        // Use specific start position if provided, otherwise random
        let startTime;
        if (snippetStart !== null && snippetStart >= 0) {
          startTime = Math.min(snippetStart, dur - 1);
          console.log(`Playing from vocal segment at ${startTime.toFixed(1)}s`);
        } else {
          startTime = Math.floor(Math.random() * Math.min(snippetMaxStart, dur - 1));
          console.log(`Playing from random position at ${startTime.toFixed(1)}s`);
        }

        ws.seekTo(startTime / dur);

        // play => fade in
        ws.play()
          .then(() => {
            ws.setVolume(0);
            fadeVolume(0, 1, fadeDurationSec, () => {
              if (onPlaySuccess) onPlaySuccess();

              // If snippetDuration specified, schedule fade-out and stop
              if (snippetDuration && snippetDuration > 0) {
                // Wait for clip duration, then fade out
                setTimeout(() => {
                  if (waveSurferRef.current) {
                    fadeVolume(1, 0, fadeDurationSec, () => {
                      // Stop after fade out completes
                      if (waveSurferRef.current) {
                        waveSurferRef.current.pause();
                      }
                    });
                  }
                }, snippetDuration * 1000);
              }
            });
          })
          .catch((err) => {
            console.error("WaveSurfer play error:", err);
            if (onPlayError) onPlayError(err);
          });
      });
    },
    [loadSong, fadeVolume],
  );

  return {
    waveSurferRef,
    initWaveSurfer,
    cleanupWaveSurfer,
    loadSong,
    fadeVolume,
    playSnippet,
  };
}
