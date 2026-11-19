// Service Worker: offline-fähig. Bei jeder Veröffentlichung VERSION erhöhen.
const VERSION = "dartpro-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon.svg",
  "./js/app.js",
  "./js/engine/checkout.js",
  "./js/engine/cricket.js",
  "./js/engine/darts.js",
  "./js/engine/index.js",
  "./js/engine/training.js",
  "./js/engine/x01.js",
  "./js/stats.js",
  "./js/store.js",
  "./js/ui/actions.js",
  "./js/ui/components/chart.js",
  "./js/ui/dom.js",
  "./js/ui/screens/history.js",
  "./js/ui/screens/home.js",
  "./js/ui/screens/play-cricket.js",
  "./js/ui/screens/play-training.js",
  "./js/ui/screens/play-x01.js",
  "./js/ui/screens/play.js",
  "./js/ui/screens/players.js",
  "./js/ui/screens/settings.js",
  "./js/ui/screens/setup.js",
  "./js/ui/screens/stats.js",
  "./js/ui/screens/summary.js",
  "./js/ui/screens/training-menu.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

// Cache zuerst (schnell & offline), im Hintergrund aktualisieren
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (new URL(req.url).pathname.includes("/tests/")) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const key = req.mode === "navigate" ? "./index.html" : req;
    const cached = await cache.match(key, { ignoreSearch: req.mode === "navigate" });
    const network = fetch(req).then((res) => {
      if (res.ok && req.mode !== "navigate") cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(network); return cached; }
    return (await network) || (await cache.match("./index.html")) || Response.error();
  })());
});
