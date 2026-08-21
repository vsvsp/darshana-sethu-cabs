const CACHE_NAME = "darshana-sethu-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of APP_FILES) {
        try {
          await cache.add(file);
        } catch (error) {
          console.log("Cache failed:", file);
        }
      }

      await self.skipWaiting();
    })
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
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
        .catch(() => {
          return caches.match("./index.html");
        });

    })
  );
});
