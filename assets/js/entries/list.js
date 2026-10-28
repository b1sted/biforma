import { boot } from '../main.js';
import { initSectionFilter } from '../modules/section-filter.js';
import { initSectionGroups } from '../modules/section-groups.js';

boot([
    () => { if (document.querySelector('.section-filter-bar')) initSectionFilter(); },
    () => { if (document.getElementById('section-groups')) initSectionGroups(); }
]);
