/* Únicamente shell genérico. Nunca se guarda HTML autenticado, JSON, POST o RSC. */
const CACHE = "tdj-admin-shell-v3";
const OFFLINE = "/admin/offline.html";
const ASSETS = [OFFLINE, "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("tdj-admin-shell-") && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (ASSETS.includes(url.pathname) && url.pathname !== OFFLINE) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
    return;
  }
  if (request.mode === "navigate" && (url.pathname === "/admin" || url.pathname.startsWith("/admin/"))) {
    event.respondWith(fetch(request, { cache: "no-store" }).catch(async () => {
      const cached = await caches.match(OFFLINE);
      if (cached) return new Response(await cached.text(), { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
      return new Response("Sin conexión. Conecta el dispositivo y vuelve a abrir el panel.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }));
  }
  // Las demás peticiones siguen su camino de red. No hay cola offline ni caché de datos.
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "LOGOUT") event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("tdj-admin-shell-")).map((key) => caches.delete(key)))));
});
