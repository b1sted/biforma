export function initLicenseModal() {
    const modal = document.getElementById('license-modal');
    if (!modal) return;

    const triggers = document.querySelectorAll('.js-license-trigger');
    const closeBtn = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const langTabs = document.querySelectorAll('.modal-tab');
    const viewBtns = document.querySelectorAll('.modal-view-btn');

    let licenseData = null;
    let licenseDataPromise = null;
    let currentLicense = null;
    const docLang = document.documentElement.lang || document.documentElement.getAttribute('lang') || 'ru';
    let currentLang = docLang.startsWith('en') ? 'en' : 'ru';
    let currentView = 'permissions';
    let previousActiveElement = null;

    async function loadLicenseData() {
        if (licenseData) return licenseData;
        if (!licenseDataPromise) {
            const url = modal.dataset.licenseDataUrl || window.licenseDataUrl || '/licenses.json';
            licenseDataPromise = fetch(url)
                .then((res) => {
                    if (!res.ok) throw new Error(`License data: ${res.status}`);
                    return res.json();
                })
                .then((data) => {
                    licenseData = data;
                    return data;
                })
                .catch((e) => {
                    licenseDataPromise = null;
                    throw e;
                });
        }
        return licenseDataPromise;
    }

    async function openModal(licenseKey) {
        previousActiveElement = document.activeElement;
        currentLicense = licenseKey;
        try {
            await loadLicenseData();
        } catch (e) {
            console.error('Failed to load license data', e);
            return;
        }
        renderContent();
        modal.style.display = 'flex';
        modal.offsetHeight;
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const activeTab = modal.querySelector('.modal-tab.active') || closeBtn;
            activeTab?.focus();
        }, 50);
    }

    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
                previousActiveElement.focus();
            }
        }, 200);
    }

    function renderContent() {
        if (!currentLicense || !licenseData || !licenseData[currentLicense]) return;
        const data = licenseData[currentLicense];

        modalTitle.textContent = data.title;
        langTabs.forEach(t => t.classList.toggle('active', t.dataset.lang === currentLang));
        viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === currentView));

        if (currentView === 'permissions') {
            modalBody.innerHTML = renderPermissions(data);
        } else {
            const textHtml = currentLang === 'ru' ? (data.html_ru || data.text_ru) : (data.html_en || data.text_en);
            modalBody.innerHTML = textHtml || '<p>License text is unavailable.</p>';
        }
    }

    function renderPermissions(data) {
        if (!data.permissions) return '<p>No permissions data available.</p>';
        const p = data.permissions;
        const suffix = currentLang === 'ru' ? '_ru' : '_en';

        const can = p['can' + suffix] || [];
        const cannot = p['cannot' + suffix] || [];
        const must = p['must' + suffix] || [];

        const labels = {
            can: window.i18n?.permCan || 'Can',
            cannot: window.i18n?.permCannot || 'Cannot',
            must: window.i18n?.permMust || 'Must'
        };

        const renderList = (items) => items.length ? `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '';

        return `
            <div class="permissions-grid">
                <div class="permission-column perm-can">
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${labels.can}</h3>
                    ${renderList(can)}
                </div>
                <div class="permission-column perm-cannot">
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> ${labels.cannot}</h3>
                    ${renderList(cannot)}
                </div>
                <div class="permission-column perm-must">
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${labels.must}</h3>
                    ${renderList(must)}
                </div>
            </div>
        `;
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(trigger.dataset.license);
        });
    });

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('visible')) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])');
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

    langTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentLang = tab.dataset.lang;
            renderContent();
        });
    });

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            renderContent();
        });
    });
}
