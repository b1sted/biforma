import { boot } from '../main.js';
import { initAboutFilter } from '../modules/about-filter.js';

boot([
    () => { if (document.getElementById('academic-toggle')) initAboutFilter(); }
]);
