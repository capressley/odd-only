/* sw.js - Odd-Only Arcade (GitHub Pages friendly)
   If you change files and want to force-update caches, bump VERSION.
*/
const VERSION = "v7"; // <-- bump this anytime you update assets/code
const CACHE_NAME = `odd-only-arcade-${VERSION}`;

const ASSETS = [
  "./",               // GitHub Pages may serve index.html for folder
  "./index.html",
  "./manifest.webmanifest",
  "./welcome.png",
  "./doinggreat.png"
];

// Install: pre-cache core assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("odd-only-arcade-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch strategy:
// - HTML (navigate): network-first (so updates show quickly), fallback to cache
// - Images: cache-first (fast), fallback to network
// - Everything else: stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // HTML navigations: network-first
  if (req.mode === "navigate" || (req.destination === "document")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Images: cache-first
  if (req.destination === "image") {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((fresh) => {
      cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
