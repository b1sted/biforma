function notifyThemeChange(theme) {
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function initTheme() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';

        html.classList.add('theme-transition');
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        notifyThemeChange(next);

        setTimeout(() => {
            html.classList.remove('theme-transition');
        }, 150);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            notifyThemeChange(newTheme);
        }
    });
}
