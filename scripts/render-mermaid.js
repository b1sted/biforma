#!/usr/bin/env node
/**
 * scripts/render-mermaid.js
 *
 * Pre-renders Mermaid diagrams to static SVG at build time, reproducing
 * EXACTLY what assets/js/modules/mermaid.js does in the browser:
 *   - decodes the base64 diagram source from data-diagram
 *   - uses the same themeVariables for light/dark
 *   - applies the same post-render sizing (viewBox/scale -> max-width)
 *   - keeps .mermaid.js-mermaid-lightbox intact for lightbox.js
 *
 * Difference from the client: it renders BOTH themes at build time and lets
 * CSS toggle between them via [data-theme], so switching the theme requires
 * no JS re-render and there is zero flash of wrong colors on load.
 *
 * Elements that fail to render keep their original data-diagram attribute
 * and are left WITHOUT data-rendered="true", so the client-side script
 * (assets/js/modules/mermaid.js) transparently renders them as a fallback.
 *
 * Usage: node scripts/render-mermaid.js <path-to-public-dir>
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer-core");

const PUBLIC_DIR = process.argv[2] || "public";
const CACHE_DIR = path.join(__dirname, "..", ".cache", "mermaid");

// Mirrors assets/js/modules/mermaid.js exactly, so SSR output matches the
// client-side render pixel-for-pixel.

const FONT_FAMILY = "Inter, -apple-system, sans-serif";

const THEME_VARIABLES = {
  light: {
    primaryColor: "#f1f5f9",
    primaryTextColor: "#0f172a",
    primaryBorderColor: "#3b82f6",
    lineColor: "#64748b",
    textColor: "#0f172a",
    edgeLabelBackground: "transparent",
    nodeTextColor: "#0f172a",
    mainBkg: "#f8fafc",
    nodeBorder: "#94a3b8",
    actorBkg: "#f1f5f9",
    actorBorder: "#3b82f6",
    actorTextColor: "#0f172a",
    signalColor: "#64748b",
    signalTextColor: "#0f172a",
    labelBoxBkgColor: "transparent",
    labelBoxBorderColor: "#cbd5e1",
    labelTextColor: "#0f172a",
    loopTextColor: "#0f172a",
  },
  dark: {
    primaryColor: "#1a1a1a",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#5ca1f1",
    lineColor: "#888888",
    textColor: "#e0e0e0",
    edgeLabelBackground: "transparent",
    nodeTextColor: "#ffffff",
    mainBkg: "#141414",
    nodeBorder: "#3a3a3a",
    actorBkg: "#1a1a1a",
    actorBorder: "#5ca1f1",
    actorTextColor: "#ffffff",
    signalColor: "#888888",
    signalTextColor: "#e0e0e0",
    labelBoxBkgColor: "transparent",
    labelBoxBorderColor: "#3a3a3a",
    labelTextColor: "#e0e0e0",
    loopTextColor: "#e0e0e0",
  },
};

// 'default' / 'dark' are Mermaid's own theme names, not ours — must match
// configureMermaid() in the client module.
const MERMAID_THEME_NAME = { light: "default", dark: "dark" };

function buildMermaidConfig(variant) {
  return {
    startOnLoad: false,
    theme: MERMAID_THEME_NAME[variant],
    themeVariables: THEME_VARIABLES[variant],
    securityLevel: "strict",
    fontFamily: FONT_FAMILY,
    // Must match the client config: htmlLabels: false renders labels as
    // vector <text> instead of a fixed-width <foreignObject> box, which
    // would clip the last character if the rendered font is a px wider
    // at display time than it measured at build time.
    flowchart: { htmlLabels: false },
    state: { htmlLabels: false },
    class: { htmlLabels: false },
  };
}

// Same resolution strategy as render-math.js: theme-as-submodule or
// running from inside the theme repo itself.
function findAssetPath(relativePath) {
  const candidates = [
    path.join(__dirname, "..", "themes", "biforma", "static", relativePath),
    path.join(__dirname, "..", "static", relativePath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Asset not found in any candidate path:\n ${candidates.join("\n ")}`);
}

function findSystemChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/snap/bin/chromium",
  ];
  for (const bin of candidates) {
    if (bin && fs.existsSync(bin)) return bin;
  }
  throw new Error(
    "No system Chromium/Chrome found. Set PUPPETEER_EXECUTABLE_PATH to its path."
  );
}

const MERMAID_JS_PATH = findAssetPath(path.join("js", "mermaid.min.js"));
const MERMAID_JS = fs.readFileSync(MERMAID_JS_PATH, "utf8");

function decodeDiagram(base64) {
  return Buffer.from(base64, "base64").toString("utf-8").trim();
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

// Folded into the cache key so any change to buildMermaidConfig() (theme
// variables, htmlLabels, etc.) invalidates stale cached SVGs automatically
// instead of silently reusing them.
const CONFIG_VERSION = crypto
  .createHash("sha1")
  .update(JSON.stringify([buildMermaidConfig("light"), buildMermaidConfig("dark")]))
  .digest("hex")
  .slice(0, 12);

function cacheKeyFor(variant, source) {
  return crypto.createHash("sha1").update(`${CONFIG_VERSION}\u0000${variant}\u0000${source}`).digest("hex");
}

function readCache(variant, source) {
  const p = path.join(CACHE_DIR, `${cacheKeyFor(variant, source)}.svg`);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function writeCache(variant, source, svg) {
  fs.writeFileSync(path.join(CACHE_DIR, `${cacheKeyFor(variant, source)}.svg`), svg);
}

// SVG post-processing below mirrors the sizing tail of renderMermaidElement()
// in mermaid.js: baseWidth = viewBox width, falling back to any inline
// max-width; final max-width = baseWidth * data-scale (default 1).

function getViewBoxWidth(svgEl) {
  const vb = svgEl.getAttribute("viewBox");
  if (!vb) return 0;
  const parts = vb.trim().split(/\s+/).map(Number);
  return parts.length === 4 && !Number.isNaN(parts[2]) ? parts[2] : 0;
}

function getInlineMaxWidth(svgEl) {
  const style = svgEl.getAttribute("style") || "";
  const match = style.match(/max-width:\s*([\d.]+)px/);
  return match ? parseFloat(match[1]) : NaN;
}

function setStyleProp(svgEl, prop, value) {
  const style = svgEl.getAttribute("style") || "";
  const cleaned = style
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith(`${prop}:`))
    .join("; ");
  svgEl.setAttribute("style", `${cleaned}${cleaned ? "; " : ""}${prop}: ${value}`);
}

// Strips CSS rules Mermaid always emits into <style>, regardless of whether
// this specific diagram uses them:
//   - .error-icon/.error-text: styling for a failed render; if we got this
//     far the render already succeeded, so this is always dead code.
//   - @keyframes edge-animation-frame/dash + .edge-animation-slow/fast: only
//     needed by diagrams with an animated edge (`e1@{ animate: true }`).
//     Kept only when such a class actually appears in the SVG body.
function stripDeadMermaidCss(svgEl) {
  const styleEl = svgEl.querySelector("style");
  if (!styleEl) return;

  let css = styleEl.textContent;

  css = css.replace(/[^{}]*\.error-(?:icon|text)\s*\{[^{}]*\}/g, "");

  // Check actual diagram elements via class attribute, not styleEl's own
  // textContent — the <style> block's text always contains the literal
  // rule ".edge-animation-slow{...}", so a substring check against
  // innerHTML would false-positive on every diagram, animated or not.
  const usesAnimatedEdge = svgEl.querySelector('[class*="edge-animation-"]') !== null;

  if (!usesAnimatedEdge) {
    css = css.replace(/@keyframes\s+(?:edge-animation-frame|dash)\s*\{[^{}]*\{[^{}]*\}\s*\}/g, "");
    css = css.replace(/[^{}]*\.edge-animation-(?:slow|fast)\s*\{[^{}]*\}/g, "");
  }

  styleEl.textContent = css.trim();
}

function postProcessSvg(rawSvg, scaleAttr, captionId) {
  const namespaced = namespaceSvgIds(rawSvg);
  const dom = new JSDOM(`<div>${namespaced}</div>`);
  const svgEl = dom.window.document.querySelector("svg");
  if (!svgEl) return rawSvg;

  // .mermaid-diagram-svg (see assets/css/modules/mermaid.css) owns
  // display/margin/transparent background and edge-label color. It's set
  // on the <svg> itself, not a .mermaid ancestor, so the styling survives
  // lightbox.js cloning this node into #lightbox-media outside the
  // .mermaid container.
  svgEl.classList.add("mermaid-diagram-svg");
  stripDeadMermaidCss(svgEl);

  const viewBoxWidth = getViewBoxWidth(svgEl);
  const inlineMax = getInlineMaxWidth(svgEl);
  const baseWidth = viewBoxWidth > 0 ? viewBoxWidth : (!Number.isNaN(inlineMax) && inlineMax > 0 ? inlineMax : 0);

  const scaleFactor = parseFloat(scaleAttr);
  const factor = !Number.isNaN(scaleFactor) && scaleFactor > 0 ? scaleFactor : 1;

  if (baseWidth > 0) {
    setStyleProp(svgEl, "max-width", `${baseWidth * factor}px`);
    setStyleProp(svgEl, "width", "100%");
  } else {
    setStyleProp(svgEl, "max-width", "100%");
  }

  // Accessibility: if the diagram has a caption (figcaption from the
  // shortcode / render-codeblock.html), link the SVG to it via
  // aria-labelledby instead of duplicating the text, so it stays correct
  // if the caption is edited later. Falls back to a generic aria-label
  // when there's no caption.
  svgEl.setAttribute("role", "img");
  if (captionId) {
    svgEl.setAttribute("aria-labelledby", captionId);
  } else if (!svgEl.hasAttribute("aria-label")) {
    svgEl.setAttribute("aria-label", "Диаграмма");
  }

  return svgEl.outerHTML;
}

let renderCounter = 0;
let namespaceCounter = 0;

// Namespacing SVG ids matters here specifically: a page embeds BOTH the
// light and dark variant of every diagram (plus possibly several diagrams),
// and Mermaid's internal <clipPath>/<marker> ids aren't guaranteed unique
// across render() calls. url(#id) resolves GLOBALLY against the whole
// document regardless of display:none, so a visible SVG can end up
// referencing a clipPath from a hidden (other-theme) variant with different
// dimensions, producing an inexplicable clip. Renaming every id per SVG
// before insertion avoids that collision entirely.
const URL_REF_ATTRS = ["clip-path", "mask", "fill", "stroke", "marker-start", "marker-mid", "marker-end", "filter"];

function namespaceSvgIds(svgString) {
  namespaceCounter++;
  const prefix = `mmd-ns-${namespaceCounter}-`;

  const dom = new JSDOM(`<div>${svgString}</div>`);
  const svgEl = dom.window.document.querySelector("svg");
  if (!svgEl) return svgString;

  const idMap = new Map();
  svgEl.querySelectorAll("[id]").forEach((el) => {
    const oldId = el.getAttribute("id");
    const newId = prefix + oldId;
    idMap.set(oldId, newId);
    el.setAttribute("id", newId);
  });

  if (idMap.size === 0) return svgString;

  const rewriteUrlRefs = (value) =>
    value.replace(/url\(#([^)]+)\)/g, (m, id) => (idMap.has(id) ? `url(#${idMap.get(id)})` : m));

  svgEl.querySelectorAll("*").forEach((el) => {
    URL_REF_ATTRS.forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val && val.includes("url(#")) {
        el.setAttribute(attr, rewriteUrlRefs(val));
      }
    });

    const style = el.getAttribute("style");
    if (style && style.includes("url(#")) {
      el.setAttribute("style", rewriteUrlRefs(style));
    }

    ["href", "xlink:href"].forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val && val.startsWith("#")) {
        const id = val.slice(1);
        if (idMap.has(id)) el.setAttribute(attr, `#${idMap.get(id)}`);
      }
    });
  });

  return svgEl.outerHTML;
}

async function renderVariant(page, source, variant) {
  const cached = readCache(variant, source);
  if (cached) return cached;

  renderCounter++;
  const id = `mermaid-ssr-${variant}-${renderCounter}`;
  const config = buildMermaidConfig(variant);

  const svg = await page.evaluate(
    async ({ source, id, config }) => {
      window.mermaid.initialize(config);
      const { svg } = await window.mermaid.render(id, source);
      return svg;
    },
    { source, id, config }
  );

  writeCache(variant, source, svg);
  return svg;
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const files = walk(PUBLIC_DIR).filter((f) => {
    const html = fs.readFileSync(f, "utf8");
    return html.includes('class="mermaid') && html.includes("data-diagram=");
  });

  if (files.length === 0) {
    console.log("ℹ️  No Mermaid diagrams found, skipping pre-render.");
    return;
  }

  const executablePath = findSystemChrome();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ content: MERMAID_JS });

  let renderedCount = 0;
  let failedCount = 0;

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // :not([data-rendered="true"]) makes re-running the script idempotent
    const elements = [
      ...document.querySelectorAll('.mermaid[data-diagram]:not([data-rendered="true"])'),
    ];
    if (!elements.length) continue;

    let fileChanged = false;

    for (const el of elements) {
      const source = decodeDiagram(el.getAttribute("data-diagram"));
      if (!source) continue;

      const scaleAttr = el.getAttribute("data-scale");
      const captionId = el.getAttribute("data-caption-id");

      try {
        const [lightRaw, darkRaw] = await Promise.all([
          renderVariant(page, source, "light"),
          renderVariant(page, source, "dark"),
        ]);

        const lightSvg = postProcessSvg(lightRaw, scaleAttr, captionId);
        const darkSvg = postProcessSvg(darkRaw, scaleAttr, captionId);

        el.innerHTML =
          `<div class="mermaid-svg-light">${lightSvg}</div>` +
          `<div class="mermaid-svg-dark">${darkSvg}</div>`;

        // data-diagram is kept, not removed: it's the only source
        // openMermaidFallback() in lightbox.js has for an on-the-fly
        // emergency render of the rare diagram that fails build-time SSR
        // (see the catch below). In the normal case the lightbox just
        // clones the already-rendered <svg> from the page (see
        // openMermaid() in lightbox.js) rather than re-rendering — ids are
        // already unique thanks to namespaceSvgIds(), so there's no
        // clipPath collision between the lightbox copy and the page version.
        el.setAttribute("data-rendered", "true");

        fileChanged = true;
        renderedCount++;
      } catch (err) {
        failedCount++;
        console.error(`✗ Failed to render diagram in ${file}:`, err.message);
        // data-diagram is left in place -> client-side mermaid.js renders it instead
      }
    }

    if (fileChanged) {
      fs.writeFileSync(file, dom.serialize());
    }
  }

  await browser.close();

  console.log(
    `✅ Mermaid SSR: rendered ${renderedCount} diagrams (both themes) across ${files.length} files` +
      (failedCount ? `, ${failedCount} failed (client-side fallback).` : ".")
  );
}

main().catch((err) => {
  console.error("✗ Fatal error during Mermaid render:", err);
  process.exitCode = 1;
});
