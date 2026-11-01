const MOBILE_QUERY = '(max-width: 1024px)';
const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'summary',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const toggle = document.querySelector('.menu-toggle');

    if (!sidebar || !overlay || !toggle) return;

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    let lastFocusedElement = null;

    const isMobile = () => mobileQuery.matches;
    const isOpen = () => sidebar.classList.contains('open');

    const getFocusableElements = () =>
        Array.from(sidebar.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
            (element) =>
                !element.hasAttribute('disabled') &&
                (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0)
        );

    /**
     * A closed drawer must not stay in the tab order. `inert` removes the
     * whole navigation from keyboard and assistive-technology access while
     * keeping the slide animation intact.
     */
    function syncDrawerState() {
        if (!isMobile()) {
            sidebar.inert = false;
            return;
        }
        sidebar.inert = !isOpen();
    }

    function closeSidebar({ restoreFocus = false } = {}) {
        const wasOpen = isOpen();

        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        syncDrawerState();

        if (wasOpen && restoreFocus) {
            const target =
                lastFocusedElement && lastFocusedElement.isConnected ? lastFocusedElement : toggle;
            target.focus({ preventScroll: true });
        }
    }

    function openSidebar() {
        lastFocusedElement = document.activeElement;
        sidebar.classList.add('open');
        overlay.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        syncDrawerState();

        const focusable = getFocusableElements();
        const first = focusable[0] || sidebar;
        first.focus({ preventScroll: true });
    }

    toggle.setAttribute('aria-expanded', 'false');
    syncDrawerState();

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (isOpen()) {
            closeSidebar({ restoreFocus: true });
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', () => closeSidebar({ restoreFocus: true }));

    sidebar.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (isOpen()) closeSidebar();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (!isOpen()) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeSidebar({ restoreFocus: true });
            return;
        }

        if (event.key !== 'Tab' || !isMobile()) return;

        const focusable = getFocusableElements();
        if (!focusable.length) {
            event.preventDefault();
            sidebar.focus({ preventScroll: true });
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!sidebar.contains(document.activeElement)) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        }
    });

    mobileQuery.addEventListener('change', () => {
        if (!isMobile()) {
            closeSidebar();
        } else {
            syncDrawerState();
        }
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
