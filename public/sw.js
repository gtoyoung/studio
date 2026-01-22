const CACHE_NAME = 'lunch-vote-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('Cache addAll error:', err);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Firebase/external requests
  if (
    request.url.includes('firebase') ||
    request.url.includes('googleapis') ||
    request.url.includes('gstatic')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Network first strategy for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Cache first strategy for other requests
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        return (
          response ||
          fetch(request)
            .then((fetchResponse) => {
              const clonedResponse = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, clonedResponse);
              });
              return fetchResponse;
            })
            .catch(() => {
              // Return offline page if available
              if (request.destination === 'document') {
                return caches.match('/offline.html');
              }
              return null;
            })
        );
      })
  );
});

// Background sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-votes') {
    event.waitUntil(
      // Implement vote sync logic here
      Promise.resolve()
    );
  }
});
