/* sw.js - Odd-Only Arcade (GitHub Pages friendly)
   If you change files and want to force-update caches, bump VERSION.
*/
const VERSION = "v8"; // bump this anytime you update assets/code
const CACHE_NAME = `odd-only-arcade-${VERSION}`;

// Add any icon files referenced in manifest.webmanifest if you have them.
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./welcome.png",
  "./doinggreat.png",
  "./sw.js"
];

// Install: pre-cache core assets (resilient to missing files)
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cache what we can; don't fail the whole SW if one asset is missing.
    const results = await Promise.allSettled(
      ASSETS.map((path) => cache.add(path))
    );

    // Optional: log missing assets during development
    // results.forEach((r, i) => {
    //   if (r.status === "rejected") console.warn("SW precache failed:", ASSETS[i], r.reason);
    // });
  })());
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith("odd-only-arcade-") && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Fetch strategy:
// - HTML (navigate): network-first, fallback to cached index.html
// - Images: cache-first
// - Everything else: stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // HTML navigations: network-first (keeps updates fresh)
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirstHTML(req));
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

async function networkFirstHTML(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    // Cache a copy keyed to the actual request URL
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    // Try exact match first
    const cached = await cache.match(request);
    if (cached) return cached;

    // GitHub Pages: fallback to cached index.html for folder navigations
    const fallback = await cache.match("./index.html");
    return fallback || new Response("Offline", { status: 503 });
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
