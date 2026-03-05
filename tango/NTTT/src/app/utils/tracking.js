// src/utils/tracking.js
// NTTT Analytics Tracking - DISABLED (NTTT is self-contained, no calendar-be-af dependency)
// AppId=3 (NTTT) per HDTS-SharedInfra-Plan
// TODO: Re-enable when nttt-functions has tracking endpoints

/**
 * Track anonymous visitor - DISABLED
 */
export async function trackVisitor(page = '/') {
  // NTTT doesn't use calendar-be-af - tracking disabled
  return;
}

/**
 * Track authenticated user login - DISABLED
 */
export async function trackLogin(token, page = '/games/gamehub') {
  // NTTT doesn't use calendar-be-af - tracking disabled
  return;
}

/**
 * Track a game session - DISABLED
 */
export async function trackGameSession(gameName, token = null) {
  // NTTT doesn't use calendar-be-af - tracking disabled
  return;
}
