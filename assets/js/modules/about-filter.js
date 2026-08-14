export function initAboutFilter() {
    const toggle = document.getElementById('academic-toggle');
    const showcase = document.getElementById('projects-showcase');
    const label = document.getElementById('academic-toggle-label');
    const toggleText = document.getElementById('academic-toggle-text');

    if (!toggle || !showcase) return;

    const txtShow = window.i18n?.academicToggleShow || 'Показать учебные';
    const txtHide = window.i18n?.academicToggleHide || 'Скрыть учебные';
    const titleShow = window.i18n?.academicToggleTitleShow || 'Показать учебные проекты';
    const titleHide = window.i18n?.academicToggleTitleHide || 'Скрыть учебные проекты';

    function applyFilter() {
        const showAcademic = Boolean(toggle.checked);
        const cards = showcase.querySelectorAll('.project-showcase-card');

        cards.forEach((card) => {
            const isAcademic = card.dataset.academic === 'true' || card.classList.contains('project-academic');
            if (isAcademic) {
                card.style.display = showAcademic ? 'flex' : 'none';
            }
        });

        if (toggleText) toggleText.textContent = showAcademic ? txtHide : txtShow;
        if (label) label.title = showAcademic ? titleHide : titleShow;
    }

    toggle.addEventListener('change', applyFilter);
    toggle.addEventListener('input', applyFilter);
    applyFilter();
}
