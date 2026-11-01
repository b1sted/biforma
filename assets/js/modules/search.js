function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sanitizeTitle(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return escapeHTML(txt.value);
}

export function initSearch() {
    const searchTrigger = document.querySelector('.search-trigger');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const closeBtn = document.querySelector('.search-modal-close');
    const backdrop = document.querySelector('.search-modal-backdrop');

    let pagefind = null;
    let timeoutId = null;
    let currentSearchId = 0;
    let previousActiveElement = null;

    const noResultsText = window.i18n?.searchNoResults || 'No results found';
    const indexMissingText = window.i18n?.searchIndexMissing || 'Error: search index not found.<br>Run: <code>npx pagefind --site public</code>';
    const hasLanguageFilter = Boolean(document.querySelector('[data-pagefind-filter="language"]'));

    const loadPagefind = async () => {
        if (pagefind) return;
        try {
            const basePath = document.documentElement.dataset.baseUrl || '/';
            const pagefindUrl = `${basePath.endsWith('/') ? basePath : basePath + '/'}pagefind/pagefind.js`;
            pagefind = await import(pagefindUrl);
            if (pagefind.init) await pagefind.init();
        } catch (e) {
            console.error('Pagefind failed to load:', e);
            if (resultsContainer) {
                resultsContainer.innerHTML = `<div class="search-hint">${indexMissingText}</div>`;
            }
        }
    };

    const closeSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        sidebar?.classList.remove('open');
        overlay?.classList.remove('show');
        document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
    };

    const openModal = async () => {
        if (!modal) return;
        previousActiveElement = document.activeElement;
        closeSidebar();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => { if (input) input.focus(); }, 50);
        await loadPagefind();
    };

    const closeModal = () => {
        if (!modal) return;
        clearTimeout(timeoutId);
        modal.classList.remove('active');
        if (!document.getElementById('sidebar')?.classList.contains('open')) {
            document.body.style.overflow = '';
        }
        if (input) input.value = '';
        if (resultsContainer) resultsContainer.innerHTML = '';
        currentSearchId++;
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
        }
    };

    const renderResults = async (searchResult, searchId) => {
        if (searchId !== currentSearchId) return;

        if (!searchResult.results.length) {
            resultsContainer.innerHTML = `<div class="search-no-results"><div class="search-no-results-icon">😕</div><div class="search-no-results-text">${noResultsText}</div></div>`;
            return;
        }

        const topResults = searchResult.results.slice(0, 10);
        const data = await Promise.all(topResults.map((r) => r.data()));
        if (searchId !== currentSearchId) return;

        resultsContainer.innerHTML = data.map((item) => `
            <a href="${item.url}" class="search-result-item">
                <div class="search-result-header">
                    <div class="search-result-icon">📄</div>
                    <div class="search-result-title">${sanitizeTitle(item.meta.title)}</div>
                </div>
                <div class="search-result-preview">${item.excerpt}</div>
            </a>
        `).join('');
    };

    const handleInput = (e) => {
        const query = e.target.value.trim();
        clearTimeout(timeoutId);

        if (!query) {
            currentSearchId++;
            resultsContainer.innerHTML = '';
            return;
        }

        timeoutId = setTimeout(async () => {
            const searchId = ++currentSearchId;
            if (!pagefind) await loadPagefind();
            if (pagefind) {
                const cleanQuery = query.replace(/^[<(\[{'"`\\/]+|[>)}\]'"`\\/]+$/g, '').trim() || query;
                const lang = (document.documentElement.lang || 'ru').split('-')[0];
                const options = hasLanguageFilter ? { filters: { language: lang } } : undefined;
                const search = await pagefind.search(cleanQuery, options);
                if (searchId === currentSearchId && search) {
                    renderResults(search, searchId);
                }
            }
        }, 150);
    };

    searchTrigger?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    document.querySelector('.search-trigger-mobile')?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    input?.addEventListener('input', handleInput);
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            e.preventDefault();
            modal?.classList.contains('active') ? closeModal() : openModal();
            return;
        }

        if (!modal?.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (!focusables.length) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}
