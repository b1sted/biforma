import { boot } from '../main.js';
import { initCopyButtons } from '../modules/code-copy.js';

boot([
    () => { initCopyButtons(); }
]);
