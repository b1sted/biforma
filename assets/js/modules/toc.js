function initTocAndScroll() {
    const scrollContainer = document.querySelector('.main-content');
    const tocLinks = document.querySelectorAll('#TableOfContents a');
    if (!tocLinks.length) return;

    const idToLinksMap = new Map();
    const headers = [];

    tocLinks.forEach((link) => {
        const rawHref = link.getAttribute('href');
        if (!rawHref || !rawHref.startsWith('#')) return;

        const id = decodeURIComponent(rawHref.substring(1));
        const header = document.getElementById(id);

        if (header) {
            if (!idToLinksMap.has(id)) idToLinksMap.set(id, []);
            idToLinksMap.get(id).push(link);
            headers.push(header);

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

    let ticking = false;

    function updateActiveLink() {
        const isMobile = window.innerWidth <= 1024;
        const containerTop = (isMobile || !scrollContainer) 
            ? 0 
            : scrollContainer.getBoundingClientRect().top;

        let activeHeader = headers[0];
        for (let i = 0; i < headers.length; i++) {
            const top = headers[i].getBoundingClientRect().top - containerTop;
            if (top <= 120) {
                activeHeader = headers[i];
            } else {
                break;
            }
        }

        tocLinks.forEach((l) => l.classList.remove('active'));
        if (activeHeader) {
            const links = idToLinksMap.get(activeHeader.id);
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
