/**
 * Registers the theme service worker after page load without blocking rendering.
 */
export function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        const basePath = document.documentElement.dataset.baseUrl || '/';
        const scope = basePath.endsWith('/') ? basePath : `${basePath}/`;
        const swUrl = `${scope}sw.js`;

        navigator.serviceWorker.register(swUrl, { scope }).then((registration) => {
            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                if (!worker) return;
                worker.addEventListener('statechange', () => {
                    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.info('A new version is available. Reload to update.');
                    }
                });
            });
        }).catch((error) => {
            console.warn('Service worker registration failed:', error);
        });
    }, { once: true });
}
