// Google Analytics event tracking utilities

export const GA_MEASUREMENT_ID = "G-GSRFSWE79N";

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific tracking functions
export const trackGameClick = (gameName, category) => {
  trackEvent("game_click", "GameHub", `${category}/${gameName}`);
};

export const trackPlayClick = (gameName) => {
  trackEvent("play_click", "Game", gameName);
};

export const trackGuess = (gameName, isCorrect, orchestra) => {
  trackEvent("guess", gameName, isCorrect ? "correct" : "incorrect");
};

export const trackGameComplete = (gameName, score, total) => {
  trackEvent("game_complete", gameName, `${score}/${total}`, score);
};
