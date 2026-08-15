let renderCounter = 0;
let mermaidPromise = null;

function loadMermaid() {
    if (typeof window.mermaid !== 'undefined') {
        return Promise.resolve(window.mermaid);
    }
    if (!mermaidPromise) {
        const basePath = document.documentElement.dataset.baseUrl || '/';
        const url = `${basePath.endsWith('/') ? basePath : basePath + '/'}js/mermaid.min.js`;

        // Lazy-load script on demand to avoid blocking main thread and optimize LCP/TBT
        mermaidPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve(window.mermaid);
            script.onerror = (err) => {
                mermaidPromise = null;
                reject(err);
            };
            document.head.appendChild(script);
        });
    }
    return mermaidPromise;
}

function decodeDiagram(encoded) {
    try {
        const binString = atob(encoded);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        return new TextDecoder().decode(bytes).trim();
    } catch {
        return encoded.trim();
    }
}

function configureMermaid(mermaid) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const mermaidTheme = isLight ? 'default' : 'dark';

    // Theme variables enforcing WCAG AA color contrast ratio (>= 4.5:1)
    const themeVariables = isLight ? {
        primaryColor: '#eef2ff',
        primaryTextColor: '#0f172a',
        primaryBorderColor: '#6366f1',
        lineColor: '#475569',
        textColor: '#0f172a',
        edgeLabelBackground: '#ffffff',
        nodeTextColor: '#0f172a'
    } : {
        primaryColor: '#1e1b4b',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#818cf8',
        lineColor: '#cbd5e1',
        textColor: '#ffffff',
        edgeLabelBackground: '#1e293b',
        nodeTextColor: '#ffffff'
    };

    mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
        themeVariables,
        securityLevel: 'loose',
        fontFamily: 'Inter, -apple-system, sans-serif'
    });
}

async function renderMermaidElement(el, index = 0) {
    const rawCode = el.dataset.diagram ? decodeDiagram(el.dataset.diagram) : el.textContent.trim();
    if (!rawCode) return;

    let mermaid;
    try {
        mermaid = await loadMermaid();
    } catch (e) {
        console.error('Failed to load Mermaid:', e);
        return;
    }

    configureMermaid(mermaid);

    renderCounter++;
    const renderId = `mermaid-svg-${Date.now()}-${renderCounter}-${index}`;

    try {
        const { svg } = await mermaid.render(renderId, rawCode);
        el.innerHTML = svg;
        el.dataset.rendered = 'true';

        const svgEl = el.querySelector('svg');
        if (svgEl) {
            svgEl.style.margin = '0 auto';
            svgEl.style.display = 'block';

            const scaleFactor = parseFloat(el.dataset.scale);
            if (!isNaN(scaleFactor) && scaleFactor > 0) {
                const inlineMax = parseFloat(svgEl.style.maxWidth);
                const baseWidth = !isNaN(inlineMax) && inlineMax > 0
                    ? inlineMax
                    : (svgEl.viewBox?.baseVal?.width || svgEl.getBoundingClientRect().width);

                if (baseWidth > 0) {
                    svgEl.style.maxWidth = `${baseWidth * scaleFactor}px`;
                    svgEl.style.width = '100%';
                }
            }
        }
    } catch (err) {
        console.error('Mermaid rendering failed for element:', el, err);
    }
}

export function initMermaid() {
    const elements = document.querySelectorAll('.mermaid');
    if (!elements.length) return;

    elements.forEach((el) => {
        if (!el.dataset.diagram) {
            el.dataset.diagram = el.textContent.trim();
        }
    });

    // Defer script download and rendering until diagrams are near viewport
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    observer.unobserve(el);
                    await renderMermaidElement(el);
                }
            });
        }, {
            rootMargin: '300px 0px'
        });

        elements.forEach((el) => observer.observe(el));
    } else {
        renderAllMermaid();
    }
}

export async function renderAllMermaid() {
    const elements = document.querySelectorAll('.mermaid');
    if (!elements.length) return;

    let mermaid;
    try {
        mermaid = await loadMermaid();
    } catch (e) {
        console.error('Failed to load Mermaid:', e);
        return;
    }

    configureMermaid(mermaid);

    for (let i = 0; i < elements.length; i++) {
        await renderMermaidElement(elements[i], i);
    }
}
