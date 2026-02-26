// Google Analytics event tracking utilities

export const GA_MEASUREMENT_ID = "G-GSRFSWE79N";

// Core tracking function
export const trackEvent = (action, category, label, value, extraParams = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
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

export const trackGameSetup = (gameName, config) => {
  trackEvent("game_setup", gameName, JSON.stringify({
    periods: config.periods,
    styles: config.styles,
    numSongs: config.numSongs,
    timeLimit: config.timeLimit,
    includeSinger: config.includeSinger,
    selectedOrchestra: config.selectedOrchestra,
  }), config.numSongs);
};

export const trackGameStart = (gameName, config) => {
  trackEvent("game_start", gameName, `songs:${config.numSongs}/time:${config.timeLimit}`, config.numSongs);
};

// ============ GAME PLAY ============

export const trackPlayClick = (gameName) => {
  trackEvent("play_click", "Game", gameName);
};

export const trackGuess = (gameName, isCorrect, userGuess, correctAnswer, songUrl) => {
  trackEvent("guess", gameName, isCorrect ? "correct" : "incorrect", isCorrect ? 1 : 0, {
    user_guess: userGuess,
    correct_answer: correctAnswer,
    song_url: songUrl,
  });
};

export const trackWrongAnswer = (gameName, songUrl, songTitle, correctAnswer, userGuess, orchestra, year) => {
  trackEvent("wrong_answer", gameName, songUrl, 0, {
    song_title: songTitle,
    correct_answer: correctAnswer,
    user_guess: userGuess,
    orchestra: orchestra,
    year: year,
  });
};

export const trackCorrectAnswer = (gameName, songUrl, score, timeRemaining) => {
  trackEvent("correct_answer", gameName, songUrl, score, {
    time_remaining: timeRemaining,
  });
};

// ============ GAME COMPLETE ============

export const trackGameComplete = (gameName, score, totalPossible, correctCount, totalQuestions) => {
  const percentage = Math.round((score / totalPossible) * 100);
  trackEvent("game_complete", gameName, `${correctCount}/${totalQuestions}`, score, {
    score: score,
    total_possible: totalPossible,
    correct_count: correctCount,
    total_questions: totalQuestions,
    percentage: percentage,
  });
};

export const trackGameCancel = (gameName, currentRound, totalRounds) => {
  trackEvent("game_cancel", gameName, `round:${currentRound}/${totalRounds}`, currentRound);
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
