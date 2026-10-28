import { storage } from './storage.js';

const COLLAPSED_KEY = 'section-navbox-collapsed';

export function initSectionNavbox() {
    const navbox = document.getElementById('section-navbox');
    const toggle = document.getElementById('section-navbox-toggle');
    if (!navbox || !toggle) return;

    const icon = toggle.querySelector('.section-navbox-toggle-icon');

    function applyState(collapsed) {
        navbox.classList.toggle('collapsed', collapsed);
        toggle.setAttribute('aria-expanded', String(!collapsed));
        if (icon) icon.textContent = collapsed ? '+' : '−';
    }

    applyState(storage.get(COLLAPSED_KEY, false) === true);

    toggle.addEventListener('click', () => {
        const collapsed = !navbox.classList.contains('collapsed');
        applyState(collapsed);
        storage.set(COLLAPSED_KEY, collapsed);
    });
}
