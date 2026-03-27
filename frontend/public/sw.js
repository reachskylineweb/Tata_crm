const CACHE_NAME = 'dse-crm-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dse-app',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const isCachableRout = event.request.url.includes('/dse-app');
  if (isCachableRout) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  } else {
    // Normal browser flow for others
    event.respondWith(fetch(event.request));
  }
});
