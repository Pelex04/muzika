// Minimal service worker. This exists solely to satisfy PWA installability
// checks on browsers that still look for a registered service worker with a
// fetch handler -- it deliberately does no caching or offline handling, just
// passes every request straight through to the network unchanged.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
