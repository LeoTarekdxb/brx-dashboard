// Minimal service worker: cache the shell, always fetch fresh data.json.
const SHELL = "brx-terminal-v4"; // v2: BRX Terminal redesign
self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c =>
    c.addAll(["./", "index.html", "manifest.webmanifest", "icon-192.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith("data.json")) {
    // network-first so numbers are always live; fall back to cache offline
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
