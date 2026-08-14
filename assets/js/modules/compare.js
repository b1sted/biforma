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

        let activeSide = null;

        const syncScroll = (source, target) => {
            if (activeSide && activeSide !== source) return;
            activeSide = source;

            requestAnimationFrame(() => {
                const maxSource = source.scrollHeight - source.clientHeight;
                const maxTarget = target.scrollHeight - target.clientHeight;
                if (maxSource > 0) {
                    target.scrollTop = (source.scrollTop / maxSource) * maxTarget;
                }
                activeSide = null;
            });
        };

        leftContent.addEventListener('scroll', () => syncScroll(leftContent, rightContent), { passive: true });
        rightContent.addEventListener('scroll', () => syncScroll(rightContent, leftContent), { passive: true });
    });
}

function initCompareCopyButtons() {
    const copiedText = window.i18n?.copiedText || 'Скопировано!';

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.code-compare-header .copy-code-button');
        if (!btn) return;

        const compareBlock = btn.closest('.code-compare-left, .code-compare-right');
        if (!compareBlock) return;

        const content = compareBlock.querySelector('.code-compare-content');
        const codeElement = content.querySelector('pre code, .chroma code');
        const textToCopy = codeElement ? codeElement.innerText : content.innerText;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalContent = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = `<span>✓</span><span>${copiedText}</span>`;
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalContent;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    });
}
