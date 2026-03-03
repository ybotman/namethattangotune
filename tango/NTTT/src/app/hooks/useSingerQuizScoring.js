"use client";

import { useState, useRef, useCallback } from "react";
import { applyScoreMultiplier, LOCKOUT_DURATION_MS } from "@/utils/scoringUtils";

/**
 * Provide time & scoring logic for the Singer Quiz.
 * Features:
 * - Score drains over time
 * - Wrong answers trigger lockout (no score penalty, just time loss)
 * - Difficulty multipliers applied to final score
 */
export default function useSingerQuizScoring({
  timeLimit,
  maxScore,
  INTERVAL_MS,
  onTimesUp,
  getGoPhrase,
  songs,
  config = {}, // Game config for multipliers (recognitionTiers)
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [roundScore, setRoundScore] = useState(maxScore);

  const [sessionScore, setSessionScore] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [roundStats, setRoundStats] = useState([]);

  // Lockout state
  const [isLockedOut, setIsLockedOut] = useState(false);
  const lockoutTimeoutRef = useRef(null);

  const decrementIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  // Ref to track current song for timeout recording (avoids stale closure)
  const currentSongRef = useRef(null);
  const wrongAnswersRef = useRef([]);

  // Keep refs in sync with state
  currentSongRef.current = currentSong;
  wrongAnswersRef.current = wrongAnswers;

  // Clear lockout timeout
  const clearLockout = useCallback(() => {
    if (lockoutTimeoutRef.current) {
      clearTimeout(lockoutTimeoutRef.current);
      lockoutTimeoutRef.current = null;
    }
    setIsLockedOut(false);
  }, []);

  const initRound = useCallback(
    async (idx) => {
      if (!songs || idx >= songs.length) return;

      setCurrentIndex(idx);
      setCurrentSong(songs[idx]);
      setSelectedAnswer(null);
      setWrongAnswers([]);
      setRoundScore(maxScore);
      setTimeElapsed(0);
      setIsPlaying(false);
      clearLockout();

      if (getGoPhrase) {
        await getGoPhrase();
      }
    },
    [songs, maxScore, getGoPhrase, clearLockout],
  );

  const stopAllIntervals = useCallback(() => {
    if (decrementIntervalRef.current) {
      clearInterval(decrementIntervalRef.current);
      decrementIntervalRef.current = null;
    }
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
    clearLockout();
  }, [clearLockout]);

  const handleAnswerSelect = useCallback((ans) => {
    if (!currentSong || !isPlaying || isLockedOut) {
      return { roundEnded: false, correct: false };
    }
    setSelectedAnswer(ans);

    // Check against Singer field
    const correctSinger = (currentSong.Singer || "").trim().toLowerCase();
    const guess = ans.trim().toLowerCase();
    const isCorrect = guess === correctSinger;

    if (isCorrect) {
      stopAllIntervals();
      // Apply difficulty multiplier to the round score
      const multipliedScore = applyScoreMultiplier(Math.max(roundScore, 0), config);
      setSessionScore((old) => old + multipliedScore);
      setRoundStats((old) => [
        ...old,
        {
          songId: currentSong.SongID || null,
          correct: true,
          timeUsed: timeElapsed,
          distractorsUsed: wrongAnswers.length,
          score: multipliedScore,
          // Enhanced data for per-singer analytics
          correctSinger: currentSong.Singer || null,
          userGuessSinger: ans,
        },
      ]);
      return { roundEnded: true, correct: true };
    } else {
      // Wrong => lockout (score keeps draining during lockout)
      setWrongAnswers((old) => [...old, ans]);
      setIsLockedOut(true);

      // Clear lockout after duration
      lockoutTimeoutRef.current = setTimeout(() => {
        setIsLockedOut(false);
      }, LOCKOUT_DURATION_MS);

      return { roundEnded: false, correct: false };
    }
  }, [currentSong, isPlaying, isLockedOut, roundScore, config, stopAllIntervals, timeElapsed, wrongAnswers.length]);

  const startIntervals = useCallback(() => {
    decrementIntervalRef.current = setInterval(() => {
      setRoundScore((old) => Math.max(old - maxScore / (timeLimit * 10), 0));
    }, INTERVAL_MS);

    timeIntervalRef.current = setInterval(() => {
      setTimeElapsed((old) => {
        const nextVal = old + 0.1;
        if (nextVal >= timeLimit) {
          stopAllIntervals();
          // Record timeout result internally before calling external handler
          if (currentSongRef.current) {
            setRoundStats((prev) => [
              ...prev,
              {
                songId: currentSongRef.current.SongID || null,
                correct: false,
                timeUsed: timeLimit,
                distractorsUsed: wrongAnswersRef.current.length,
                score: 0,
                // Enhanced data for per-singer analytics
                correctSinger: currentSongRef.current.Singer || null,
                userGuessSinger: null, // Timed out, no guess recorded
              },
            ]);
          }
          if (onTimesUp) onTimesUp();
        }
        return nextVal;
      });
    }, INTERVAL_MS);
  }, [maxScore, timeLimit, INTERVAL_MS, onTimesUp, stopAllIntervals]);

  const handleNextSong = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (!songs || nextIndex >= songs.length) {
      setShowFinalSummary(true);
      return;
    }
    initRound(nextIndex);
  }, [currentIndex, songs, initRound]);

  return {
    currentIndex,
    currentSong,
    isPlaying,
    setIsPlaying,
    answers,
    setAnswers,
    selectedAnswer,
    wrongAnswers,

    timeElapsed,
    setTimeElapsed,
    roundScore,
    setRoundScore,

    sessionScore,
    setSessionScore,
    showFinalSummary,
    setShowFinalSummary,
    roundStats,
    setRoundStats,

    // Lockout state
    isLockedOut,

    startIntervals,
    stopAllIntervals,
    initRound,
    handleAnswerSelect,
    handleNextSong,
  };
}
