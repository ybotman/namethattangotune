// src/utils/tracking.js
// NTTT Analytics Tracking - Uses calendar-be-af endpoints
// AppId=3 (NTTT) per HDTS-SharedInfra-Plan

const NTTT_APP_ID = '3';
const CALENDAR_BE_AF_URL = process.env.NEXT_PUBLIC_CALENDAR_BE_AF_URL || 'https://calendar-be-af.azurewebsites.net';

/**
 * Get device type from user agent
 */
function getDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown';
  return /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'web';
}

/**
 * Get or create a visitor ID (persisted in localStorage)
 */
function getVisitorId() {
  if (typeof localStorage === 'undefined') return null;

  let visitorId = localStorage.getItem('nttt-visitor-id');
  if (!visitorId) {
    visitorId = `nttt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('nttt-visitor-id', visitorId);
  }
  return visitorId;
}

/**
 * Track anonymous visitor (no auth required)
 * Uses VisitorTrack endpoint
 */
export async function trackVisitor(page = '/') {
  try {
    const response = await fetch(`${CALENDAR_BE_AF_URL}/api/visitor/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: parseInt(NTTT_APP_ID, 10),
        visitor_id: getVisitorId(),
        deviceType: getDeviceType(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        page: page,
      }),
    });

    if (!response.ok) {
      console.warn('Visitor tracking failed:', response.status);
    } else {
      console.log('NTTT visitor tracked (appId=3)');
    }
  } catch (err) {
    // Non-blocking - don't break the app
    console.warn('Visitor tracking error (non-blocking):', err.message);
  }
}

/**
 * Track authenticated user login
 * Uses UserLoginTrack endpoint (requires Firebase token)
 */
export async function trackLogin(token, page = '/games/gamehub') {
  try {
    const response = await fetch(`${CALENDAR_BE_AF_URL}/api/user/login-track`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: NTTT_APP_ID,
        deviceType: getDeviceType(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        page: page,
      }),
    });

    if (!response.ok) {
      console.warn('Login tracking failed:', response.status);
    } else {
      console.log('NTTT login tracked (appId=3)');
    }
  } catch (err) {
    // Non-blocking
    console.warn('Login tracking error (non-blocking):', err.message);
  }
}

/**
 * Track a game session (for future use)
 * Could extend VisitorTrack with game-specific data
 */
export async function trackGameSession(gameName, token = null) {
  const page = `/games/${gameName}`;

  if (token) {
    // Authenticated user
    await trackLogin(token, page);
  } else {
    // Anonymous visitor
    await trackVisitor(page);
  }
}
