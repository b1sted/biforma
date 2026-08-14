export function initResponsiveTables() {
    document.querySelectorAll('.article table').forEach((table) => {
        if (table.parentElement && table.parentElement.classList.contains('table-scroll-wrapper')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}
