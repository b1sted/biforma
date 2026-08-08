/**
 * Calls init functions. Critical UI functions run immediately;
 * remaining features are chunked via requestIdleCallback.
 */
function runInit() {
    if (typeof initTheme === 'function') initTheme();
    if (typeof initSidebar === 'function') initSidebar();
    if (typeof initTocAndScroll === 'function') initTocAndScroll();
    if (typeof initTabs === 'function') initTabs();

    const phase2 = () => {
        if (typeof initSearch === 'function') initSearch();
        if (typeof initCopyButtons === 'function') initCopyButtons();
        if (typeof initRssFeeds === 'function') initRssFeeds();
        if (typeof initCompareBlocks === 'function') initCompareBlocks();
        if (typeof initLicenseModal === 'function') initLicenseModal();
        if (typeof initResponsiveTables === 'function') initResponsiveTables();
        if (typeof setupLightboxTriggers === 'function') setupLightboxTriggers();

        initScrollTop();
        initSectionFilter();
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(phase2);
    } else {
        setTimeout(phase2, 100);
    }
}

function init() {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(runInit);
    } else {
        setTimeout(runInit, 50);
    }
}

function initSectionFilter() {
    const filterBar = document.querySelector('.section-filter-bar');
    if (!filterBar) return;

    const filterBtns = filterBar.querySelectorAll('.section-filter-btn');
    const groupBlocks = document.querySelectorAll('.section-group-block');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetGroup = btn.dataset.group;

            filterBtns.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });

            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            groupBlocks.forEach((block) => {
                if (targetGroup === 'all' || block.dataset.group === targetGroup) {
                    block.style.display = '';
                } else {
                    block.style.display = 'none';
                }
            });
        });
    });
}

function initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;

    const scrollContainer = document.querySelector('.main-content');

    const toggleBtn = () => {
        const top = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
        if (top > 100) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    };

    const scrollToTop = (e) => {
        if (e && e.cancelable) e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    };

    btn.addEventListener('click', scrollToTop);
    btn.addEventListener('touchend', scrollToTop, { passive: false });

    window.addEventListener('scroll', toggleBtn, { passive: true });
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', toggleBtn, { passive: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
