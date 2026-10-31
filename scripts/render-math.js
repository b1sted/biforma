#!/usr/bin/env node
/**
 * scripts/render-math.js
 *
 * Pre-renders KaTeX math to static HTML at build time, including define templates.
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const PUBLIC_DIR = process.argv[2] || "public";

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

function decodeBase64(str) {
  return Buffer.from(str, "base64").toString("utf-8");
}

function encodeBase64(str) {
  return Buffer.from(str, "utf-8").toString("base64");
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

  // Pre-render KaTeX inside Base64-encoded define modal templates at build time
  window.document.querySelectorAll("template.define-modal-template[data-content]").forEach((tmpl) => {
    const rawHtml = decodeBase64(tmpl.getAttribute("data-content"));
    const div = window.document.createElement("div");
    div.innerHTML = rawHtml;
    window.renderMathInElement(div, RENDER_OPTIONS);
    tmpl.setAttribute("data-content", encodeBase64(div.innerHTML));
  });

  window.document.querySelectorAll('script[src*="katex.min.js"]').forEach((el) => el.remove());
  window.document.querySelectorAll('script[src*="auto-render.min.js"]').forEach((el) => el.remove());
  window.document.querySelectorAll('script[src*="math-fallback"]').forEach((el) => el.remove());

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
