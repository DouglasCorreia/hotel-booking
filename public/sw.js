const CACHE_PREFIX = "lumina-offline-";
// Increment this version when offline.html changes.
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const obsolete = (await caches.keys()).filter(
        (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME
      );
      await Promise.all(obsolete.map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (
    request.method !== "GET" ||
    request.mode !== "navigate" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async (error) => {
      const fallback = await caches.match(OFFLINE_URL, {
        cacheName: CACHE_NAME,
      });
      if (!fallback) throw error;
      return fallback;
    })
  );
});
