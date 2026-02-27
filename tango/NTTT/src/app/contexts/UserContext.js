"use client";

import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";

/**
 * UserContext - Stub for future user data sync with Firestore
 *
 * This context will eventually sync with Firestore to persist:
 * - Login stats (last login, login count)
 * - Game history (recent games, total played)
 * - User preferences (theme, defaults)
 * - High scores per game
 * - Unread messages/notifications
 *
 * For now, it provides default values only.
 */

const defaultUserState = {
  // Login stats
  lastLoginAt: null,
  loginCount: 0,

  // Game history
  recentGames: [],
  totalGamesPlayed: 0,

  // Preferences
  preferences: {
    theme: "dark",
    defaultNumSongs: 10,
    defaultTimeLimit: 15,
  },

  // High scores per game
  highScores: {
    // e.g., "orchestra-quiz": { score: 1000, date: "2024-01-15" }
  },

  // Messages/notifications
  unreadMessages: [],

  // Methods (stubs for now)
  updatePreferences: () => {},
  recordGamePlayed: () => {},
  updateHighScore: () => {},
  markMessageRead: () => {},
};

export const UserContext = createContext(defaultUserState);

export function useUserContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  // For now, just provide default values
  // Future: sync with Firestore based on AuthContext user
  const value = {
    ...defaultUserState,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserProvider;
