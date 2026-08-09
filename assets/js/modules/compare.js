function initCompareBlocks() {
    initCompareScrollSync();
    initCompareCopyButtons();
}

function initCompareScrollSync() {
    const blocks = document.querySelectorAll('.code-compare');
    blocks.forEach((compareBlock) => {
        const leftBlock = compareBlock.querySelector('.code-compare-left');
        const rightBlock = compareBlock.querySelector('.code-compare-right');
        if (leftBlock && rightBlock) {
            syncCompareScroll(leftBlock, rightBlock);
        }
    });
}

function syncCompareScroll(leftBlock, rightBlock) {
    const leftContent = leftBlock.querySelector('.code-compare-content');
    const rightContent = rightBlock.querySelector('.code-compare-content');
    if (!leftContent || !rightContent) return;

    let isLeftScrolling = false;
    let isRightScrolling = false;

    leftContent.addEventListener('scroll', () => {
        if (isRightScrolling) return;
        isLeftScrolling = true;
        const maxLeft = leftContent.scrollHeight - leftContent.clientHeight;
        if (maxLeft > 0) {
            const pct = leftContent.scrollTop / maxLeft;
            const maxRight = rightContent.scrollHeight - rightContent.clientHeight;
            rightContent.scrollTop = pct * maxRight;
        }
        setTimeout(() => { isLeftScrolling = false; }, 50);
    }, { passive: true });

    rightContent.addEventListener('scroll', () => {
        if (isLeftScrolling) return;
        isRightScrolling = true;
        const maxRight = rightContent.scrollHeight - rightContent.clientHeight;
        if (maxRight > 0) {
            const pct = rightContent.scrollTop / maxRight;
            const maxLeft = leftContent.scrollHeight - leftContent.clientHeight;
            leftContent.scrollTop = pct * maxLeft;
        }
        setTimeout(() => { isRightScrolling = false; }, 50);
    }, { passive: true });
}

function initCompareCopyButtons() {
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.code-compare-header .copy-code-button');
        if (!btn) return;

        const compareBlock = btn.closest('.code-compare-left, .code-compare-right');
        if (!compareBlock) return;

        const content = compareBlock.querySelector('.code-compare-content');
        let textToCopy = '';
        const codeElement = content.querySelector('pre code, .chroma code');
        if (codeElement) {
            textToCopy = codeElement.innerText;
        } else {
            textToCopy = content.innerText;
        }
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalContent = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '<span>\u2713</span><span>\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e!</span>';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalContent;
            }, 2000);
        } catch (err) {
            console.error('\u041e\u0448\u0438\u0431\u043a\u0430 \u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f:', err);
        }
    });
}
