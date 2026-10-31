export function initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;

    const scrollContainer = document.querySelector('.main-content');
    let isVisible = false;

    const toggleBtn = () => {
        const top = Math.max(
            window.scrollY || 0,
            document.documentElement.scrollTop || 0,
            scrollContainer ? scrollContainer.scrollTop : 0
        );
        const shouldShow = top > 250;
        if (shouldShow !== isVisible) {
            isVisible = shouldShow;
            btn.classList.toggle('visible', isVisible);
        }
    };

    btn.addEventListener('click', (e) => {
        if (e && e.cancelable) e.preventDefault();
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const behavior = reduceMotion ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior });
        document.documentElement.scrollTo({ top: 0, behavior });
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior });
    });

    window.addEventListener('scroll', toggleBtn, { passive: true });
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', toggleBtn, { passive: true });
    }
    toggleBtn();
}
