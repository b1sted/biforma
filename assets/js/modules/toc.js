export function initTocAndScroll() {
    const tocContainer = document.getElementById('TableOfContents') || document.getElementById('TableOfContentsMobile') || document.querySelector('.toc-nav');
    if (!tocContainer) return;

    const tocLinks = document.querySelectorAll('#TableOfContents a, #TableOfContentsMobile a, .toc-nav a, .sidebar-toc-nav a, .toc-mobile-nav a');
    if (!tocLinks.length) return;

    const headings = Array.from(document.querySelectorAll('.article h1, .article h2, .article h3, .article h4, .article h5, .article h6'));
    const idToHeaderMap = new Map();
    headings.forEach((h) => {
        if (h.id) idToHeaderMap.set(h.id, h);
    });

    const headerToLinksMap = new Map();
    const observedHeadings = [];

    function scrollToElement(targetElement, smooth = true) {
        if (!targetElement) return;

        const scrollContainer = document.querySelector('.main-content');
        const isMobile = window.innerWidth <= 1024;
        const behavior = smooth ? 'smooth' : 'auto';

        if (isMobile || !scrollContainer) {
            const headerOffset = 70;
            const top = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top, behavior });
        } else {
            const offset = 24;
            const top = targetElement.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop - offset;
            scrollContainer.scrollTo({ top, behavior });
        }
    }

    function handleInitialHash() {
        if (!window.location.hash) return;
        const id = decodeURIComponent(window.location.hash.substring(1));
        const target = idToHeaderMap.get(id);
        if (target) {
            requestAnimationFrame(() => scrollToElement(target, false));
        }
    }

    tocLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const id = decodeURIComponent(href.substring(1));
        const header = idToHeaderMap.get(id);

        if (header) {
            if (!headerToLinksMap.has(header)) {
                headerToLinksMap.set(header, []);
                observedHeadings.push(header);
            }
            headerToLinksMap.get(header).push(link);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                history.pushState(null, null, href);

                const mobileToc = link.closest('.toc-mobile');
                if (mobileToc) mobileToc.removeAttribute('open');

                scrollToElement(header, true);
            });
        }
    });

    handleInitialHash();

    if (!observedHeadings.length) return;

    observedHeadings.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    function scrollTocContainer(activeLink) {
        const tocSidebar = activeLink.closest('.toc-sidebar, .sidebar-toc-section');
        if (!tocSidebar) return;

        const linkRect = activeLink.getBoundingClientRect();
        const containerRect = tocSidebar.getBoundingClientRect();
        const margin = 50;
        const isOutOfView = (linkRect.top < containerRect.top + margin) ||
                            (linkRect.bottom > containerRect.bottom - margin);

        if (isOutOfView) {
            const targetScrollTop = activeLink.offsetTop - (tocSidebar.clientHeight / 2) + (activeLink.clientHeight / 2);
            tocSidebar.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
            });
        }
    }

    let lastActiveHeader = null;

    function setActiveHeading(activeHeader) {
        if (!activeHeader || activeHeader === lastActiveHeader) return;
        lastActiveHeader = activeHeader;

        tocLinks.forEach((l) => l.classList.remove('active'));
        const links = headerToLinksMap.get(activeHeader);
        if (links) {
            links.forEach((l) => {
                l.classList.add('active');
                scrollTocContainer(l);
            });
        }
    }

    const scrollContainer = document.querySelector('.main-content');
    const visibleHeadings = new Set();

    function updateActive() {
        const isMobile = window.innerWidth <= 1024;
        const currentScrollTop = (isMobile || !scrollContainer) ? window.scrollY : scrollContainer.scrollTop;

        if (currentScrollTop < 120) {
            setActiveHeading(observedHeadings[0]);
            return;
        }

        if (visibleHeadings.size > 0) {
            for (let i = 0; i < observedHeadings.length; i++) {
                if (visibleHeadings.has(observedHeadings[i])) {
                    setActiveHeading(observedHeadings[i]);
                    return;
                }
            }
        }

        const containerTop = (isMobile || !scrollContainer) ? 0 : scrollContainer.getBoundingClientRect().top;
        let currentActive = observedHeadings[0];
        for (let i = 0; i < observedHeadings.length; i++) {
            const rect = observedHeadings[i].getBoundingClientRect();
            if (rect.top - containerTop <= 100) {
                currentActive = observedHeadings[i];
            } else {
                break;
            }
        }
        setActiveHeading(currentActive);
    }

    let observer = null;

    function setupObserver() {
        if (observer) {
            observer.disconnect();
            visibleHeadings.clear();
        }

        const isMobile = window.innerWidth <= 1024;
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleHeadings.add(entry.target);
                } else {
                    visibleHeadings.delete(entry.target);
                }
            });
            updateActive();
        }, {
            root: isMobile ? null : scrollContainer,
            rootMargin: '-20px 0px -65% 0px',
            threshold: 0
        });

        observedHeadings.forEach((h) => observer.observe(h));
    }

    setupObserver();
    updateActive();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupObserver();
            updateActive();
        }, 100);
    }, { passive: true });

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActive();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    }
}
