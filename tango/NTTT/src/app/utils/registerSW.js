//------------------------------------------------------------
// src/utils/registerSW.js
// Service Worker Registration for PWA
// v1.0.0
//------------------------------------------------------------

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Listen for new service worker waiting
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New version available
            dispatchEvent(new CustomEvent("swUpdate", { detail: { registration } }));
          }
        });
      });

      console.log("NTTT Service Worker registered");
    } catch (error) {
      console.error("SW registration failed:", error);
    }
  });
}

export function skipWaitingAndReload(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }
}
