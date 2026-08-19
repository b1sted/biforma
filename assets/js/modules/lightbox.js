let lightboxCreated = false;
let isZoomed = false;
let isDragging = false;
let startX, startY, currentX = 0, currentY = 0;
let currentScale = 1;
const MIN_SCALE = 1;
const MAX_SCALE = 10;

export function setupLightboxTriggers() {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.js-lightbox-trigger');
        if (trigger) {
            e.preventDefault();
            openLightbox(trigger.dataset.image, trigger.dataset.caption);
            return;
        }

        const img = e.target.closest('.article img');
        if (img && !img.closest('a')) {
            e.preventDefault();
            const figure = img.closest('figure');
            const caption = figure?.querySelector('figcaption')?.textContent || img.alt || img.title || '';
            openLightbox(img.src, caption);
            return;
        }

        const mermaidContainer = e.target.closest('.mermaid.js-mermaid-lightbox');
        if (mermaidContainer) {
            const svg = mermaidContainer.querySelector('svg');
            if (svg) {
                e.preventDefault();
                const figure = mermaidContainer.closest('.mermaid-wrapper');
                const caption = figure?.querySelector('.figure-caption')?.textContent || '';
                openLightboxSvg(svg, caption);
            }
        }
    });

    window.openLightbox = openLightbox;
    window.openLightboxSvg = openLightboxSvg;
    window.closeLightbox = closeLightbox;
}

function createLightbox() {
    if (lightboxCreated) return;
    lightboxCreated = true;

    const labelLightbox = window.i18n?.lightboxTitle || 'Просмотр изображения';
    const labelClose = window.i18n?.close || 'Закрыть';
    const labelZoomIn = window.i18n?.lightboxZoomIn || 'Увеличить';
    const labelZoomOut = window.i18n?.lightboxZoomOut || 'Уменьшить';
    const labelZoomReset = window.i18n?.lightboxZoomReset || 'Сбросить масштаб';

    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', labelLightbox);

    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="" alt="" class="lightbox-image zoomable" id="lightbox-image" draggable="false">
            <div class="lightbox-svg-wrapper zoomable" id="lightbox-svg-wrapper" style="display: none;"></div>
            <div class="lightbox-caption" id="lightbox-caption"></div>
        </div>
        <button class="lightbox-close" aria-label="${labelClose}">×</button>
        <div class="lightbox-toolbar">
            <button class="lightbox-btn zoom-out" aria-label="${labelZoomOut}">−</button>
            <span class="lightbox-scale" id="lightbox-scale">100%</span>
            <button class="lightbox-btn zoom-in" aria-label="${labelZoomIn}">+</button>
            <button class="lightbox-btn zoom-reset" aria-label="${labelZoomReset}">1:1</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const image = lightbox.querySelector('.lightbox-image');
    const svgWrapper = lightbox.querySelector('.lightbox-svg-wrapper');
    const btnZoomIn = lightbox.querySelector('.zoom-in');
    const btnZoomOut = lightbox.querySelector('.zoom-out');
    const btnZoomReset = lightbox.querySelector('.zoom-reset');

    closeBtn.addEventListener('click', closeLightbox);
    btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        setZoom({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }, Math.min(MAX_SCALE, currentScale + 0.5));
    });

    btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = Math.max(MIN_SCALE, currentScale - 0.5);
        next <= MIN_SCALE ? resetZoomState() : setZoom({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }, next);
    });

    btnZoomReset.addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoomState();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
            closeLightbox();
        }
    });

    const handleElementClick = (e) => {
        e.stopPropagation();
        if (isDragging) return;
        currentScale <= MIN_SCALE ? setZoom(e, 2.5) : resetZoomState();
    };

    image.addEventListener('click', handleElementClick);
    svgWrapper.addEventListener('click', handleElementClick);

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        const scaleChange = currentScale * 0.15 * delta;
        const newScale = Math.min(Math.max(MIN_SCALE, currentScale + scaleChange), MAX_SCALE);
        newScale <= MIN_SCALE ? resetZoomState() : setZoom(e, newScale);
    };

    image.addEventListener('wheel', handleWheel, { passive: false });
    svgWrapper.addEventListener('wheel', handleWheel, { passive: false });

    const handleMouseDown = (e) => {
        if (!isZoomed) return;
        e.preventDefault();
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;

        const onMouseMove = (moveEvent) => {
            isDragging = true;
            currentX = moveEvent.clientX - startX;
            currentY = moveEvent.clientY - startY;
            requestAnimationFrame(updateTransform);
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            setTimeout(() => { isDragging = false; }, 50);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    image.addEventListener('mousedown', handleMouseDown);
    svgWrapper.addEventListener('mousedown', handleMouseDown);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function getActiveTarget() {
    const svgWrapper = document.getElementById('lightbox-svg-wrapper');
    if (svgWrapper && svgWrapper.style.display !== 'none') {
        return svgWrapper;
    }
    return document.getElementById('lightbox-image');
}

function updateTransform() {
    const target = getActiveTarget();
    if (!target) return;

    if (isZoomed) {
        target.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale})`;
    } else {
        target.style.transform = '';
    }

    const scaleText = document.getElementById('lightbox-scale');
    if (scaleText) scaleText.textContent = `${Math.round(currentScale * 100)}%`;
}

function setZoom(e, targetScale) {
    const target = getActiveTarget();
    if (!target || targetScale <= MIN_SCALE) {
        resetZoomState();
        return;
    }

    isZoomed = true;
    target.classList.remove('zoomable');
    target.classList.add('zoomed');

    const rect = target.getBoundingClientRect();
    const clickX = e.clientX !== undefined ? e.clientX : (rect.left + rect.width / 2);
    const clickY = e.clientY !== undefined ? e.clientY : (rect.top + rect.height / 2);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = clickX - centerX;
    const offsetY = clickY - centerY;

    const scaleRatio = targetScale / currentScale;
    currentX = currentX * scaleRatio - offsetX * (scaleRatio - 1);
    currentY = currentY * scaleRatio - offsetY * (scaleRatio - 1);

    currentScale = targetScale;
    requestAnimationFrame(updateTransform);
}

function resetZoomState() {
    const image = document.getElementById('lightbox-image');
    const svgWrapper = document.getElementById('lightbox-svg-wrapper');

    isZoomed = false;
    currentScale = MIN_SCALE;
    currentX = 0;
    currentY = 0;

    [image, svgWrapper].forEach((el) => {
        if (el) {
            el.classList.remove('zoomed');
            el.classList.add('zoomable');
            el.style.transform = '';
        }
    });

    const scaleText = document.getElementById('lightbox-scale');
    if (scaleText) scaleText.textContent = '100%';
}

export function openLightbox(imageSrc, caption) {
    if (!lightboxCreated) createLightbox();

    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    const svgWrapper = document.getElementById('lightbox-svg-wrapper');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (svgWrapper) svgWrapper.style.display = 'none';
    if (image) {
        image.style.display = 'block';
        image.src = imageSrc;
        image.alt = caption || '';
    }
    if (lightboxCaption) lightboxCaption.textContent = caption || '';

    resetZoomState();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function openLightboxSvg(svgElement, caption) {
    if (!lightboxCreated) createLightbox();

    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    const svgWrapper = document.getElementById('lightbox-svg-wrapper');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (image) image.style.display = 'none';
    if (svgWrapper) {
        svgWrapper.style.display = 'flex';
        svgWrapper.innerHTML = '';

        let clonedSvg = svgElement.cloneNode(true);
        const prefix = `lb-${Date.now()}-`;
        const idMap = new Map();

        clonedSvg.querySelectorAll('[id]').forEach((node) => {
            const oldId = node.id;
            const newId = `${prefix}${oldId}`;
            idMap.set(oldId, newId);
            node.id = newId;
        });

        if (idMap.size > 0) {
            let serialized = clonedSvg.outerHTML;
            idMap.forEach((newId, oldId) => {
                const urlPattern = new RegExp(`url\\((['"]?)#${oldId}(['"]?)\\)`, 'g');
                serialized = serialized.replace(urlPattern, `url($1#${newId}$2)`);

                const hrefPattern = new RegExp(`(href|xlink:href)=(["'])#${oldId}(["'])`, 'g');
                serialized = serialized.replace(hrefPattern, `$1=$2#${newId}$3`);
            });

            const parser = new DOMParser();
            const doc = parser.parseFromString(serialized, 'image/svg+xml');
            const sanitizedSvg = doc.documentElement;
            if (sanitizedSvg && sanitizedSvg.nodeName.toLowerCase() === 'svg') {
                clonedSvg = sanitizedSvg;
            }
        }

        const rect = svgElement.getBoundingClientRect();
        const baseWidth = parseFloat(svgElement.style.maxWidth) || svgElement.viewBox?.baseVal?.width || rect.width;

        if (baseWidth > 0) {
            clonedSvg.style.width = `${baseWidth}px`;
            clonedSvg.style.maxWidth = '100%';
            clonedSvg.style.height = 'auto';
        }

        svgWrapper.appendChild(clonedSvg);
    }
    if (lightboxCaption) lightboxCaption.textContent = caption || '';

    resetZoomState();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(resetZoomState, 250);
    }
}
