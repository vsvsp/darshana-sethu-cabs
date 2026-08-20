const CACHE_NAME = "darshana-sethu-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
          .then((response) => {
            if (
              response &&
              response.status === 200 &&
              response.type === "basic"
            ) {
              const responseClone = response.clone();

              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }

            return response;
          })
          .catch(() => caches.match("./index.html"))
      );
    })
  );
});
