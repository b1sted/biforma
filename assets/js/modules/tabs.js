export function initTabs() {
    document.querySelectorAll('.code-tabs, .content-tabs').forEach((container) => {
        const content = container.querySelector('.tabs-content');
        const nav = container.querySelector('.tabs-nav');
        if (!content || !nav) return;

        const btns = Array.from(nav.querySelectorAll('.tab-btn'));
        const panels = Array.from(content.children).filter((el) => el.classList.contains('tab-panel'));

        const activate = (idx, focus = false) => {
            btns.forEach((btn, i) => {
                const selected = i === idx;
                btn.classList.toggle('active', selected);
                btn.setAttribute('aria-selected', String(selected));
                btn.setAttribute('tabindex', selected ? '0' : '-1');
                if (selected && focus) btn.focus();
            });
            panels.forEach((panel, i) => {
                panel.classList.toggle('active', i === idx);
            });
        };

        if (btns.length && panels.length) {
            activate(0);
        }

        if (!container.dataset.tabsInitialized) {
            container.dataset.tabsInitialized = 'true';
            nav.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                const idx = btns.indexOf(btn);
                if (idx !== -1) activate(idx);
            });

            nav.addEventListener('keydown', (e) => {
                const current = btns.indexOf(document.activeElement);
                if (current === -1) return;

                let next = null;
                if (e.key === 'ArrowRight') next = (current + 1) % btns.length;
                else if (e.key === 'ArrowLeft') next = (current - 1 + btns.length) % btns.length;
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = btns.length - 1;

                if (next !== null) {
                    e.preventDefault();
                    activate(next, true);
                }
            });
        }
    });
}
