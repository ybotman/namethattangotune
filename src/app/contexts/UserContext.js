"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContext";
import {
  initializeUserDoc,
  fetchUserStats,
  updateUserPreferences,
  computeGameStatsSummary,
} from "@/utils/userStatsService";

/**
 * UserContext - Syncs user data with Firestore
 *
 * Provides:
 * - User profile (from Firestore)
 * - User preferences (theme, defaults)
 * - Game stats per game type
 * - Methods to update preferences and refresh stats
 */

const defaultUserState = {
  // Loading state
  loading: true,
  error: null,

  // User profile from Firestore
  profile: null,

  // Preferences
  preferences: {
    theme: "dark",
    defaultNumSongs: 10,
    defaultTimeLimit: 15,
  },

  // Game stats (keyed by game type)
  gameStats: {},

  // Computed summaries (with averages calculated)
  gameSummaries: {},

  // Methods
  refreshStats: async () => {},
  updatePreferences: async () => {},
  getGameSummary: () => null,
};

export const UserContext = createContext(defaultUserState);

export function useUserContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [gameSummaries, setGameSummaries] = useState({});

  // Initialize user doc and fetch stats when user changes
  useEffect(() => {
    async function initAndFetch() {
      if (!user) {
        // User logged out
        setUserData(null);
        setGameSummaries({});
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Initialize user doc (creates if first login, updates lastLoginAt)
        await initializeUserDoc(user);

        // Fetch user stats
        const stats = await fetchUserStats(user.uid);
        setUserData(stats);

        // Compute summaries for each game type
        if (stats?.gameStats) {
          const summaries = {};
          for (const [gameType, gameData] of Object.entries(stats.gameStats)) {
            summaries[gameType] = computeGameStatsSummary(gameData);
          }
          setGameSummaries(summaries);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        // Don't block the app on permission errors - just skip user stats
        // This can happen with stale PWA auth tokens
        if (err?.code === "permission-denied") {
          console.warn("Firestore permission denied - continuing without user stats");
          setUserData(null);
          setGameSummaries({});
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    initAndFetch();
  }, [user]);

  // Refresh stats from Firestore
  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await fetchUserStats(user.uid);
      setUserData(stats);

      if (stats?.gameStats) {
        const summaries = {};
        for (const [gameType, gameData] of Object.entries(stats.gameStats)) {
          summaries[gameType] = computeGameStatsSummary(gameData);
        }
        setGameSummaries(summaries);
      }
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  }, [user]);

  // Update user preferences
  const handleUpdatePreferences = useCallback(
    async (newPreferences) => {
      if (!user) return;

      try {
        await updateUserPreferences(user.uid, newPreferences);
        setUserData((prev) => ({
          ...prev,
          preferences: { ...prev?.preferences, ...newPreferences },
        }));
      } catch (err) {
        console.error("Error updating preferences:", err);
        throw err;
      }
    },
    [user]
  );

  // Get computed summary for a game type
  const getGameSummary = useCallback(
    (gameType) => {
      return gameSummaries[gameType] || null;
    },
    [gameSummaries]
  );

  const value = {
    loading,
    error,
    profile: userData?.profile || null,
    preferences: userData?.preferences || defaultUserState.preferences,
    gameStats: userData?.gameStats || {},
    gameSummaries,
    refreshStats,
    updatePreferences: handleUpdatePreferences,
    getGameSummary,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserProvider;
