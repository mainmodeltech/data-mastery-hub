/* Service worker de Model Technologie — rend le site installable et résilient aux coupures réseau.
 *
 * Règles volontairement prudentes :
 *  - jamais de mise en cache des appels à l'API (données personnelles, paiements, progression) ni des
 *    requêtes d'un autre domaine ;
 *  - navigations : réseau d'abord ; hors ligne, on sert la dernière page d'accueil mise en cache ;
 *  - fichiers versionnés (/assets/*) et images : cache d'abord, rafraîchis en arrière-plan.
 * Incrémenter VERSION pour purger les anciens caches lors d'un changement de stratégie.
 */
const VERSION = "v1";
const SHELL_CACHE = `mt-shell-${VERSION}`;
const ASSET_CACHE = `mt-assets-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.add("/")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL_CACHE, ASSET_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok && url.pathname === "/") caches.open(SHELL_CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/").then((cached) => cached ?? Response.error())),
    );
    return;
  }

  if (/^\/(assets|images)\//.test(url.pathname) || /\.(png|jpg|jpeg|webp|svg|woff2)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? refresh;
      }),
    );
  }
});
