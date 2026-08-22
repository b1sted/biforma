import { decodeDiagram, renderMermaidToSvgString } from './mermaid.js';

let lightboxEl = null;
let mediaContainer = null;
let captionEl = null;
let previousActiveElement = null;

let scale = 1;
let translateX = 0;
let translateY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let pinchStartDistance = 0;
let pinchStartScale = 1;
let lastTapTime = 0;

const MIN_SCALE = 1;
const MAX_SCALE = 10;
const ZOOM_STEP = 0.5;

export function setupLightboxTriggers() {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.js-lightbox-trigger');
        if (trigger) {
            e.preventDefault();
            openImage(trigger.dataset.image, trigger.dataset.caption || '');
            return;
        }

        const img = e.target.closest('.article img');
        if (img && !img.closest('a')) {
            e.preventDefault();
            const figure = img.closest('figure');
            const caption = figure?.querySelector('figcaption')?.textContent || img.alt || img.title || '';
            openImage(img.src, caption);
            return;
        }

        const mermaidTarget = e.target.closest('.mermaid.js-mermaid-lightbox, .mermaid-wrapper, .mermaid-diagram-svg');
        if (mermaidTarget) {
            e.preventDefault();
            openMermaid(e.target);
        }
    });

    window.closeLightbox = close;
}

function openImage(src, caption) {
    if (!src) return;

    const img = new Image();
    img.decoding = 'async';
    img.alt = caption;
    img.src = src;

    show(img, caption, () => ({ width: img.naturalWidth, height: img.naturalHeight }));
}

function findActiveMermaidSvg(targetEl) {
    const container = targetEl.closest('.mermaid, .mermaid-wrapper') || targetEl;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Prioritize the theme-matching SVG to prevent selecting hidden theme variants
    const themeSpecificSvg = container.querySelector(isLight ? '.mermaid-svg-light svg' : '.mermaid-svg-dark svg');
    if (themeSpecificSvg) {
        return themeSpecificSvg;
    }

    const directSvg = targetEl.tagName?.toLowerCase() === 'svg' ? targetEl : targetEl.closest('svg');
    if (directSvg) {
        return directSvg;
    }

    const svgs = container.querySelectorAll('svg');
    for (const s of svgs) {
        const parent = s.parentElement;
        if (parent && window.getComputedStyle(parent).display !== 'none') {
            return s;
        }
    }
    return svgs[0] || null;
}

function openMermaid(targetEl) {
    const figure = targetEl.closest('.mermaid-wrapper, figure');
    const caption = figure?.querySelector('.figure-caption, figcaption')?.textContent || '';

    const activeSvg = findActiveMermaidSvg(targetEl);
    if (activeSvg) {
        const clone = activeSvg.cloneNode(true);
        fixMermaidForeignObjects(clone);
        show(clone, caption, () => svgIntrinsicSize(clone));
        return;
    }

    const container = targetEl.closest('.mermaid') || targetEl;
    openMermaidFallback(container, caption);
}

async function openMermaidFallback(mermaidEl, caption) {
    const placeholder = document.createElement('div');
    placeholder.className = 'lightbox-status';
    placeholder.textContent = 'Rendering diagram…';
    show(placeholder, caption, () => ({ width: 0, height: 0 }));

    const encoded = mermaidEl.dataset?.diagram;
    if (!encoded) {
        placeholder.textContent = 'Failed to load diagram.';
        console.error('Lightbox: Missing SVG and data-diagram on .mermaid element.');
        return;
    }

    try {
        const svgString = await renderMermaidToSvgString(decodeDiagram(encoded));
        const wrapper = document.createElement('div');
        wrapper.innerHTML = svgString;
        const svgEl = wrapper.querySelector('svg');
        if (!svgEl) throw new Error('mermaid.render() did not return an SVG element.');

        svgEl.classList.add('mermaid-diagram-svg');
        fixMermaidForeignObjects(svgEl);
        replaceMedia(svgEl, () => svgIntrinsicSize(svgEl));
    } catch (err) {
        console.error('Failed to render fallback diagram for lightbox:', err);
        placeholder.textContent = 'Failed to render diagram.';
    }
}

/*
 * Scoped foreignObject fix: expands width buffer to prevent Cyrillic label clipping
 * without affecting global document styles or removing shape borders.
 */
function fixMermaidForeignObjects(svgEl) {
    svgEl.querySelectorAll('.node foreignObject, .statediagram-state foreignObject').forEach((fo) => {
        fo.style.overflow = 'visible';
        fo.setAttribute('overflow', 'visible');

        const currentWidth = parseFloat(fo.getAttribute('width'));
        const currentX = parseFloat(fo.getAttribute('x'));

        if (!isNaN(currentWidth) && !isNaN(currentX)) {
            const centerX = currentX + currentWidth / 2;
            const extraWidth = 60;
            const newWidth = currentWidth + extraWidth;
            const newX = centerX - newWidth / 2;

            fo.setAttribute('width', String(newWidth));
            fo.setAttribute('x', String(newX));
            fo.style.width = `${newWidth}px`;
        }

        const div = fo.querySelector('div');
        if (div) {
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.textAlign = 'center';
            div.style.overflow = 'visible';
            div.style.whiteSpace = 'nowrap';
            div.style.background = 'transparent';
        }
    });
}

function svgIntrinsicSize(svgEl) {
    const viewBox = svgEl.getAttribute('viewBox');
    const parts = viewBox ? viewBox.trim().split(/\s+/).map(Number) : null;
    if (parts && parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: parts[2], height: parts[3] };
    }
    return { width: 0, height: 0 };
}

function ensureLightbox() {
    if (lightboxEl) return;

    lightboxEl = document.createElement('div');
    lightboxEl.id = 'lightbox';
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', window.i18n?.lightboxTitle || 'Image Viewer');

    lightboxEl.innerHTML = `
        <div class="lightbox-content">
            <div class="lightbox-media" id="lightbox-media"></div>
            <div class="lightbox-caption" id="lightbox-caption"></div>
        </div>
        <button class="lightbox-close" type="button" aria-label="${window.i18n?.close || 'Close'}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="lightbox-toolbar">
            <button class="lightbox-btn zoom-out" type="button" aria-label="${window.i18n?.lightboxZoomOut || 'Zoom out'}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <span class="lightbox-scale" id="lightbox-scale">100%</span>
            <button class="lightbox-btn zoom-in" type="button" aria-label="${window.i18n?.lightboxZoomIn || 'Zoom in'}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button class="lightbox-btn zoom-reset" type="button" aria-label="${window.i18n?.lightboxZoomReset || 'Reset zoom'}">1:1</button>
        </div>
    `;
    document.body.appendChild(lightboxEl);

    mediaContainer = lightboxEl.querySelector('#lightbox-media');
    captionEl = lightboxEl.querySelector('#lightbox-caption');

    lightboxEl.querySelector('.lightbox-close').addEventListener('click', close);

    // Close when clicking backdrop or empty space outside media
    lightboxEl.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox-toolbar, .lightbox-close, .lightbox-caption, #lightbox-media')) {
            return;
        }
        close();
    });

    // Handle clicks inside mediaContainer: zoom if clicked on media (img/svg), close if clicked on empty space around it
    mediaContainer.addEventListener('click', (e) => {
        if (isPanning) return;

        const isDirectMedia = e.target.closest('img, svg') !== null;
        if (isDirectMedia) {
            e.stopPropagation();
            scale <= MIN_SCALE ? zoomTo(2.5, { x: e.clientX, y: e.clientY }) : resetZoom();
        } else {
            close();
        }
    });

    lightboxEl.querySelector('.zoom-in').addEventListener('click', (e) => {
        e.stopPropagation();
        zoomTo(Math.min(MAX_SCALE, scale + ZOOM_STEP), viewportCenter());
    });
    lightboxEl.querySelector('.zoom-out').addEventListener('click', (e) => {
        e.stopPropagation();
        const next = Math.max(MIN_SCALE, scale - ZOOM_STEP);
        next <= MIN_SCALE ? resetZoom() : zoomTo(next, viewportCenter());
    });
    lightboxEl.querySelector('.zoom-reset').addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoom();
    });

    mediaContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        const next = Math.min(Math.max(MIN_SCALE, scale + scale * 0.15 * direction), MAX_SCALE);
        next <= MIN_SCALE ? resetZoom() : zoomTo(next, { x: e.clientX, y: e.clientY });
    }, { passive: false });

    mediaContainer.addEventListener('mousedown', (e) => {
        if (scale <= MIN_SCALE) return;
        e.preventDefault();
        panStartX = e.clientX - translateX;
        panStartY = e.clientY - translateY;

        const onMove = (moveEvent) => {
            isPanning = true;
            translateX = moveEvent.clientX - panStartX;
            translateY = moveEvent.clientY - panStartY;
            requestAnimationFrame(applyTransform);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            setTimeout(() => { isPanning = false; }, 50);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });

    mediaContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    mediaContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    mediaContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (!lightboxEl?.classList.contains('active')) return;

        if (e.key === 'Escape') {
            close();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = lightboxEl.querySelectorAll('button:not([disabled])');
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    window.addEventListener('resize', () => {
        if (lightboxEl?.classList.contains('active')) fitCurrentMedia();
    });
}

let currentGetIntrinsicSize = () => ({ width: 0, height: 0 });

function show(el, caption, getIntrinsicSize) {
    ensureLightbox();
    previousActiveElement = document.activeElement;

    captionEl.textContent = caption || '';
    captionEl.style.display = caption ? 'block' : 'none';

    replaceMedia(el, getIntrinsicSize);

    lightboxEl.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => lightboxEl.querySelector('.lightbox-close')?.focus(), 50);
}

function replaceMedia(el, getIntrinsicSize) {
    currentGetIntrinsicSize = getIntrinsicSize;
    mediaContainer.innerHTML = '';
    mediaContainer.appendChild(el);
    resetZoom();
    fitCurrentMedia();
}

function fitCurrentMedia() {
    const el = mediaContainer?.firstElementChild;
    if (!el) return;

    const { width, height } = currentGetIntrinsicSize();
    const hasCaption = Boolean(captionEl?.textContent?.trim());

    el.style.display = 'block';
    el.style.margin = 'auto';
    el.style.maxWidth = 'none';
    el.style.maxHeight = 'none';
    el.removeAttribute('width');
    el.removeAttribute('height');

    if (width > 0 && height > 0) {
        const maxWidth = window.innerWidth * 0.9;
        // Allocate vertical buffer for caption and toolbar to prevent overlap
        const maxHeight = window.innerHeight * (hasCaption ? 0.68 : 0.76);
        const fitScale = Math.min(maxWidth / width, maxHeight / height, 1);
        el.style.width = `${width * fitScale}px`;
        el.style.height = `${height * fitScale}px`;
    } else {
        el.style.width = `${window.innerWidth * 0.9}px`;
        el.style.height = 'auto';
    }
}

function viewportCenter() {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function applyTransform() {
    const el = mediaContainer?.firstElementChild;
    if (!el) return;
    el.style.transform = scale > MIN_SCALE
        ? `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
        : '';
    const scaleLabel = document.getElementById('lightbox-scale');
    if (scaleLabel) scaleLabel.textContent = `${Math.round(scale * 100)}%`;
}

function zoomTo(targetScale, origin) {
    if (targetScale <= MIN_SCALE) {
        resetZoom();
        return;
    }

    const el = mediaContainer?.firstElementChild;
    if (el) {
        el.classList.remove('zoomable');
        el.classList.add('zoomed');
    }

    const offsetX = origin.x - window.innerWidth / 2;
    const offsetY = origin.y - window.innerHeight / 2;
    const ratio = targetScale / scale;
    translateX = translateX * ratio - offsetX * (ratio - 1);
    translateY = translateY * ratio - offsetY * (ratio - 1);
    scale = targetScale;

    requestAnimationFrame(applyTransform);
}

function resetZoom() {
    scale = MIN_SCALE;
    translateX = 0;
    translateY = 0;

    const el = mediaContainer?.firstElementChild;
    if (el) {
        el.classList.remove('zoomed');
        el.classList.add('zoomable');
        el.style.transform = '';
    }

    const scaleLabel = document.getElementById('lightbox-scale');
    if (scaleLabel) scaleLabel.textContent = '100%';
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapTime < 300) {
            e.preventDefault();
            const touch = e.touches[0];
            scale <= MIN_SCALE ? zoomTo(2.5, { x: touch.clientX, y: touch.clientY }) : resetZoom();
            lastTapTime = 0;
            return;
        }
        lastTapTime = now;

        if (scale > MIN_SCALE) {
            panStartX = e.touches[0].clientX - translateX;
            panStartY = e.touches[0].clientY - translateY;
        }
    } else if (e.touches.length === 2) {
        pinchStartDistance = touchDistance(e.touches);
        pinchStartScale = scale;
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 1 && scale > MIN_SCALE) {
        e.preventDefault();
        isPanning = true;
        translateX = e.touches[0].clientX - panStartX;
        translateY = e.touches[0].clientY - panStartY;
        requestAnimationFrame(applyTransform);
    } else if (e.touches.length === 2 && pinchStartDistance > 0) {
        e.preventDefault();
        const ratio = touchDistance(e.touches) / pinchStartDistance;
        const targetScale = Math.min(Math.max(MIN_SCALE, pinchStartScale * ratio), MAX_SCALE);
        const mid = {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        zoomTo(targetScale, mid);
    }
}

function handleTouchEnd(e) {
    if (e.touches.length === 0) {
        setTimeout(() => { isPanning = false; }, 50);
        pinchStartDistance = 0;
    }
}

function touchDistance(touches) {
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
}

function close() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        if (mediaContainer) mediaContainer.innerHTML = '';
        resetZoom();
    }, 250);
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
    }
}
