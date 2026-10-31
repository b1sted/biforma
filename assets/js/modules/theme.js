function notifyThemeChange(theme) {
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function updateToggleState(toggleBtn) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    toggleBtn.setAttribute('aria-pressed', String(isLight));
}

export function initTheme() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (!toggleBtn) return;

    updateToggleState(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';

        html.classList.add('theme-transition');
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateToggleState(toggleBtn);
        notifyThemeChange(next);

        setTimeout(() => {
            html.classList.remove('theme-transition');
        }, 150);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateToggleState(toggleBtn);
            notifyThemeChange(newTheme);
        }
    });
}
