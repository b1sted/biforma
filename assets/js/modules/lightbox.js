let lightboxCreated = false;
let isZoomed = false;
let isDragging = false;
let startX, startY, currentX = 0, currentY = 0;
let currentScale = 1;
const MIN_SCALE = 1;
const MAX_SCALE = 10;

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
            <div class="lightbox-caption" id="lightbox-caption"></div>
        </div>
        <button class="lightbox-close" aria-label="${labelClose}">×</button>
        <div class="lightbox-toolbar">
            <button class="lightbox-btn zoom-out" aria-label="${labelZoomOut}" title="${labelZoomOut}">−</button>
            <span class="lightbox-scale" id="lightbox-scale">100%</span>
            <button class="lightbox-btn zoom-in" aria-label="${labelZoomIn}" title="${labelZoomIn}">+</button>
            <button class="lightbox-btn zoom-reset" aria-label="${labelZoomReset}" title="${labelZoomReset}">1:1</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const image = lightbox.querySelector('.lightbox-image');

    const btnZoomIn = lightbox.querySelector('.zoom-in');
    const btnZoomOut = lightbox.querySelector('.zoom-out');
    const btnZoomReset = lightbox.querySelector('.zoom-reset');

    closeBtn.addEventListener('click', closeLightbox);

    btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newScale = Math.min(MAX_SCALE, currentScale + 0.5);
        if (Math.abs(newScale - currentScale) > 0.01) {
            setZoom({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }, newScale);
        }
    });

    btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        const newScale = Math.max(MIN_SCALE, currentScale - 0.5);
        if (Math.abs(newScale - currentScale) > 0.01) {
            if (newScale <= MIN_SCALE + 0.01) resetZoomState();
            else setZoom({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }, newScale);
        }
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

    image.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isDragging) return;

        if (Math.abs(currentScale - MIN_SCALE) < 0.01) {
            setZoom(e, 2.5);
        } else {
            resetZoomState();
        }
    });

    image.addEventListener('wheel', (e) => {
        if (!isZoomed && Math.abs(currentScale - MIN_SCALE) < 0.01 && e.deltaY > 0) return;
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY < 0 ? 1 : -1;
        const scaleChange = currentScale * 0.15 * delta;
        const newScale = Math.min(Math.max(MIN_SCALE, currentScale + scaleChange), MAX_SCALE);

        if (Math.abs(newScale - currentScale) > 0.01) {
            setZoom(e, newScale);
        } else if (newScale <= MIN_SCALE + 0.01 && currentScale > MIN_SCALE + 0.01) {
            resetZoomState();
        }
    }, { passive: false });

    image.addEventListener('mousedown', (e) => {
        if (!isZoomed) return;
        e.preventDefault();
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;

        image.style.transition = 'none';

        const onMouseMove = (moveEvent) => {
            isDragging = true;
            currentX = moveEvent.clientX - startX;
            currentY = moveEvent.clientY - startY;
            updateImageTransform();
        };
        window.addEventListener('mousemove', onMouseMove);

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            image.style.transition = 'transform 0.05s linear';
            setTimeout(() => { isDragging = false; }, 50);
        }
        window.addEventListener('mouseup', onMouseUp);
    });

    window.addEventListener('mouseleave', () => {
        if (isDragging) isDragging = false;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function updateImageTransform() {
    const image = document.getElementById('lightbox-image');
    if (!image) return;

    const baseWidth = image.offsetWidth;
    const baseHeight = image.offsetHeight;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const scaledWidth = baseWidth * currentScale;
    const scaledHeight = baseHeight * currentScale;

    const maxX = Math.max(0, (scaledWidth - winWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - winHeight) / 2);

    currentX = Math.min(Math.max(currentX, -maxX), maxX);
    currentY = Math.min(Math.max(currentY, -maxY), maxY);

    if (isZoomed) {
        image.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    } else {
        image.style.transform = '';
    }

    const scaleText = document.getElementById('lightbox-scale');
    if (scaleText) {
        scaleText.textContent = Math.round(currentScale * 100) + '%';
    }
}

function setZoom(e, targetScale) {
    const image = document.getElementById('lightbox-image');
    if (!image) return;

    if (targetScale <= MIN_SCALE + 0.01) {
        resetZoomState();
        return;
    }

    isZoomed = true;
    image.classList.remove('zoomable');
    image.classList.add('zoomed');

    const rect = image.getBoundingClientRect();
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
    updateImageTransform();
}

function resetZoomState() {
    const image = document.getElementById('lightbox-image');
    if (image) {
        isZoomed = false;
        currentScale = MIN_SCALE;
        currentX = 0;
        currentY = 0;
        image.classList.remove('zoomed');
        image.classList.add('zoomable');
        updateImageTransform();
    }
}

function openLightbox(imageSrc, caption) {
    if (!lightboxCreated) {
        createLightbox();
        setTimeout(() => openLightbox(imageSrc, caption), 50);
        return;
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');

    lightboxImage.src = imageSrc;
    lightboxImage.alt = caption || '';
    lightboxCaption.textContent = caption || '';

    resetZoomState();

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(resetZoomState, 300);
    }
}

function setupLightboxTriggers() {
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('.js-lightbox-trigger');
        if (trigger) {
            e.preventDefault();
            openLightbox(trigger.dataset.image, trigger.dataset.caption);
            return;
        }

        const img = e.target.closest('.article-content img, .article-figure img, .article-image img');
        if (img) {
            e.preventDefault();

            let captionText = img.alt || img.title || '';
            const figure = img.closest('figure');
            if (figure) {
                const figcaption = figure.querySelector('figcaption');
                if (figcaption) {
                    captionText = figcaption.textContent;
                }
            }

            openLightbox(img.src, captionText);
        }
    });

    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
}
