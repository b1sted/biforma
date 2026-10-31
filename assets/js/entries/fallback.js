import { boot } from '../main.js';
import { initSectionFilter } from '../modules/section-filter.js';
import { initSectionGroups } from '../modules/section-groups.js';
import { initAboutFilter } from '../modules/about-filter.js';
import { initContent } from './content.js';

boot([
    () => { if (document.querySelector('.section-filter-bar')) initSectionFilter(); },
    () => { if (document.getElementById('section-groups')) initSectionGroups(); },
    () => { if (document.getElementById('academic-toggle')) initAboutFilter(); },
    initContent
]);
