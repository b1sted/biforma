export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const toggle = document.querySelector('.menu-toggle');

    if (!sidebar || !overlay || !toggle) return;

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    sidebar.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) closeSidebar();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    desktopQuery.addEventListener('change', (e) => {
        if (e.matches) closeSidebar();
    });

    initSidebarGroupAccordion();
}

function initSidebarGroupAccordion() {
    const detailsElements = document.querySelectorAll('.sidebar .nav-group-details');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    detailsElements.forEach((details) => {
        const summary = details.querySelector('.nav-group-summary');
        const content = details.querySelector('.nav-list-nested');

        if (!summary || !content) return;
        let isAnimating = false;

        summary.addEventListener('click', (e) => {
            e.preventDefault();

            if (prefersReducedMotion) {
                details.open = !details.open;
                summary.setAttribute('aria-expanded', String(details.open));
                return;
            }

            if (isAnimating) return;
            isAnimating = true;

            if (details.open) {
                summary.setAttribute('aria-expanded', 'false');
                const animation = content.animate(
                    [
                        { opacity: 1, transform: 'translateY(0)', maxHeight: `${content.scrollHeight}px` },
                        { opacity: 0, transform: 'translateY(-8px)', maxHeight: '0px' }
                    ],
                    { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
                );

                animation.onfinish = () => {
                    details.open = false;
                    isAnimating = false;
                };
            } else {
                details.open = true;
                summary.setAttribute('aria-expanded', 'true');
                const animation = content.animate(
                    [
                        { opacity: 0, transform: 'translateY(-8px)', maxHeight: '0px' },
                        { opacity: 1, transform: 'translateY(0)', maxHeight: `${content.scrollHeight}px` }
                    ],
                    { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
                );

                animation.onfinish = () => {
                    isAnimating = false;
                };
            }
        });
    });
}
