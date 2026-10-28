import { storage } from './storage.js';

const STATE_KEY = 'section-groups-state';
const EXPAND_ALL_KEY = 'section-expand-all';

export function initSectionGroups() {
    const container = document.getElementById('section-groups');
    if (!container) return;

    const groups = Array.from(container.querySelectorAll('.section-group-block'));
    if (!groups.length) return;

    const toggleAllButton = document.getElementById('section-toggle-all');
    const toggleAllIcon = document.getElementById('section-toggle-all-icon');
    const toggleAllText = document.getElementById('section-toggle-all-text');

    const expandText = window.i18n?.sectionExpandAll || 'Expand all';
    const collapseText = window.i18n?.sectionCollapseAll || 'Collapse all';

    const savedState = storage.get(STATE_KEY, {}) || {};
    const expandAllByDefault = storage.get(EXPAND_ALL_KEY, true) !== false;

    function setExpanded(group, expanded) {
        const header = group.querySelector('.section-group-header');
        group.classList.toggle('expanded', expanded);
        if (header) header.setAttribute('aria-expanded', String(expanded));
    }

    function areAllExpanded() {
        return groups.every((group) => group.classList.contains('expanded'));
    }

    function updateToggleAll() {
        if (!toggleAllButton) return;
        const allExpanded = areAllExpanded();
        if (toggleAllIcon) toggleAllIcon.textContent = allExpanded ? '▲' : '▼';
        if (toggleAllText) toggleAllText.textContent = allExpanded ? collapseText : expandText;
        toggleAllButton.setAttribute('aria-expanded', String(allExpanded));
        toggleAllButton.setAttribute('aria-label', allExpanded ? collapseText : expandText);
    }

    function toggleGroup(group, index) {
        const expanded = !group.classList.contains('expanded');
        setExpanded(group, expanded);
        savedState[index] = expanded;
        storage.set(STATE_KEY, savedState);
        updateToggleAll();
    }

    groups.forEach((group, index) => {
        const header = group.querySelector('.section-group-header');
        if (!header) return;

        const shouldExpand = savedState[index] !== undefined ? savedState[index] : expandAllByDefault;
        setExpanded(group, shouldExpand);

        header.addEventListener('click', () => toggleGroup(group, index));
        header.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            toggleGroup(group, index);
        });
    });

    if (toggleAllButton) {
        toggleAllButton.addEventListener('click', () => {
            const expanded = !areAllExpanded();
            groups.forEach((group, index) => {
                setExpanded(group, expanded);
                savedState[index] = expanded;
            });
            storage.set(STATE_KEY, savedState);
            storage.set(EXPAND_ALL_KEY, expanded);
            updateToggleAll();
        });
    }

    updateToggleAll();
}
