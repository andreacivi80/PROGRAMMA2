const CACHE = "english-coach-v34";
const BASE = "/PROGRAMMA2/";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add(BASE)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const networkUrl = new URL(event.request.url);
  if (event.request.mode === "navigate") networkUrl.searchParams.set("__ec_network", CACHE);
  const freshRequest = new Request(networkUrl, { cache: "no-store", headers: event.request.headers, credentials: event.request.credentials, redirect: event.request.redirect });
  event.respondWith(fetch(freshRequest).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match(BASE))));
});
