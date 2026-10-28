export function initSectionFilter() {
    const filterBar = document.querySelector('.section-filter-bar');
    if (!filterBar) return;

    const filterButtons = filterBar.querySelectorAll('.section-filter-btn');
    const groupBlocks = document.querySelectorAll('.section-group-block');

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetGroup = button.dataset.group;

            filterButtons.forEach((item) => {
                item.classList.remove('active');
                item.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            groupBlocks.forEach((block) => {
                block.style.display = (targetGroup === 'all' || block.dataset.group === targetGroup) ? '' : 'none';
            });
        });
    });
}
