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

  // Unlock audio on iOS - creates and plays silent buffer to bypass silent switch
  const unlockAudioRef = useRef(false);

  const unlockIOSAudio = useCallback(async () => {
    if (unlockAudioRef.current) return;

    try {
      // Create a short silent audio and play it
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Resume if suspended
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Create and play a silent buffer
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      unlockAudioRef.current = true;
    } catch (e) {
      // iOS audio unlock failed - continue anyway
    }
  }, []);

  // Resume AudioContext on iOS (must be called from user gesture)
  const resumeAudioContext = useCallback(async () => {
    // First unlock iOS audio
    await unlockIOSAudio();

    if (waveSurferRef.current) {
      const backend = waveSurferRef.current.getMediaElement?.() ||
                      waveSurferRef.current.backend?.ac;
      if (backend?.context?.state === "suspended") {
        try {
          await backend.context.resume();
        } catch (e) {
          // Could not resume AudioContext
        }
      }
    }
  }, [unlockIOSAudio]);

  // 1) Init
  const initWaveSurfer = useCallback(() => {
    if (waveSurferRef.current) return;
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
      if (err?.name === "AbortError") return;
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

      // Synchronously attempt cleanup (setTimeout can race with React unmount)
      try {
        if (ws) {
          try { ws.pause(); } catch (e) { /* ignore */ }
          try { ws.stop(); } catch (e) { /* ignore */ }
          // Call destroy and suppress any errors
          // Use Promise.resolve to handle both sync and async cases
          Promise.resolve()
            .then(() => ws.destroy())
            .catch(() => {
              // AbortError is expected when destroying during fetch
            });
        }
      } catch (err) {
        // Ignore all cleanup errors - AbortError is common and expected
        // when destroying while a fetch is in progress
      }
    }
    // Clear error callback
    onErrorRef.current = null;
  }, []);

  // 3) Load
  const loadSong = useCallback((songUrl, onReady, onError) => {
    if (!waveSurferRef.current) {
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
      if (onError) onError(err);
    }
  }, []);

  // 4) Fade
  const fadeVolume = useCallback((fromVol, toVol, durationSec, callback) => {
    if (!waveSurferRef.current) return;
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
        if (onPlayError) onPlayError(new Error("WaveSurfer not initialized"));
        return;
      }

      loadSong(songUrl, () => {
        const ws = waveSurferRef.current;
        if (!ws) {
          if (onPlayError) onPlayError(new Error("WaveSurfer gone"));
          return;
        }

        const dur = ws.getDuration();

        // Use specific start position if provided, otherwise random
        let startTime;
        if (snippetStart !== null && snippetStart >= 0) {
          startTime = Math.min(snippetStart, dur - 1);
        } else {
          startTime = Math.floor(Math.random() * Math.min(snippetMaxStart, dur - 1));
        }

        // iOS PWA fix: play() first to preserve user gesture, then seek
        ws.setVolume(0); // Start silent for seek
        ws.play()
          .then(() => {
            ws.seekTo(startTime / dur);

            // Start timer immediately when play resolves
            if (onPlaySuccess) onPlaySuccess();

            fadeVolume(0, 1, fadeDurationSec, () => {
              // Fade complete - cosmetic only

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
