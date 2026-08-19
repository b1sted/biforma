let renderCounter = 0;
let mermaidPromise = null;
let currentConfiguredTheme = null;

function loadMermaid() {
    if (typeof window.mermaid !== 'undefined') {
        return Promise.resolve(window.mermaid);
    }
    if (!mermaidPromise) {
        const basePath = document.documentElement.dataset.baseUrl || '/';
        const url = `${basePath.endsWith('/') ? basePath : basePath + '/'}js/mermaid.min.js`;

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

function configureMermaid(mermaid, force = false) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const mermaidTheme = isLight ? 'default' : 'dark';

    if (!force && currentConfiguredTheme === mermaidTheme) {
        return;
    }
    currentConfiguredTheme = mermaidTheme;

    const themeVariables = isLight ? {
        primaryColor: '#f1f5f9',
        primaryTextColor: '#0f172a',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        textColor: '#0f172a',
        edgeLabelBackground: 'transparent',
        nodeTextColor: '#0f172a',
        mainBkg: '#f8fafc',
        nodeBorder: '#94a3b8',
        actorBkg: '#f1f5f9',
        actorBorder: '#3b82f6',
        actorTextColor: '#0f172a',
        signalColor: '#64748b',
        signalTextColor: '#0f172a',
        labelBoxBkgColor: 'transparent',
        labelBoxBorderColor: '#cbd5e1',
        labelTextColor: '#0f172a',
        loopTextColor: '#0f172a'
    } : {
        primaryColor: '#1a1a1a',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#5ca1f1',
        lineColor: '#888888',
        textColor: '#e0e0e0',
        edgeLabelBackground: 'transparent',
        nodeTextColor: '#ffffff',
        mainBkg: '#141414',
        nodeBorder: '#3a3a3a',
        actorBkg: '#1a1a1a',
        actorBorder: '#5ca1f1',
        actorTextColor: '#ffffff',
        signalColor: '#888888',
        signalTextColor: '#e0e0e0',
        labelBoxBkgColor: 'transparent',
        labelBoxBorderColor: '#3a3a3a',
        labelTextColor: '#e0e0e0',
        loopTextColor: '#e0e0e0'
    };

    mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
        themeVariables,
        securityLevel: 'strict',
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

            const viewBoxWidth = svgEl.viewBox?.baseVal?.width;
            const inlineMax = parseFloat(svgEl.style.maxWidth);
            const baseWidth = viewBoxWidth > 0 ? viewBoxWidth : (!isNaN(inlineMax) && inlineMax > 0 ? inlineMax : 0);

            const scaleFactor = parseFloat(el.dataset.scale);
            const factor = (!isNaN(scaleFactor) && scaleFactor > 0) ? scaleFactor : 1;

            if (baseWidth > 0) {
                svgEl.style.maxWidth = `${baseWidth * factor}px`;
                svgEl.style.width = '100%';
            } else {
                svgEl.style.maxWidth = '100%';
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

    configureMermaid(mermaid, true);

    for (let i = 0; i < elements.length; i++) {
        await renderMermaidElement(elements[i], i);
    }
}
