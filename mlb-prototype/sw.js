const CACHE_NAME = "bpq-prototype-v1";
const PRECACHE = [
  "./",
  "index.html",
  "parks.html",
  "route.html",
  "scorekeeper.html",
  "shared.css",
  "route.css",
  "device.js",
  "storage.js",
  "utils.js",
  "data.js",
  "app.js",
  "route.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "fonts/dm-mono-400.woff2",
  "fonts/dm-mono-500.woff2",
  "fonts/dm-sans-300.woff2",
  "fonts/dm-sans-400.woff2",
  "fonts/dm-sans-500.woff2",
  "fonts/playfair-display-700.woff2",
  "fonts/playfair-display-900.woff2",
  "fonts/playfair-display-italic-400.woff2",
  "fonts/playfair-display-italic-700.woff2",
  "fonts/special-elite-400.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
