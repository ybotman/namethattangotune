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
      setTimeout(async () => {
        try {
          // Check if WaveSurfer is still valid before cleanup
          if (ws && !ws.isDestroyed) {
            ws.pause();
            ws.stop();
            await Promise.resolve(ws.destroy()).catch(() => {});
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

  // 5) Play snippet => random start + fade in
  const playSnippet = useCallback(
    (
      songUrl,
      {
        snippetMaxStart = 90,
        fadeDurationSec = 1.0,
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

        // random snippet
        const dur = ws.getDuration();
        const randomStart = Math.floor(Math.random() * snippetMaxStart);
        ws.seekTo(Math.min(randomStart, dur - 1) / dur);

        // play => fade in
        ws.play()
          .then(() => {
            ws.setVolume(0);
            fadeVolume(0, 1, fadeDurationSec, () => {
              if (onPlaySuccess) onPlaySuccess();
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
