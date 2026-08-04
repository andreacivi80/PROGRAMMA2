const CACHE = "gambe-leggere-v255";
const CACHE_PREFIX = "gambe-leggere-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) =>
        Promise.all(
          clients.map((client) => {
            const url = new URL(client.url);
            url.searchParams.set("revisione", CACHE.replace(CACHE_PREFIX, ""));
            return client.navigate(url.toString());
          }),
        ),
      ),
  );
});

// La rete resta sempre prioritaria: nessuna vecchia pagina viene più servita dalla cache offline.
self.addEventListener("fetch", () => undefined);
