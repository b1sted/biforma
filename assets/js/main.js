import { initTheme } from './modules/theme.js';
import { initSidebar } from './modules/sidebar.js';
import { initEmailProtection } from './modules/email-protection.js';
import { initDefine } from './modules/define.js';
import { initSearch } from './modules/search.js';
import { initLicenseModal } from './modules/license.js';
import { initServiceWorker } from './modules/service-worker.js';
import { initPrefetch } from './modules/prefetch.js';
import { initLazyLoading } from './modules/lazy-loading.js';
import { initScrollTop } from './modules/scroll-top.js';
import { initErrorPage } from './modules/error-page.js';

function trackLastPage() {
    const is404 = document.querySelector('.error-page-wrapper') !== null;
    if (is404) return;

    try {
        sessionStorage.setItem('last_valid_page', window.location.href);
    } catch (error) {}
}

function scheduleTasks(tasks) {
    if (!tasks.length) return;

    const processTaskQueue = () => {
        const task = tasks.shift();
        if (!task) return;
        try {
            task();
        } catch (error) {}
        if (tasks.length) scheduleNext(processTaskQueue);
    };

    scheduleNext(processTaskQueue);
}

function scheduleNext(callback) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        setTimeout(callback, 16);
    }
}

export function boot(tasks = []) {
    const run = () => {
        initTheme();
        initSidebar();
        initEmailProtection();
        initDefine();
        initSearch();
        initLicenseModal();
        initScrollTop();
        initErrorPage();
        initPrefetch();
        initLazyLoading();
        initServiceWorker();
        trackLastPage();
        scheduleTasks(tasks);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
}
