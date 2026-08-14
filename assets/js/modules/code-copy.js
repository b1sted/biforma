export function initCopyButtons() {
    const defaultDone = window.i18n?.doneText || 'Готово!';
    const defaultCopy = window.i18n?.copyText || 'Копировать';

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.copy-code-button, .tab-copy-btn, .rss-copy-btn');
        if (!btn) return;

        let text = '';
        if (btn.closest('.rss-feed-card')) {
            text = btn.closest('.rss-feed-card').dataset.rssUrl;
        } else {
            const wrapper = btn.closest('.code-block-wrapper, .code-tabs, .content-tabs');
            const code = wrapper ? (wrapper.querySelector('.tab-panel.active code') || wrapper.querySelector('code')) : null;
            text = code ? code.innerText : '';
        }

        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                btn.classList.add('copied');
                const span = btn.querySelector('.copy-text') || btn.querySelector('span:last-child');
                const old = span ? span.textContent : '';
                if (span) span.textContent = defaultDone;
                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (span) span.textContent = old === defaultDone ? defaultCopy : old;
                }, 1200);
            } catch (err) {
                console.error('Failed to copy text:', err);
            }
        }
    });
}
