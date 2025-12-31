const CACHE_NAME = "task-manager-v1";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./favicon.png",
  "./manifest.json",
  "./js/app.js",
  "./js/db.js"
];

/* Install */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

/* Fetch */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
