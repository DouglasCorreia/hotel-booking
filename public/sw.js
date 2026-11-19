const CACHE_PREFIX = "lumina-offline-";
// Increment this version when offline.html changes.
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const OFFLINE_URL = "/offline.html";
const LOCALE_CACHE = "lumina-locale";
const LOCALE_KEY = "/.lumina-locale";

async function isEnglishNavigation(url) {
  if (/^\/en-US(?:\/|$)/.test(url.pathname)) return true;
  if (url.pathname !== "/" || url.searchParams.get("lang") === "pt-BR")
    return false;
  const preference = await caches.match(LOCALE_KEY, {
    cacheName: LOCALE_CACHE,
  });
  return (await preference?.text()) === "en-US";
}

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
      if (!(await isEnglishNavigation(new URL(request.url)))) return fallback;
      const html = (await fallback.text()).replace(
        '<html lang="pt-BR">',
        '<html lang="en-US">'
      );
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    })
  );
});
