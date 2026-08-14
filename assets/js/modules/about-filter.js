(function () {
    'use strict';

    function initAboutFilter() {
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
            const showAcademic = toggle.checked;
            const cards = showcase.querySelectorAll('.project-showcase-card');

            cards.forEach(function (card) {
                const isAcademic = card.dataset.academic === 'true';
                card.style.display = (!showAcademic && isAcademic) ? 'none' : '';
            });

            if (toggleText) toggleText.textContent = showAcademic ? txtHide : txtShow;
            if (label) label.title = showAcademic ? titleHide : titleShow;
        }

        toggle.addEventListener('change', applyFilter);
        applyFilter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAboutFilter);
    } else {
        initAboutFilter();
    }
})();
