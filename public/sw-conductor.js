/**
 * Service worker de la app del conductor — ÚNICAMENTE `/conductor`.
 *
 * Escrito a mano (sin Workbox ni ninguna librería) para que sea legible por
 * cualquiera que herede este código. Se registra con
 * `scope: '/conductor'` desde `src/components/conductor/registerSW.ts`, así
 * que el navegador nunca lo deja controlar `/panel` ni ninguna otra ruta,
 * aunque este archivo viva en `public/` (origen compartido).
 *
 * Estrategia:
 *  - Instalación: precachea el "app shell" (documento de /conductor, manifest
 *    e iconos) para que la app abra aunque no haya red.
 *  - Navegación (`GET`, `mode: 'navigate'`) dentro de `/conductor`:
 *    network-first, con fallback a caché si no hay red.
 *  - Peticiones a `/api/v1/*`:
 *      - Solo se cachean lecturas seguras (`GET`). Si la petición falla
 *        (offline, o el endpoint aún no existe → 404/500 porque el backend
 *        no está desplegado todavía), se intenta servir desde caché y, si no
 *        hay nada cacheado, se deja que el error de red se propague tal cual
 *        — no se inventa una respuesta.
 *      - Los métodos de mutación (POST/PUT/PATCH/DELETE) NUNCA se
 *        interceptan ni se cachean: la app del conductor ya tiene su propia
 *        cola offline en memoria (ver `useConductor.ts` / `s.queue`), y
 *        cachear aquí duplicaría esa cola y podría reproducir una mutación
 *        dos veces. Estas peticiones van directas a `fetch`, sin pasar por
 *        el service worker.
 *  - Cualquier otra petición (assets estáticos de Next dentro de scope, CSS,
 *    JS, fuentes): cache-first con actualización en segundo plano
 *    (stale-while-revalidate) para que la app sea rápida y funcione offline.
 */

const SW_VERSION = 'v1';
const CACHE_NAME = `mecanu-conductor-${SW_VERSION}`;
const SCOPE_PATH = '/conductor';

// App shell mínimo: lo imprescindible para que la ruta abra en frío y sin red.
const APP_SHELL = ['/conductor', '/manifest.json', '/icons/icon.svg', '/icons/icon-maskable.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // addAll aborta todo si una sola falla; añadimos una a una para que un
      // recurso ausente (p.ej. en desarrollo) no tumbe el precache entero.
      await Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {
            /* recurso no disponible todavía: se cacheará on-demand cuando exista */
          })
        )
      );
    })()
  );
  // Activa esta versión sin esperar a que se cierren las pestañas abiertas.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('mecanu-conductor-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

function isMutation(method) {
  return method !== 'GET' && method !== 'HEAD';
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/v1/');
}

/** Network-first para el documento de navegación de /conductor. */
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    // Solo cacheamos respuestas válidas del propio scope.
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shell = await cache.match(SCOPE_PATH);
    if (shell) return shell;
    throw new Error('offline y sin caché disponible para la navegación');
  }
}

/**
 * Lecturas GET a /api/v1/*: network-first con fallback a caché. Tolerante a
 * que el backend todavía no exista (404/500) — en ese caso simplemente no se
 * cachea la respuesta y se deja pasar el error, sin fabricar datos falsos.
 */
async function handleApiGet(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('offline y sin caché disponible para esta lectura');
  }
}

/** Cache-first con revalidación en segundo plano para assets estáticos. */
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // No bloqueamos la respuesta con la revalidación, pero dejamos que corra.
    network.catch(() => {});
    return cached;
  }
  const fresh = await network;
  if (fresh) return fresh;
  throw new Error('offline y sin caché disponible para este recurso');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Fuera del scope de /conductor (o del mismo origen): no tocar.
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE_PATH) && !isApiRequest(url)) return;

  // Mutaciones: nunca interceptar. La cola offline de la app las gestiona.
  if (isMutation(request.method)) return;

  // Peticiones a la futura API.
  if (isApiRequest(url)) {
    event.respondWith(handleApiGet(request));
    return;
  }

  // Navegación al documento de /conductor.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Resto de assets estáticos (JS/CSS/fuentes/iconos) dentro del scope.
  event.respondWith(handleStaticAsset(request));
});
