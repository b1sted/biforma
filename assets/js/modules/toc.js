function initTocAndScroll() {
    const scrollContainer = document.querySelector('.main-content');
    const tocLinks = document.querySelectorAll('#TableOfContents a, .toc-nav a, .sidebar-toc-nav a');
    if (!tocLinks.length) return;

    const headerToLinksMap = new Map();
    const headers = [];

    // Resolve heading element by href ID
    function findHeaderElement(rawHref) {
        if (!rawHref || !rawHref.startsWith('#')) return null;
        const idStr = rawHref.substring(1);
        if (!idStr) return null;

        try {
            const decodedId = decodeURIComponent(idStr);

            let el = document.getElementById(decodedId) || document.getElementById(idStr);
            if (el) return el;

            el = document.querySelector(`[id="${CSS.escape(decodedId)}"]`) ||
                 document.querySelector(`[id="${CSS.escape(idStr)}"]`);
            if (el) return el;
        } catch (e) {}

        const allHeadings = document.querySelectorAll('.article h1, .article h2, .article h3, .article h4, .article h5, .article h6');
        const cleanTarget = decodeURIComponent(idStr).toLowerCase().replace(/[^a-z0-9а-яё]/g, '');

        for (let i = 0; i < allHeadings.length; i++) {
            const h = allHeadings[i];
            if (!h.id) continue;
            const hClean = h.id.toLowerCase().replace(/[^a-z0-9а-яё]/g, '');
            if (hClean && (hClean === cleanTarget || hClean.endsWith(cleanTarget) || cleanTarget.endsWith(hClean))) {
                return h;
            }
        }

        return null;
    }

    tocLinks.forEach((link) => {
        const rawHref = link.getAttribute('href');
        const header = findHeaderElement(rawHref);

        if (header) {
            if (!headerToLinksMap.has(header)) {
                headerToLinksMap.set(header, []);
                headers.push(header);
            }
            headerToLinksMap.get(header).push(link);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                history.pushState(null, null, rawHref);

                const mobileToc = link.closest('.toc-mobile');
                if (mobileToc) mobileToc.removeAttribute('open');

                const isMobile = window.innerWidth <= 1024;
                if (isMobile) {
                    const headerHeight = 60;
                    const targetTop = header.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                } else if (scrollContainer) {
                    const offset = 24;
                    const targetTop = header.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop - offset;
                    scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
            });
        }
    });

    if (!headers.length) return;

    // Sort headings by DOM order
    headers.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    let ticking = false;

    function updateActiveLink() {
        const isMobile = window.innerWidth <= 1024;
        const containerTop = (isMobile || !scrollContainer)
            ? 0
            : scrollContainer.getBoundingClientRect().top;

        let activeHeader = null;

        for (let i = 0; i < headers.length; i++) {
            const top = headers[i].getBoundingClientRect().top - containerTop;
            if (top <= 140) {
                activeHeader = headers[i];
            } else {
                break;
            }
        }

        if (!activeHeader && headers.length > 0) {
            activeHeader = headers[0];
        }

        tocLinks.forEach((l) => l.classList.remove('active'));

        if (activeHeader) {
            const links = headerToLinksMap.get(activeHeader);
            if (links) {
                links.forEach((l) => l.classList.add('active'));
            }
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateActiveLink);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    }

    updateActiveLink();
}
