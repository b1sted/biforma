import { initTheme } from './modules/theme.js';
import { initSidebar } from './modules/sidebar.js';
import { initTocAndScroll } from './modules/toc.js';
import { initTabs } from './modules/tabs.js';
import { initEmailProtection } from './modules/email-protection.js';
import { initAboutFilter } from './modules/about-filter.js';
import { initSearch } from './modules/search.js';
import { initCopyButtons } from './modules/code-copy.js';
import { initCompareBlocks } from './modules/compare.js';
import { initLicenseModal } from './modules/license.js';
import { initResponsiveTables } from './modules/tables.js';
import { setupLightboxTriggers } from './modules/lightbox.js';
import { initMermaid } from './modules/mermaid.js';

function runCriticalInit() {
    initTheme();
    initSidebar();
    initEmailProtection();
    if (document.getElementById('academic-toggle')) initAboutFilter();

    // Track last valid non-404 page for seamless back navigation
    const is404 = document.querySelector('.error-page-wrapper') !== null;
    if (!is404) {
        try {
            sessionStorage.setItem('last_valid_page', window.location.href);
        } catch (e) {}
    } else {
        init404BackButton();
    }

    const tasks = [
        () => { if (document.getElementById('TableOfContents') || document.querySelector('.toc-nav')) initTocAndScroll(); },
        () => { if (document.querySelector('.code-tabs, .content-tabs')) initTabs(); },
        () => { if (document.querySelector('.code-compare')) initCompareBlocks(); },
        () => { if (document.querySelector('.article table')) initResponsiveTables(); },
        () => { initCopyButtons(); },
        () => { initSearch(); },
        () => { setupLightboxTriggers(); },
        () => { initScrollTop(); },
        () => { if (document.querySelector('.section-filter-bar')) initSectionFilter(); },
        () => { if (document.querySelector('.js-license-trigger')) initLicenseModal(); },
        () => { if (document.querySelector('.mermaid')) initMermaid(); }
    ];

    function processTaskQueue() {
        if (tasks.length === 0) return;
        const task = tasks.shift();
        try { task(); } catch (e) {}

        if ('requestIdleCallback' in window) {
            requestIdleCallback(processTaskQueue);
        } else {
            setTimeout(processTaskQueue, 16);
        }
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(processTaskQueue);
    } else {
        setTimeout(processTaskQueue, 50);
    }
}

function init404BackButton() {
    const btn = document.getElementById('btn-go-back');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        let lastPage = null;
        try {
            lastPage = sessionStorage.getItem('last_valid_page');
        } catch (err) {}

        if (lastPage && lastPage !== window.location.href) {
            window.location.href = lastPage;
        } else if (document.referrer && document.referrer.startsWith(window.location.origin) && document.referrer !== window.location.href) {
            window.location.href = document.referrer;
        } else {
            window.location.href = btn.dataset.homeUrl || '/';
        }
    });
}

function initScrollTop() {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggleBtn, { passive: true });
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', toggleBtn, { passive: true });
    }
    toggleBtn();
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
                block.style.display = (targetGroup === 'all' || block.dataset.group === targetGroup) ? '' : 'none';
            });
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCriticalInit);
} else {
    runCriticalInit();
}
