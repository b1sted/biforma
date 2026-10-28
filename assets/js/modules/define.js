let modalBackdrop = null;
let modalTitleEl = null;
let modalBodyEl = null;
let previousActiveElement = null;

const MODAL_ANIMATION_DURATION = 200;

function ensureModal() {
    if (modalBackdrop) return;

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'define-modal-backdrop';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'define-modal-title');

    modalBackdrop.innerHTML = `
        <div class="define-modal-container">
            <div class="define-modal-header">
                <h3 class="define-modal-title" id="define-modal-title"></h3>
                <button type="button" class="define-modal-close" aria-label="${window.i18n?.close || 'Close'}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="define-modal-body" id="define-modal-body"></div>
        </div>
    `;

    document.body.appendChild(modalBackdrop);

    modalTitleEl = modalBackdrop.querySelector('#define-modal-title');
    modalBodyEl = modalBackdrop.querySelector('#define-modal-body');

    const closeBtn = modalBackdrop.querySelector('.define-modal-close');
    closeBtn.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (!modalBackdrop.classList.contains('visible')) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = modalBackdrop.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
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
}

function renderMath(container) {
    const mathFn = window.renderMathInElement || (typeof renderMathInElement === 'function' ? renderMathInElement : null);
    if (mathFn) {
        try {
            mathFn(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false
            });
        } catch (e) {}
    }
}

function decodeBase64Utf8(base64Str) {
    try {
        const bin = atob(base64Str);
        const bytes = Uint8Array.from(bin, (m) => m.codePointAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        return '';
    }
}

function openModal(title, htmlContent) {
    ensureModal();
    previousActiveElement = document.activeElement;

    modalTitleEl.textContent = title || '';
    modalBodyEl.innerHTML = htmlContent;

    renderMath(modalBodyEl);
    requestAnimationFrame(() => renderMath(modalBodyEl));

    modalBackdrop.style.display = 'flex';
    modalBackdrop.offsetHeight;
    modalBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        modalBackdrop.querySelector('.define-modal-close')?.focus();
    }, 50);
}

function closeModal() {
    if (!modalBackdrop) return;

    modalBackdrop.classList.remove('visible');
    setTimeout(() => {
        modalBackdrop.style.display = 'none';
        document.body.style.overflow = '';
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
        }
    }, MODAL_ANIMATION_DURATION);
}

function normalizeDefineSpacing() {
    document.querySelectorAll('.define-wrapper').forEach((wrapper) => {
        const next = wrapper.nextSibling;
        if (next && next.nodeType === Node.TEXT_NODE) {
            if (/^[\p{L}\p{N}]/u.test(next.nodeValue)) {
                next.nodeValue = ' ' + next.nodeValue;
            }
        }
    });
}

function handleTriggerAction(trigger, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const wrapper = trigger.closest('.define-wrapper');
    if (!wrapper) return;

    const mode = trigger.dataset.defineMode;

    if (mode === 'inline') {
        const inlineContent = wrapper.querySelector('.define-inline-content');
        if (!inlineContent) return;

        const isOpen = inlineContent.classList.contains('is-open');
        if (isOpen) {
            inlineContent.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            inlineContent.setAttribute('aria-hidden', 'true');
        } else {
            inlineContent.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            inlineContent.setAttribute('aria-hidden', 'false');
            renderMath(inlineContent);
        }
    } else if (mode === 'modal') {
        const tmpl = wrapper.querySelector('.define-modal-template');
        if (!tmpl) return;

        let htmlContent = '';
        if (tmpl.dataset.content) {
            htmlContent = decodeBase64Utf8(tmpl.dataset.content);
        } else {
            htmlContent = tmpl.innerHTML;
        }

        openModal(tmpl.dataset.title, htmlContent);
    }
}

export function initDefine() {
    normalizeDefineSpacing();

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.define-trigger');
        if (trigger) {
            handleTriggerAction(trigger, e);
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('define-trigger')) {
            handleTriggerAction(e.target, e);
        }
    });
}
