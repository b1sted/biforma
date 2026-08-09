function initLicenseModal() {
    const modal = document.getElementById('license-modal');
    if (!modal) return;

    const triggers = document.querySelectorAll('.js-license-trigger');
    const closeBtn = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const langTabs = document.querySelectorAll('.modal-tab');
    const viewBtns = document.querySelectorAll('.modal-view-btn');

    let licenseData = {};
    let currentLicense = null;
    let currentLang = 'ru';
    let currentView = 'permissions'; // 'permissions' or 'text'

    try {
        const dataEl = document.getElementById('license-data');
        if (dataEl) {
            licenseData = JSON.parse(dataEl.textContent);
        }
    } catch (e) {
        console.error('Failed to parse license data', e);
        return;
    }

    function openModal(licenseKey) {
        currentLicense = licenseKey;
        renderContent();
        modal.style.display = 'flex';
        modal.offsetHeight; // Force reflow
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 200);
    }

    function renderContent() {
        if (!currentLicense || !licenseData[currentLicense]) return;
        const data = licenseData[currentLicense];

        modalTitle.textContent = data.title;

        langTabs.forEach(t => t.classList.toggle('active', t.dataset.lang === currentLang));
        viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === currentView));

        if (currentView === 'permissions') {
            modalBody.innerHTML = renderPermissions(data);
        } else {
            const text = currentLang === 'ru' ? data.text_ru : data.text_en;
            modalBody.innerHTML = parseMarkdown(text);
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
            can: window.i18n?.permCan || (currentLang === 'ru' ? 'Можно' : 'Can'),
            cannot: window.i18n?.permCannot || (currentLang === 'ru' ? 'Нельзя' : 'Cannot'),
            must: window.i18n?.permMust || (currentLang === 'ru' ? 'Нужно' : 'Must')
        };

        const renderList = (items) => {
            if (!items.length) return '';
            return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
        };

        return `
            <div class="permissions-grid">
                <div class="permission-column perm-can">
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${labels.can}</h3>
                    ${renderList(can)}
                </div>
                 <div class="permission-column perm-cannot">
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> ${labels.cannot}</h3>
                    ${renderList(cannot)}
                </div>
                 <div class="permission-column perm-must">
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${labels.must}</h3>
                    ${renderList(must)}
                </div>
            </div>
        `;
    }

    function parseMarkdown(text) {
        if (!text) return '';

        text = text.replace(/<((?:https?|ftp):\/\/[^>]+)>/g, '[$1]($1)');

        const lines = text.split('\n');
        let html = '';
        let inBlockquote = false;
        let pBuffer = [];
        let listStack = [];

        const makeSlug = (text) => {
            return text.toLowerCase()
                .replace(/[^a-z0-9а-яё\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        };

        const parseInline = (str) => {
            if (!str) return '';
            str = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                if (url.startsWith('#')) {
                    return `<a href="${url}">${text}</a>`;
                } else {
                    return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
                }
            });
            str = str.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
            str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            str = str.replace(/__(.*?)__/g, '<strong>$1</strong>');
            str = str.replace(/_([^_]+)_/g, '<em>$1</em>');
            str = str.replace(/`([^`]+)`/g, '<code>$1</code>');
            return str;
        };

        const flushP = () => {
            if (pBuffer.length > 0) {
                const fullText = pBuffer.join(' ');
                html += `<p>${parseInline(fullText)}</p>`;
                pBuffer = [];
            }
        };

        const closeAllLists = () => {
            while (listStack.length > 0) {
                const top = listStack.pop();
                html += top.type === 'ol' ? '</ol>' : '</ul>';
            }
        };

        const closeListsToIndent = (indent) => {
            while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
                const top = listStack.pop();
                html += top.type === 'ol' ? '</ol>' : '</ul>';
            }
        };

        lines.forEach(line => {
            const currentIndent = line.search(/\S/);
            let trimmed = line.trim();
            let lineIsBlockquote = false;

            if (currentIndent === -1) {
                flushP();
                return;
            }

            if (trimmed.startsWith('>')) {
                lineIsBlockquote = true;
                trimmed = trimmed.substring(1).trim();
            }

            if (lineIsBlockquote && !trimmed) {
                flushP();
                return;
            }

            if (lineIsBlockquote !== inBlockquote) {
                flushP();
                closeAllLists();
                if (inBlockquote) { html += '</blockquote>'; }
                inBlockquote = lineIsBlockquote;
                if (inBlockquote) { html += '<blockquote>'; }
            }

            if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
                flushP();
                closeAllLists();
                html += `<hr>`;
                return;
            }

            if (trimmed.startsWith('# ')) {
                flushP();
                closeAllLists();
                const headerText = trimmed.substring(2);
                const slug = makeSlug(headerText);
                html += `<h1 id="${slug}">${parseInline(headerText)}</h1>`;
                return;
            }
            if (trimmed.startsWith('## ')) {
                flushP();
                closeAllLists();
                const headerText = trimmed.substring(3);
                const slug = makeSlug(headerText);
                html += `<h2 id="${slug}">${parseInline(headerText)}</h2>`;
                return;
            }
            if (trimmed.startsWith('### ')) {
                flushP();
                closeAllLists();
                const headerText = trimmed.substring(4);
                const slug = makeSlug(headerText);
                html += `<h3 id="${slug}">${parseInline(headerText)}</h3>`;
                return;
            }

            const listMatch = trimmed.match(/^(\*|[0-9]+\.|[a-z]{1,2}\.|[A-Z]\.|[ivx]+\.)\s+(.*)/i);
            if (listMatch) {
                flushP();
                const marker = listMatch[1];
                const listType = marker === '*' ? 'ul' : 'ol';

                let possibleTypes = [];
                if (listType === 'ol') {
                    if (marker.match(/^[ivx]+\.$/i)) possibleTypes.push('i');
                    if (marker.match(/^[a-z]{1,2}\.$/)) possibleTypes.push('a');
                    if (marker.match(/^[A-Z]\.$/)) possibleTypes.push('A');
                    if (marker.match(/^[0-9]+\.$/)) possibleTypes.push('1');
                }

                closeListsToIndent(currentIndent);

                let top = listStack[listStack.length - 1];
                let olType = possibleTypes[0] || '';

                if (top && top.indent === currentIndent && top.type === listType) {
                    if (possibleTypes.includes(top.olType)) {
                        olType = top.olType;
                    }
                }

                if (!top || top.indent < currentIndent || top.type !== listType || top.olType !== olType) {
                    const typeAttr = olType ? ` type="${olType}"` : '';
                    html += `<${listType}${typeAttr}>`;
                    listStack.push({ type: listType, indent: currentIndent, olType: olType });
                }

                let content = parseInline(listMatch[2]);
                html += `<li>${content}</li>`;
                return;
            } else {
                if (listStack.length > 0) {
                    if (currentIndent <= listStack[listStack.length - 1].indent) {
                        closeAllLists();
                    }
                }
            }

            if (trimmed) {
                pBuffer.push(trimmed);
            }
        });

        flushP();
        closeAllLists();
        if (inBlockquote) html += '</blockquote>';

        return html;
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(trigger.dataset.license);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    modalBody.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.hash && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = decodeURIComponent(link.hash.substring(1));
            const escapedId = CSS.escape(targetId);
            const targetElement = modalBody.querySelector(`#${escapedId}`);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });

    langTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentLang = tab.dataset.lang;
            renderContent();
        });
    });

    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentView = btn.dataset.view;
            renderContent();
        });
    });
}
