(function () {
    if (typeof renderMathInElement !== 'function') return;
    renderMathInElement(document.querySelector('.article') || document.body, {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
    });
})();
