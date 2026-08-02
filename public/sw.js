const CACHE = "english-coach-v106";
const AUDIO_CACHE = "english-coach-audio-v1";
const BASE = "/PROGRAMMA2/";
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch(BASE, { cache: "no-store" });
    await cache.put(BASE, response.clone());
    const html = await response.text();
    const paths = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map(match => new URL(match[1], self.location.origin + BASE).pathname)
      .filter(path => path.startsWith(BASE));
    await Promise.all([...new Set([`${BASE}manifest.webmanifest`, `${BASE}icon.svg`, `${BASE}offline-audio.json`, ...paths])].map(async path => {
      try { await cache.add(path); } catch {}
    }));
  })());
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && key !== AUDIO_CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") { self.skipWaiting(); return; }
  const reply = payload => event.source?.postMessage(payload);
  if (event.data?.type === "OFFLINE_STATUS") {
    event.waitUntil((async () => {
      const manifest = await fetch(`${BASE}offline-audio.json`, { cache: "no-store" })
        .catch(() => caches.match(`${BASE}offline-audio.json`))
        .then(response => {
          if (!response) throw new Error("Manifest audio non disponibile");
          return response.json();
        });
      const cache = await caches.open(AUDIO_CACHE);
      const cached = await cache.keys();
      reply({ type: "OFFLINE_STATUS", cached: cached.length, total: manifest.files.length, bytes: manifest.bytes });
    })());
  }
  if (event.data?.type === "CACHE_OFFLINE_AUDIO") {
    event.waitUntil((async () => {
      try {
        const manifest = await fetch(`${BASE}offline-audio.json`, { cache: "no-store" })
          .catch(() => caches.match(`${BASE}offline-audio.json`))
          .then(response => {
            if (!response) throw new Error("Manifest audio non disponibile");
            return response.json();
          });
        const cache = await caches.open(AUDIO_CACHE);
        let completed = 0;
        for (let start = 0; start < manifest.files.length; start += 12) {
          const batch = manifest.files.slice(start, start + 12);
          await Promise.all(batch.map(async file => {
            const url = `${BASE}${file}`;
            if (!(await cache.match(url))) await cache.add(url);
            completed += 1;
          }));
          reply({ type: "OFFLINE_PROGRESS", completed, total: manifest.files.length, bytes: manifest.bytes });
        }
        reply({ type: "OFFLINE_READY", completed, total: manifest.files.length, bytes: manifest.bytes });
      } catch (error) {
        reply({ type: "OFFLINE_ERROR", message: error instanceof Error ? error.message : String(error) });
      }
    })());
  }
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
