/**
 * Prefetches internal links when the user shows intent (hover or touch).
 */
export function initPrefetch() {
    if (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''))) {
        return;
    }

    const prefetched = new Set();

    function prefetch(href) {
        if (!href || prefetched.has(href)) return;

        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url.href;
        document.head.appendChild(link);
        prefetched.add(href);
    }

    function handleIntent(event) {
        if (!event.target || typeof event.target.closest !== 'function') return;

        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;

        prefetch(href);
    }

    document.addEventListener('pointerenter', handleIntent, { capture: true, passive: true });
    document.addEventListener('touchstart', handleIntent, { capture: true, passive: true });
}
