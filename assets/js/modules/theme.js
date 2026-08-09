function initTheme() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (!toggleBtn) return;

    const updateIcons = function (theme) {
        const sun = document.getElementById('theme-icon-sun');
        const moon = document.getElementById('theme-icon-moon');
        if (sun && moon) {
            sun.style.display = theme === 'light' ? 'block' : 'none';
            moon.style.display = theme === 'dark' ? 'block' : 'none';
        }
    };

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateIcons(currentTheme);

    toggleBtn.addEventListener('click', function () {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';

        html.classList.add('theme-transition');
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcons(next);

        setTimeout(function () {
            html.classList.remove('theme-transition');
        }, 150);
    });
}
