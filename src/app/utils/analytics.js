// Google Analytics event tracking utilities

export const GA_MEASUREMENT_ID = "G-GSRFSWE79N";

// Game session tracking - ties all events in a game together
let currentGameSessionId = null;
let gameStartTime = null;

// Generate unique session ID
export const generateGameSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  currentGameSessionId = `${timestamp}-${random}`;
  gameStartTime = timestamp;
  return currentGameSessionId;
};

// Get current session ID (for detecting orphaned events)
export const getGameSessionId = () => currentGameSessionId;

// Get elapsed time since game start
export const getGameElapsedTime = () => {
  if (!gameStartTime) return null;
  return Math.round((Date.now() - gameStartTime) / 1000);
};

// Clear session (on game complete or abandon)
export const clearGameSession = () => {
  currentGameSessionId = null;
  gameStartTime = null;
};

// Core tracking function - now includes session ID and elapsed time
export const trackEvent = (action, category, label, value, extraParams = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      game_session_id: currentGameSessionId,
      game_elapsed_sec: getGameElapsedTime(),
      ...extraParams,
    });
  }
};

// ============ PAGE / NAVIGATION ============

export const trackPageView = (pageName) => {
  trackEvent("page_view", "Navigation", pageName);
};

export const trackGameClick = (gameName, category) => {
  trackEvent("game_click", "GameHub", `${category}/${gameName}`);
};

export const trackReportClick = (reportName) => {
  trackEvent("report_click", "Reports", reportName);
};

// ============ GAME SETUP ============

// Called when user configures a game (periods, styles, etc)
export const trackGameSetup = (gameName, config) => {
  trackEvent("game_setup", gameName, JSON.stringify({
    periods: config.periods,
    styles: config.styles,
    numSongs: config.numSongs,
    timeLimit: config.timeLimit,
    includeSinger: config.includeSinger,
    selectedOrchestra: config.selectedOrchestra,
  }), config.numSongs, {
    num_songs: config.numSongs,
    time_limit: config.timeLimit,
    periods: JSON.stringify(config.periods),
    styles: JSON.stringify(config.styles),
    include_singer: config.includeSinger,
    selected_orchestra: config.selectedOrchestra,
  });
};

// Called when user clicks "Start" to begin the game
export const trackGameStart = (gameName, config) => {
  const sessionId = generateGameSessionId();
  trackEvent("game_start", gameName, `songs:${config.numSongs}/time:${config.timeLimit}`, config.numSongs, {
    num_songs: config.numSongs,
    time_limit: config.timeLimit,
    session_id: sessionId,
  });
};

// ============ GAME PLAY ============

// Called when user clicks GO/Play button
export const trackPlayClick = (gameName) => {
  trackEvent("play_click", "Game", gameName);
};

// Called when a new round starts - shows what choices are presented
export const trackRoundStart = (gameName, roundNum, songUrl, songTitle, orchestra, choices) => {
  trackEvent("round_start", gameName, `round:${roundNum}`, roundNum, {
    song_url: songUrl,
    song_title: songTitle,
    orchestra: orchestra,
    choices: JSON.stringify(choices),
    num_choices: choices.length,
  });
};

// Called on each guess click (even intermediate ones before final)
export const trackGuessClick = (gameName, roundNum, userGuess, attemptNum) => {
  trackEvent("guess_click", gameName, userGuess, attemptNum, {
    round: roundNum,
    attempt: attemptNum,
    guess: userGuess,
  });
};

// Called when round ends with correct/incorrect result
export const trackGuess = (gameName, isCorrect, userGuess, correctAnswer, songUrl) => {
  trackEvent("guess", gameName, isCorrect ? "correct" : "incorrect", isCorrect ? 1 : 0, {
    user_guess: userGuess,
    correct_answer: correctAnswer,
    song_url: songUrl,
  });
};

// Called on wrong answer with full song details
export const trackWrongAnswer = (gameName, songUrl, songTitle, correctAnswer, userGuess, orchestra, year) => {
  trackEvent("wrong_answer", gameName, songUrl, 0, {
    song_title: songTitle,
    correct_answer: correctAnswer,
    user_guess: userGuess,
    orchestra: orchestra,
    year: year,
  });
};

// Called on correct answer with score details
export const trackCorrectAnswer = (gameName, songUrl, score, timeRemaining) => {
  trackEvent("correct_answer", gameName, songUrl, score, {
    time_remaining: timeRemaining,
    score: score,
  });
};

// Called when a round/song completes with its individual score
export const trackRoundComplete = (gameName, roundNum, songUrl, score, maxScore, isCorrect) => {
  const percentage = Math.round((score / maxScore) * 100);
  trackEvent("round_complete", gameName, `round:${roundNum}`, score, {
    round: roundNum,
    song_url: songUrl,
    score: score,
    max_score: maxScore,
    percentage: percentage,
    correct: isCorrect,
  });
};

// ============ GAME COMPLETE ============

// Called when entire game session ends
export const trackGameComplete = (gameName, score, totalPossible, correctCount, totalQuestions, config) => {
  const percentage = Math.round((score / totalPossible) * 100);
  const totalTime = getGameElapsedTime();
  trackEvent("game_complete", gameName, `${correctCount}/${totalQuestions}`, score, {
    score: score,
    total_possible: totalPossible,
    correct_count: correctCount,
    total_questions: totalQuestions,
    percentage: percentage,
    num_songs: config?.numSongs,
    time_limit: config?.timeLimit,
    total_game_time: totalTime,
  });
  clearGameSession(); // End the session
};

// Called when user abandons/backs out of a game
export const trackGameCancel = (gameName, currentRound, totalRounds, config) => {
  const totalTime = getGameElapsedTime();
  trackEvent("game_cancel", gameName, `round:${currentRound}/${totalRounds}`, currentRound, {
    current_round: currentRound,
    total_rounds: totalRounds,
    num_songs: config?.numSongs,
    time_limit: config?.timeLimit,
    total_game_time: totalTime,
  });
  clearGameSession(); // End the session
};

// Called when user clicks back button during game
export const trackGameAbandon = (gameName, currentRound, totalRounds) => {
  trackEvent("game_abandon", gameName, `abandoned_at_round:${currentRound}`, currentRound, {
    current_round: currentRound,
    total_rounds: totalRounds,
  });
};

// ============ WELCOME PAGE ============

export const trackStartPlaying = () => {
  trackEvent("start_playing", "Welcome", "start_button");
};

// ============ LEARN MODE ============

export const trackLearnSongPlay = (gameName, orchestra, songTitle, songUrl) => {
  trackEvent("learn_play", gameName, orchestra, 1, {
    song_title: songTitle,
    song_url: songUrl,
  });
};

export const trackLearnReveal = (gameName, orchestra, songTitle) => {
  trackEvent("learn_reveal", gameName, orchestra, 1, {
    song_title: songTitle,
  });
};

export const trackLearnNext = (gameName) => {
  trackEvent("learn_next", gameName, "next_song");
};

// ============ ADMIN/TOOLS ============

export const trackToolOpen = (toolName) => {
  trackEvent("tool_open", "Tools", toolName);
};

export const trackReportView = (reportName) => {
  trackEvent("report_view", "Reports", reportName);
};

// ============ ERROR TRACKING ============

// Track React component errors (from Error Boundary)
export const trackReactError = (error, errorInfo) => {
  const errorMessage = error?.message || String(error);
  const componentStack = errorInfo?.componentStack || "";

  trackEvent("react_error", "Error", errorMessage.substring(0, 100), 1, {
    error_message: errorMessage.substring(0, 500),
    component_stack: componentStack.substring(0, 500),
    page_url: typeof window !== "undefined" ? window.location.pathname : "",
  });
};

// Track unhandled JS errors
export const trackJSError = (message, source, lineno, colno, error) => {
  const errorMessage = message || error?.message || "Unknown error";

  trackEvent("js_error", "Error", errorMessage.substring(0, 100), 1, {
    error_message: errorMessage.substring(0, 500),
    source: source?.substring(0, 200) || "",
    line: lineno,
    column: colno,
    stack: error?.stack?.substring(0, 500) || "",
    page_url: typeof window !== "undefined" ? window.location.pathname : "",
  });
};

// Track unhandled promise rejections
export const trackUnhandledRejection = (reason) => {
  const message = reason?.message || String(reason);

  trackEvent("unhandled_rejection", "Error", message.substring(0, 100), 1, {
    error_message: message.substring(0, 500),
    stack: reason?.stack?.substring(0, 500) || "",
    page_url: typeof window !== "undefined" ? window.location.pathname : "",
  });
};

// Initialize global error handlers (call once on app load)
export const initErrorTracking = () => {
  if (typeof window === "undefined") return;

  // Global JS errors
  window.onerror = (message, source, lineno, colno, error) => {
    trackJSError(message, source, lineno, colno, error);
    return false; // Don't suppress the error
  };

  // Unhandled promise rejections
  window.onunhandledrejection = (event) => {
    trackUnhandledRejection(event.reason);
  };
};
