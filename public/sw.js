/** Bump when SW logic changes so clients drop old caches. */
const CACHE_VERSION = "xpat-lookup-v2";
const STATIC_ASSETS = ["/manifest.webmanifest", "/icon.svg", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isNextAsset(pathname) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  );
}

function isDocumentRequest(request) {
  return (
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html")
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Never cache-first Next bundles — stale HTML + missing chunks after deploy.
  if (isNextAsset(url.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML: always network so users get fresh chunk hashes after redeploy.
  if (isDocumentRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(
        () => caches.match("/") ?? Response.error(),
      ),
    );
    return;
  }

  // Icons / manifest only: cache, then network.
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request).then((response) => {
          if (response.ok && STATIC_ASSETS.includes(url.pathname)) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }),
    ),
  );
});
