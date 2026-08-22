#!/usr/bin/env node
/**
 * scripts/render-math.js
 *
 * Pre-renders KaTeX math to static HTML at build time, instead of doing it
 * in the browser via auto-render.min.js after page load.
 *
 * It reuses the exact katex.min.js / auto-render.min.js shipped in the theme,
 * so the output matches what the client-side render produces.
 *
 * Usage: node scripts/render-math.js <path-to-public-dir>
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const PUBLIC_DIR = process.argv[2] || "public";

// Resolve theme assets whether this script runs from a site repo (theme as a
// submodule) or from inside the theme repo itself.
function findAssetPath(relativePath) {
  const candidates = [
    path.join(__dirname, "..", "themes", "biforma", "static", relativePath),
    path.join(__dirname, "..", "static", relativePath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Asset not found in any candidate path:\n ${candidates.join("\n ")}`);
}

const KATEX_JS_PATH = findAssetPath(path.join("js", "katex.min.js"));
const AUTO_RENDER_JS_PATH = findAssetPath(path.join("js", "auto-render.min.js"));

const KATEX_JS = fs.readFileSync(KATEX_JS_PATH, "utf8");
const AUTO_RENDER_JS = fs.readFileSync(AUTO_RENDER_JS_PATH, "utf8");

const RENDER_OPTIONS = {
  // KaTeX marks its HTML output aria-hidden="true". With output: "html" that
  // leaves formulas with no accessible representation at all. "htmlAndMathml"
  // (KaTeX's own default) adds a MathML sibling for assistive tech without
  // changing the visual output.
  output: "htmlAndMathml",
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false },
    { left: "\\[", right: "\\]", display: true },
  ],
  throwOnError: false,
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function renderFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");

  if (!html.includes("auto-render.min.js")) return false;

  const dom = new JSDOM(html, { runScripts: "outside-only" });
  const { window } = dom;

  window.eval(KATEX_JS);
  window.eval(AUTO_RENDER_JS);

  const target = window.document.querySelector(".article") || window.document.body;
  window.renderMathInElement(target, RENDER_OPTIONS);

  window.document.querySelectorAll('script[src*="katex.min.js"]').forEach((el) => el.remove());
  window.document.querySelectorAll('script[src*="auto-render.min.js"]').forEach((el) => el.remove());

  fs.writeFileSync(filePath, dom.serialize());
  return true;
}

const files = walk(PUBLIC_DIR);
let rendered = 0;
for (const file of files) {
  try {
    if (renderFile(file)) rendered++;
  } catch (err) {
    console.error(`✗ Failed to render math in ${file}:`, err.message);
    process.exitCode = 1;
  }
}
console.log(`✅ KaTeX SSR: processed ${rendered}/${files.length} HTML files.`);
