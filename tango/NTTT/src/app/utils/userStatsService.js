// ------------------------------------------------------------
// src/utils/userStatsService.js
// Firebase Firestore service for user stats and session tracking
// ------------------------------------------------------------

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Grid cell key mapping for orchestra games
 * Maps gridCell number (1-9) to tier-depth key
 */
export const ORCHESTRA_GRID_KEYS = {
  1: 'Big4-Famous',
  2: 'Big4-Regular',
  3: 'Big4-Obscure',
  4: 'Classic-Famous',
  5: 'Classic-Regular',
  6: 'Classic-Obscure',
  7: 'Deep-Famous',
  8: 'Deep-Regular',
  9: 'Deep-Obscure',
};

/**
 * Grid cell key mapping for singer games
 * Maps gridCell number (1-9) to singerLevel-songFamiliarity key
 */
export const SINGER_GRID_KEYS = {
  1: 'Iconic-Famous',
  2: 'Iconic-Common',
  3: 'Iconic-Obscure',
  4: 'Essential-Famous',
  5: 'Essential-Common',
  6: 'Essential-Obscure',
  7: 'Standard-Famous',
  8: 'Standard-Common',
  9: 'Standard-Obscure',
};

/**
 * Get grid key for a game type and cell number
 */
export function getGridKey(gameType, gridCell) {
  if (gameType.includes('singer')) {
    return SINGER_GRID_KEYS[gridCell] || 'Unknown';
  }
  return ORCHESTRA_GRID_KEYS[gridCell] || 'Unknown';
}

/**
 * Initialize user document on first login
 * Creates profile, preferences, and empty gameStats
 *
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export async function initializeUserDoc(user) {
  if (!user?.uid) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        profile: {
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          email: user.email || null,
          createdAt: serverTimestamp(),
        },
        preferences: {
          theme: 'dark',
          defaultNumSongs: 10,
          defaultTimeLimit: 15,
        },
        gameStats: {},
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error initializing user doc:', error.message);
    throw error;
  }
}

/**
 * Fetch user stats from Firestore
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object|null>} - User stats or null if not found
 */
export async function fetchUserStats(userId) {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user stats:', error.message);
    return null;
  }
}

/**
 * Save a completed game session to Firestore
 * Also updates user aggregate stats
 *
 * @param {Object} params - Session parameters
 * @param {string} params.gameType - Game identifier (e.g., 'orchestra-quiz')
 * @param {number} params.gridCell - Grid cell number (1-9)
 * @param {Object} params.config - Game configuration
 * @param {Array} params.results - Array of round results
 * @param {number} params.totalScore - Total session score
 * @param {number} params.correctCount - Number of correct answers
 * @param {number} params.totalQuestions - Total questions asked
 * @returns {Promise<string|null>} - Session document ID or null
 */
export async function saveSessionResults({
  gameType,
  gridCell,
  config,
  results,
  totalScore,
  correctCount,
  totalQuestions,
}) {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, skipping session save');
    return null;
  }

  try {
    const gridKey = getGridKey(gameType, gridCell);

    // 1. Save session document
    const sessionDoc = {
      userId: user.uid,
      userEmail: user.email,
      gameType,
      gridCell,
      gridKey,
      config: {
        primaryFilterMode: config?.primaryFilterMode || null,
        gridCells: config?.gridCells || [],
        orchestraTiers: config?.orchestraTiers || [],
        singerGridCells: config?.singerGridCells || [],
        recognitionTiers: config?.recognitionTiers || [],
        periods: config?.periods || [],
        styles: config?.styles || {},
        numSongs: config?.numSongs || null,
        timeLimit: config?.timeLimit || null,
      },
      results: results.map((r) => ({
        songId: r.songId || null,
        correct: r.correct || false,
        timeUsed: r.timeUsed || 0,
        score: r.score || 0,
      })),
      totalScore,
      correctCount,
      totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
      completedAt: serverTimestamp(),
    };

    const sessionRef = await addDoc(collection(db, 'sessions'), sessionDoc);

    // 2. Update user aggregate stats
    await updateUserGameStats({
      userId: user.uid,
      gameType,
      gridKey,
      totalScore,
      correctCount,
      totalQuestions,
    });

    return sessionRef.id;
  } catch (error) {
    console.error('Error saving session results:', error.message);
    throw error;
  }
}

/**
 * Update user's aggregate game stats using atomic increments
 *
 * @param {Object} params - Update parameters
 * @param {string} params.userId - Firebase user ID
 * @param {string} params.gameType - Game identifier
 * @param {string} params.gridKey - Grid cell key (e.g., 'Big4-Famous')
 * @param {number} params.totalScore - Session total score
 * @param {number} params.correctCount - Number of correct answers
 * @param {number} params.totalQuestions - Total questions
 * @returns {Promise<void>}
 */
async function updateUserGameStats({
  userId,
  gameType,
  gridKey,
  totalScore,
  correctCount,
  totalQuestions,
}) {
  const userRef = doc(db, 'users', userId);

  try {
    // First, get current stats to check for best score
    const userSnap = await getDoc(userRef);
    const currentData = userSnap.data();
    const currentGameStats = currentData?.gameStats?.[gameType] || {};
    const currentBestScore = currentGameStats.bestSessionScore || 0;
    const currentCellBestScore = currentGameStats.cells?.[gridKey]?.bestScore || 0;

    // Build update object with atomic increments
    const updates = {
      // Game-level aggregates
      [`gameStats.${gameType}.totalPlayed`]: increment(totalQuestions),
      [`gameStats.${gameType}.totalCorrect`]: increment(correctCount),
      [`gameStats.${gameType}.totalScore`]: increment(totalScore),
      [`gameStats.${gameType}.sessionsCompleted`]: increment(1),

      // Cell-level aggregates
      [`gameStats.${gameType}.cells.${gridKey}.played`]: increment(totalQuestions),
      [`gameStats.${gameType}.cells.${gridKey}.correct`]: increment(correctCount),
      [`gameStats.${gameType}.cells.${gridKey}.totalScore`]: increment(totalScore),
      [`gameStats.${gameType}.cells.${gridKey}.sessions`]: increment(1),
      [`gameStats.${gameType}.cells.${gridKey}.lastPlayed`]: serverTimestamp(),
    };

    // Update best scores if beaten
    if (totalScore > currentBestScore) {
      updates[`gameStats.${gameType}.bestSessionScore`] = totalScore;
    }
    if (totalScore > currentCellBestScore) {
      updates[`gameStats.${gameType}.cells.${gridKey}.bestScore`] = totalScore;
    }

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user game stats:', error.message);
    throw error;
  }
}

/**
 * Get stats summary for a specific game type
 * Computes averages from stored totals
 *
 * @param {Object} gameStats - The gameStats object for a game type
 * @returns {Object} - Computed stats with averages
 */
export function computeGameStatsSummary(gameStats) {
  if (!gameStats) {
    return {
      totalPlayed: 0,
      totalCorrect: 0,
      accuracy: 0,
      totalScore: 0,
      avgScore: 0,
      bestSessionScore: 0,
      sessionsCompleted: 0,
      cells: {},
    };
  }

  const totalPlayed = gameStats.totalPlayed || 0;
  const totalCorrect = gameStats.totalCorrect || 0;
  const totalScore = gameStats.totalScore || 0;

  const summary = {
    totalPlayed,
    totalCorrect,
    accuracy: totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0,
    totalScore,
    avgScore: totalPlayed > 0 ? Math.round(totalScore / totalPlayed) : 0,
    bestSessionScore: gameStats.bestSessionScore || 0,
    sessionsCompleted: gameStats.sessionsCompleted || 0,
    cells: {},
  };

  // Compute per-cell summaries
  if (gameStats.cells) {
    for (const [key, cell] of Object.entries(gameStats.cells)) {
      const cellPlayed = cell.played || 0;
      const cellCorrect = cell.correct || 0;
      const cellTotalScore = cell.totalScore || 0;

      summary.cells[key] = {
        played: cellPlayed,
        correct: cellCorrect,
        accuracy: cellPlayed > 0 ? Math.round((cellCorrect / cellPlayed) * 100) : 0,
        avgScore: cellPlayed > 0 ? Math.round(cellTotalScore / cellPlayed) : 0,
        bestScore: cell.bestScore || 0,
        sessions: cell.sessions || 0,
        lastPlayed: cell.lastPlayed || null,
      };
    }
  }

  return summary;
}

/**
 * Update user preferences
 *
 * @param {string} userId - Firebase user ID
 * @param {Object} preferences - Preferences to update (merged with existing)
 * @returns {Promise<void>}
 */
export async function updateUserPreferences(userId, preferences) {
  if (!userId) return;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences: preferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error.message);
    throw error;
  }
}
