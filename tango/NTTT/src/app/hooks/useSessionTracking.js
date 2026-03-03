// ------------------------------------------------------------
// src/hooks/useSessionTracking.js
// Hook to save game session results to Firestore
// ------------------------------------------------------------

"use client";

import { useEffect, useRef, useContext, useCallback } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";
import { saveSessionResults } from "@/utils/userStatsService";

/**
 * Hook to track and save game session results to Firestore
 *
 * @param {Object} options - Hook options
 * @param {string} options.gameType - Game identifier (e.g., 'orchestra-quiz')
 * @param {Object} options.config - Game configuration
 * @param {boolean} options.showFinalSummary - Whether session is complete
 * @param {Array} options.roundStats - Array of round results
 * @param {number} options.sessionScore - Total session score
 * @returns {Object} - { isSaving, saveError, saveSession }
 */
export default function useSessionTracking({
  gameType,
  config,
  showFinalSummary,
  roundStats,
  sessionScore,
}) {
  const { user } = useContext(AuthContext);
  const { refreshStats } = useContext(UserContext);
  const hasSavedRef = useRef(false);
  const isSavingRef = useRef(false);

  // Determine the primary grid cell from config
  // Returns the cell key string (e.g., "Icons-Famous") which getGridKey will use directly
  const getGridCell = useCallback(() => {
    // For orchestra games, use gridCells array (contains strings like "Icons-Famous")
    if (config?.gridCells?.length > 0) {
      return config.gridCells[0];
    }
    // For singer games, use singerGridCells array
    if (config?.singerGridCells?.length > 0) {
      return config.singerGridCells[0];
    }
    // Fallback for old config format
    return null;
  }, [config]);

  // Save session when complete
  useEffect(() => {
    async function saveSession() {
      // Only save once per session
      if (hasSavedRef.current || isSavingRef.current) return;

      // Must have a logged-in user and completed session
      if (!user || !showFinalSummary || roundStats.length === 0) return;

      isSavingRef.current = true;

      try {
        // Count correct answers
        const correctCount = roundStats.filter((r) => r.correct !== false).length;
        const totalQuestions = roundStats.length;
        const gridCell = getGridCell();

        // Map roundStats to the format expected by saveSessionResults
        const results = roundStats.map((r, idx) => ({
          songId: r.songId || null,
          correct: r.correct !== false, // If not explicitly false, assume correct (for backward compat)
          timeUsed: r.timeUsed || 0,
          score: r.score || 0,
          // Enhanced per-entity analytics data
          correctOrchestra: r.correctOrchestra || null,
          userGuess: r.userGuess || null,
          correctSinger: r.correctSinger || null,
          userGuessSinger: r.userGuessSinger || null,
        }));

        await saveSessionResults({
          gameType,
          gridCell,
          config,
          results,
          totalScore: sessionScore,
          correctCount,
          totalQuestions,
        });

        hasSavedRef.current = true;

        // Refresh user stats to reflect the new session
        if (refreshStats) {
          await refreshStats();
        }
      } catch (error) {
        console.error("Error saving session:", error);
      } finally {
        isSavingRef.current = false;
      }
    }

    saveSession();
  }, [
    user,
    showFinalSummary,
    roundStats,
    sessionScore,
    gameType,
    config,
    getGridCell,
    refreshStats,
  ]);

  // Reset hasSaved when starting a new session (roundStats resets to empty)
  useEffect(() => {
    if (roundStats.length === 0) {
      hasSavedRef.current = false;
    }
  }, [roundStats.length]);

  // Manual save function (for visibility change fallback)
  const saveSession = useCallback(async () => {
    if (hasSavedRef.current || isSavingRef.current || !user) return false;
    if (roundStats.length === 0) return false;

    isSavingRef.current = true;

    try {
      const correctCount = roundStats.filter((r) => r.correct !== false).length;
      const totalQuestions = roundStats.length;
      const gridCell = getGridCell();

      const results = roundStats.map((r) => ({
        songId: r.songId || null,
        correct: r.correct !== false,
        timeUsed: r.timeUsed || 0,
        score: r.score || 0,
        // Enhanced per-entity analytics data
        correctOrchestra: r.correctOrchestra || null,
        userGuess: r.userGuess || null,
        correctSinger: r.correctSinger || null,
        userGuessSinger: r.userGuessSinger || null,
      }));

      await saveSessionResults({
        gameType,
        gridCell,
        config,
        results,
        totalScore: sessionScore,
        correctCount,
        totalQuestions,
      });

      hasSavedRef.current = true;
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [user, roundStats, sessionScore, gameType, config, getGridCell]);

  return {
    saveSession,
    hasSaved: hasSavedRef.current,
  };
}
