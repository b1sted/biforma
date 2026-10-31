import { initTocAndScroll, initHeadingAnchors } from '../modules/toc.js';
import { initTabs } from '../modules/tabs.js';
import { initCompareBlocks } from '../modules/compare.js';
import { initCopyButtons } from '../modules/code-copy.js';
import { initResponsiveTables } from '../modules/tables.js';
import { setupLightboxTriggers } from '../modules/lightbox.js';
import { initMermaid } from '../modules/mermaid.js';
import { initSectionNavbox } from '../modules/section-navbox.js';

export function initContent() {
    if (document.getElementById('TableOfContents') || document.querySelector('.toc-nav')) initTocAndScroll();
    if (document.querySelector('.heading-anchor-link')) initHeadingAnchors();
    if (document.querySelector('.code-tabs, .content-tabs')) initTabs();
    if (document.querySelector('.code-compare')) initCompareBlocks();
    if (document.querySelector('.article table')) initResponsiveTables();
    initCopyButtons();
    setupLightboxTriggers();
    if (document.querySelector('.mermaid')) initMermaid();
    if (document.getElementById('section-navbox')) initSectionNavbox();
}
