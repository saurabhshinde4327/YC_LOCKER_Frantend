const CACHE_NAME = 'ycis-locker-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/ycis.png',
  '/globals.css'
];

// Install Service Worker and cache only valid GET requests
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return Promise.all(
          urlsToCache.map(url =>
            fetch(url, { method: 'GET' })
              .then(response => {
                if (response.ok) return cache.put(url, response);
                else console.warn('Service Worker: Failed to cache', url);
              })
              .catch(err => console.warn('Service Worker: Error caching', url, err))
          )
        );
      })
  );
});

// Fetch event: cache only static GET requests from your site
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests and same-origin http/https URLs
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) return response;

        return fetch(request)
          .then((fetchResponse) => {
            // Only cache 200 responses
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache)
                    .catch(err => console.warn('Service Worker: Cannot cache', request.url, err));
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Return cached homepage for navigation if offline
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Optional: Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/ycis.png',
      badge: '/icons/ycis.png',
      vibrate: [100, 50, 100],
      data: { dateOfArrival: Date.now(), primaryKey: 1 }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
