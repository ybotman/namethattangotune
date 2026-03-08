// Service Worker for NTTT PWA
// v1.0.0 - Cache UI assets, stream audio from network

const CACHE_NAME = 'nttt-v1';
const STATIC_ASSETS = [
  '/',
  '/games/gamehub',
  '/games/orchestra-quiz',
  '/games/singer-quiz',
  '/games/song-quiz',
  '/games/listen',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/Banner/Type1__NTTT.png',
  '/Banner/Type2__NTTT.png',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first for HTML/API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip audio files - always fetch from network (Azure Blob)
  if (url.pathname.includes('/audio/') || url.hostname.includes('blob.core.windows.net')) {
    return;
  }

  // Skip API calls - always fetch from network
  if (url.pathname.startsWith('/api/') || url.pathname.includes('djSongs')) {
    return;
  }

  // For page navigations - network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline - try cache
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // For static assets - cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cache but also update in background
        fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response);
          });
        });
        return cached;
      }
      // Not in cache - fetch and cache
      return fetch(event.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
