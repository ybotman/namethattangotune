//------------------------------------------------------------
// src/utils/registerSW.js
// Service Worker Registration for PWA
// v1.1.0 - Auto-update on startup
//------------------------------------------------------------

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Check for updates immediately on startup
      registration.update();

      // Check for updates periodically (every 5 minutes when app is open)
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      // If there's already a waiting worker, activate it immediately
      if (registration.waiting) {
        activateUpdate(registration);
        return;
      }

      // Listen for new service worker waiting
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New version available - activate immediately
            activateUpdate(registration);
          }
        });
      });

      // Handle controller change (new SW took over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

    } catch (error) {
      // SW registration failed - continue without PWA
    }
  });
}

function activateUpdate(registration) {
  if (registration.waiting) {
    // Tell the waiting SW to skip waiting and take over
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

export function skipWaitingAndReload(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }
}
