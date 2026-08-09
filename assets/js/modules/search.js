function initSearch() {
    const searchTrigger = document.querySelector('.search-trigger');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const closeBtn = document.querySelector('.search-modal-close');
    const backdrop = document.querySelector('.search-modal-backdrop');

    let pagefind = null;
    let timeoutId = null;

    const noResultsText = window.i18n?.searchNoResults || 'Ничего не найдено';
    const indexMissingText = window.i18n?.searchIndexMissing || 'Ошибка: Индекс поиска не найден.<br>Выполните: <code>npx pagefind --site public</code>';

    const loadPagefind = async () => {
        if (pagefind) return;
        try {
            pagefind = await import('/pagefind/pagefind.js');
            if (pagefind.init) await pagefind.init();
        } catch (e) {
            console.error('Pagefind failed to load:', e);
            if (resultsContainer) {
                resultsContainer.innerHTML = `<div class="search-hint">${indexMissingText}</div>`;
            }
        }
    };

    const openModal = async () => {
        if (!modal) return;
        modal.classList.add('active');
        setTimeout(() => { if (input) input.focus(); }, 100);
        await loadPagefind();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        if (input) input.value = '';
        if (resultsContainer) resultsContainer.innerHTML = '';
    };

    const renderResults = async (searchResult) => {
        if (!searchResult.results.length) {
            resultsContainer.innerHTML = `<div class="search-no-results"><div class="search-no-results-icon">😕</div><div class="search-no-results-text">${noResultsText}</div></div>`;
            return;
        }

        const topResults = searchResult.results.slice(0, 10);
        const dataPromises = topResults.map((r) => r.data());
        const data = await Promise.all(dataPromises);

        const html = data.map((item) => {
            return `<a href="${item.url}" class="search-result-item"><div class="search-result-header"><div class="search-result-icon">📄</div><div class="search-result-title">${item.meta.title}</div></div><div class="search-result-preview">${item.excerpt}</div></a>`;
        }).join('');

        resultsContainer.innerHTML = html;
    };

    const handleInput = (e) => {
        const query = e.target.value.trim();
        clearTimeout(timeoutId);

        if (!query) {
            resultsContainer.innerHTML = '';
            return;
        }

        timeoutId = setTimeout(async () => {
            if (!pagefind) await loadPagefind();
            if (pagefind) {
                const search = await pagefind.search(query);
                renderResults(search);
            }
        }, 200);
    };

    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    const searchTriggerMobile = document.querySelector('.search-trigger-mobile');
    if (searchTriggerMobile) {
        searchTriggerMobile.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (input) input.addEventListener('input', handleInput);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            e.preventDefault();
            openModal();
        }
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}
