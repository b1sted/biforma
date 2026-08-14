import { initTheme } from './modules/theme.js';
import { initSidebar } from './modules/sidebar.js';
import { initTocAndScroll } from './modules/toc.js';
import { initTabs } from './modules/tabs.js';
import { initEmailProtection } from './modules/email-protection.js';
import { initAboutFilter } from './modules/about-filter.js';
import { initSearch } from './modules/search.js';
import { initCopyButtons } from './modules/code-copy.js';
import { initRssFeeds } from './modules/rss-feeds.js';
import { initCompareBlocks } from './modules/compare.js';
import { initLicenseModal } from './modules/license.js';
import { initResponsiveTables } from './modules/tables.js';
import { setupLightboxTriggers } from './modules/lightbox.js';

function runCriticalInit() {
    initTheme();
    initSidebar();
    initEmailProtection();
    if (document.getElementById('academic-toggle')) initAboutFilter();

    // Time-sliced non-critical initialization to prevent long tasks (TBT optimization)
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
        () => { if (document.querySelector('.rss-feed-card')) initRssFeeds(); },
        () => { if (document.querySelector('.js-license-trigger')) initLicenseModal(); }
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

function initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;

    const scrollContainer = document.querySelector('.main-content');
    let isVisible = false;

    const toggleBtn = () => {
        const top = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
        const shouldShow = top > 250;
        if (shouldShow !== isVisible) {
            isVisible = shouldShow;
            btn.classList.toggle('visible', isVisible);
        }
    };

    btn.addEventListener('click', (e) => {
        if (e && e.cancelable) e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggleBtn, { passive: true });
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', toggleBtn, { passive: true });
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
