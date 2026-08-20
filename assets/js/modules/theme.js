import { renderAllMermaid } from './mermaid.js';

export function initTheme() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (!toggleBtn) return;

    const updateIcons = (theme) => {
        const sun = document.getElementById('theme-icon-sun');
        const moon = document.getElementById('theme-icon-moon');
        if (sun && moon) {
            sun.style.display = theme === 'dark' ? 'block' : 'none';
            moon.style.display = theme === 'light' ? 'block' : 'none';
        }
    };

    const getPreferredTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };

    const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    updateIcons(currentTheme);

    toggleBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';

        html.classList.add('theme-transition');
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcons(next);

        if (document.querySelector('.mermaid')) {
            renderAllMermaid();
        }

        setTimeout(() => {
            html.classList.remove('theme-transition');
        }, 150);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateIcons(newTheme);
            if (document.querySelector('.mermaid')) {
                renderAllMermaid();
            }
        }
    });
}
