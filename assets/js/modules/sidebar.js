function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const toggle = document.querySelector('.menu-toggle');

    if (!sidebar || !overlay || !toggle) return;

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }

    function toggleFn(forceClose) {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen || forceClose) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFn();
    });

    overlay.addEventListener('click', () => closeSidebar());

    // Close sidebar when clicking any link (critical for TOC anchor links)
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
    });

    initSidebarGroupAccordion();
}

/**
 * Smooth 60fps expand and collapse animation for sidebar <details> groups
 * using Web Animations API on the nested content container.
 */
function initSidebarGroupAccordion() {
    const detailsElements = document.querySelectorAll('.sidebar .nav-group-details');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!detailsElements.length) return;

    detailsElements.forEach((details) => {
        const summary = details.querySelector('.nav-group-summary');
        const content = details.querySelector('.nav-list-nested');

        if (!summary || !content) return;

        let isAnimating = false;

        summary.addEventListener('click', (e) => {
            e.preventDefault();

            if (prefersReducedMotion) {
                details.open = !details.open;
                summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
                return;
            }

            if (isAnimating) return;

            if (details.open) {
                // Smooth closing animation
                isAnimating = true;
                summary.setAttribute('aria-expanded', 'false');

                const animation = content.animate(
                    [
                        { opacity: 1, transform: 'translateY(0)', maxHeight: `${content.scrollHeight}px` },
                        { opacity: 0, transform: 'translateY(-8px)', maxHeight: '0px' }
                    ],
                    {
                        duration: 200,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                );

                animation.onfinish = () => {
                    details.open = false;
                    isAnimating = false;
                };
            } else {
                // Smooth opening animation
                isAnimating = true;
                details.open = true;
                summary.setAttribute('aria-expanded', 'true');

                const animation = content.animate(
                    [
                        { opacity: 0, transform: 'translateY(-8px)', maxHeight: '0px' },
                        { opacity: 1, transform: 'translateY(0)', maxHeight: `${content.scrollHeight}px` }
                    ],
                    {
                        duration: 200,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                );

                animation.onfinish = () => {
                    isAnimating = false;
                };
            }
        });
    });
}
