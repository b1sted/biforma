const CACHE_VERSION = 'v1';
const CACHE_NAME = `biforma-${CACHE_VERSION}`;

const BASE = new URL('./', self.location.href).pathname;

const PRECACHE_URLS = [
    BASE,
    `${BASE}offline.html`,
    `${BASE}manifest.json`,
    `${BASE}icons.svg`,
    `${BASE}icons/icon-192.png`,
    `${BASE}icons/icon-512.png`
];

const STATIC_EXTENSIONS = ['.woff2', '.svg', '.png', '.ico', '.css', '.js'];

function isStaticAsset(pathname) {
    return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith(`${BASE}pagefind/`)) return;

    if (isStaticAsset(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    if (event.request.mode === 'navigate') {
                        return caches.match(`${BASE}offline.html`);
                    }
                })
            )
    );
});
