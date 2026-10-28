/**
 * Lazily loads deferred images and sources marked with data-src/data-srcset.
 */
export function initLazyLoading() {
    const targets = document.querySelectorAll('img[data-src], img[data-srcset], source[data-srcset]');
    if (!targets.length) return;

    function load(target) {
        if (target.dataset.src) {
            target.src = target.dataset.src;
            target.removeAttribute('data-src');
        }
        if (target.dataset.srcset) {
            target.srcset = target.dataset.srcset;
            target.removeAttribute('data-srcset');
        }
        target.removeAttribute('data-lazy');
    }

    if (!('IntersectionObserver' in window)) {
        targets.forEach(load);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            load(entry.target);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '50px' });

    targets.forEach((target) => observer.observe(target));
}
