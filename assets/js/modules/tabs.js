export function initTabs() {
    document.querySelectorAll('.code-tabs, .content-tabs').forEach((container) => {
        const content = container.querySelector('.tabs-content');
        const nav = container.querySelector('.tabs-nav');
        if (!content || !nav) return;

        const btns = Array.from(nav.querySelectorAll('.tab-btn'));
        const panels = Array.from(content.querySelectorAll('.tab-panel'));

        if (btns.length && panels.length) {
            btns.forEach((b, i) => b.classList.toggle('active', i === 0));
            panels.forEach((p, i) => p.classList.toggle('active', i === 0));
        }

        if (!container.dataset.tabsInitialized) {
            container.dataset.tabsInitialized = 'true';
            nav.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;

                const allBtns = Array.from(nav.querySelectorAll('.tab-btn'));
                const idx = allBtns.indexOf(btn);

                if (idx !== -1) {
                    allBtns.forEach((b, i) => {
                        b.classList.toggle('active', i === idx);
                        b.setAttribute('aria-selected', String(i === idx));
                    });
                    Array.from(content.querySelectorAll('.tab-panel')).forEach((p, i) => {
                        p.classList.toggle('active', i === idx);
                    });
                }
            });
        }
    });
}
