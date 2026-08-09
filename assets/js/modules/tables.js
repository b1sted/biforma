function initResponsiveTables() {
    const tables = document.querySelectorAll('.article table');
    if (!tables.length) return;

    const wrapTables = () => {
        tables.forEach((table) => {
            if (table.parentElement && table.parentElement.classList.contains('table-scroll-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'table-scroll-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(wrapTables);
    } else {
        setTimeout(wrapTables, 100);
    }
}
