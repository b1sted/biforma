function extractCleanCode(codeElement) {
    if (!codeElement) return '';
    const clone = codeElement.cloneNode(true);
    clone.querySelectorAll('.lnt, .ln, .lntd:first-child').forEach((el) => el.remove());
    return clone.innerText.replace(/^\n+|\n+$/g, '');
}

export function initCompareBlocks() {
    initCompareScrollSync();
    initCompareCopyButtons();
}

function initCompareScrollSync() {
    const blocks = document.querySelectorAll('.code-compare');
    blocks.forEach((compareBlock) => {
        const leftContent = compareBlock.querySelector('.code-compare-left .code-compare-content');
        const rightContent = compareBlock.querySelector('.code-compare-right .code-compare-content');
        if (!leftContent || !rightContent) return;

        let isSyncing = false;

        const syncScroll = (source, target) => {
            if (isSyncing) return;
            isSyncing = true;

            const maxSource = source.scrollHeight - source.clientHeight;
            const maxTarget = target.scrollHeight - target.clientHeight;
            if (maxSource > 0 && maxTarget > 0) {
                target.scrollTop = (source.scrollTop / maxSource) * maxTarget;
            }

            requestAnimationFrame(() => {
                isSyncing = false;
            });
        };

        leftContent.addEventListener('scroll', () => syncScroll(leftContent, rightContent), { passive: true });
        rightContent.addEventListener('scroll', () => syncScroll(rightContent, leftContent), { passive: true });
    });
}

function initCompareCopyButtons() {
    const copiedText = window.i18n?.copiedText || 'Copied!';
    const defaultCopy = window.i18n?.copyText || 'Copy';

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.code-compare-header .copy-code-button');
        if (!btn || btn.classList.contains('copied')) return;

        const compareBlock = btn.closest('.code-compare-left, .code-compare-right');
        if (!compareBlock) return;

        const content = compareBlock.querySelector('.code-compare-content');
        const codeElement = content.querySelector('pre code, .chroma code');
        const textToCopy = codeElement ? extractCleanCode(codeElement) : content.innerText.trim();
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            btn.classList.add('copied');

            const textSpan = btn.querySelector('.copy-text') || btn.querySelector('span:last-child');
            const iconSpan = btn.querySelector('span:first-child');
            const oldText = textSpan ? textSpan.textContent : defaultCopy;
            const oldIcon = iconSpan ? iconSpan.textContent : '📋';

            if (textSpan) textSpan.textContent = copiedText;
            if (iconSpan) iconSpan.textContent = '✓';

            setTimeout(() => {
                btn.classList.remove('copied');
                if (textSpan) textSpan.textContent = oldText;
                if (iconSpan) iconSpan.textContent = oldIcon;
            }, 1500);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    });
}
