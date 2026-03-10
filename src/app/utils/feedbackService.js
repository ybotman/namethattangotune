// ------------------------------------------------------------
// src/utils/feedbackService.js
// Firebase Firestore service for song feedback/issue reports
// ------------------------------------------------------------

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Feedback issue types
 */
export const FEEDBACK_TYPES = [
  { value: 'orchestra_mislabeled', label: 'Orchestra mislabeled', hasUserAnswer: true },
  { value: 'singer_mislabeled', label: 'Singer mislabeled', hasUserAnswer: true },
  { value: 'title_mislabeled', label: 'Title mislabeled', hasUserAnswer: true },
  { value: 'wrong_level', label: 'Wrong difficulty level' },
  { value: 'missing_singer', label: 'No singer detected (but has one)', hasUserAnswer: true },
  { value: 'false_singer', label: 'Singer detected (but instrumental)' },
  { value: 'audio_issue', label: 'Audio quality/playback issue' },
  { value: 'wrong_year', label: 'Year is incorrect', hasUserAnswer: true },
  { value: 'other', label: 'Other issue', hasUserAnswer: true },
];

/**
 * Submit song feedback to Firestore
 *
 * @param {Object} params - Feedback parameters
 * @param {string} params.feedbackType - Type of issue (from FEEDBACK_TYPES)
 * @param {string} params.gameType - Game identifier (e.g., 'orchestra-quiz')
 * @param {Object} params.song - Current song object
 * @param {Object} params.config - Game config
 * @param {string[]} params.answers - List of answer options shown
 * @param {string} params.selectedAnswer - User's selected answer
 * @param {string} params.correctAnswer - The correct answer
 * @param {boolean} params.wasCorrect - Whether user got it right
 * @param {number} params.roundScore - Score for this round
 * @param {number} params.sessionScore - Total session score
 * @param {string} params.notes - Optional additional notes
 * @returns {Promise<string>} - Document ID of created feedback
 */
export async function submitSongFeedback({
  feedbackType,
  gameType,
  song,
  config,
  answers,
  selectedAnswer,
  correctAnswer,
  wasCorrect,
  roundScore,
  sessionScore,
  notes = '',
  userSuggestedAnswer = '',
}) {
  try {
    const user = auth.currentUser;

    const feedbackDoc = {
      // Issue details
      feedbackType,
      notes,
      userSuggestedAnswer: userSuggestedAnswer || null,

      // Song details
      songId: song?.SongID || null,
      songTitle: song?.Title || null,
      songArtist: song?.ArtistMaster || null,
      songSinger: song?.Singer || null,
      songYear: song?.Year || null,
      songStyle: song?.Style || null,
      audioUrl: song?.AudioUrl || null,

      // Game context
      gameType,
      gameUrl: typeof window !== 'undefined' ? window.location.href : null,
      config: {
        primaryFilterMode: config?.primaryFilterMode || null,
        gridCells: config?.gridCells || [],
        orchestraTiers: config?.orchestraTiers || [],
        recognitionTiers: config?.recognitionTiers || [],
        periods: config?.periods || [],
        styles: config?.styles || {},
        numSongs: config?.numSongs || null,
        timeLimit: config?.timeLimit || null,
        includeSinger: config?.includeSinger || false,
      },

      // Answer context
      answersShown: answers || [],
      selectedAnswer: selectedAnswer || null,
      correctAnswer: correctAnswer || null,
      wasCorrect: wasCorrect || false,
      roundScore: roundScore || 0,
      sessionScore: sessionScore || 0,

      // User info (anon-ready)
      userId: user?.uid || 'anonymous',
      userEmail: user?.email || null,
      isAnonymous: !user || user.isAnonymous,

      // Metadata
      createdAt: serverTimestamp(),
      status: 'pending', // pending | reviewed | resolved | dismissed
      reviewNotes: null,
    };

    const docRef = await addDoc(collection(db, 'songFeedback'), feedbackDoc);
    return docRef.id;
  } catch (error) {
    console.error('Feedback submission error:', error.message);
    throw error;
  }
}
