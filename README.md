<h3 align="center">biforma</h3>

<p align="center">
    <strong>
    A minimal, fast, and feature-rich dual-mode Hugo theme for documentation and blogging.
    </strong>
</p>
<p align="center">
    <a href="https://gohugo.io">
        <img src="https://img.shields.io/badge/Hugo-v0.156.0%2B-blue?style=flat-square&logo=hugo" alt="Hugo Version">
    </a>
    <a href="#license">
        <img src="https://img.shields.io/badge/License-GPL--3.0-green?style=flat-square" alt="License" />
    </a>
</p>
<p align="center">
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#configuration">Configuration</a> •
    <a href="#front-matter">Front Matter</a> •
    <a href="#shortcodes">Shortcodes</a> •
    <a href="#license">License</a>
</p>
<hr>

<br>
<p align="center">
  <img src=".github/assets/demo.webp" alt="biforma demo" width="600"/>
</p>
<br>

## Features

- **Dual Mode (`themeMode`)**: Switch between `docs` (tree navigation, Table of Contents, category filters) and `blog` (clean post feed, metadata).
- **Multilingual & i18n**: Built-in internationalization with localized UI strings and an optional header language switcher for multi-language sites.
- **Performance First**: Zero-FOUC dark/light theme toggle, local variable fonts (*Inter*, *JetBrains Mono*), and lazy-loaded analytics.
- **Instant Search**: Powered by Pagefind for zero-config, ultra-fast client-side search.
- **Math & Typography**: Built-in KaTeX math rendering (including optional build-time SSR), Chroma syntax highlighting, side-by-side code comparison, tabs, inline/modal `define` explanations, and admonitions.
- **Diagrams (Mermaid.js)**: Lazy-loaded (IntersectionObserver) offline Mermaid rendering that auto-switches between dark/light themes, with a zoom & pan lightbox for every diagram.
- **Enhanced Media**: Auto-calculated image dimensions (prevents CLS) and built-in image zoom lightbox.
- **Heading Anchors**: Hover-revealed anchor links next to headings (up to the configured TOC depth), with TOC-consistent smooth scrolling.
- **License Modal & Footer Credit**: Per-page code/content license disclosure via modal, plus an optional "Theme: Biforma" credit line in the footer.
- **Obfuscated Email Links**: Base64-encoded `mailto:` links to reduce scraping by spam bots.
- **PWA & Offline**: Web app manifest, installable icons, a service worker with static-asset caching and an offline fallback page, plus intent-based link prefetching and deferred-image loading.
- **Section Components**: Collapsible, filterable article groups with an expand-all control, persistent state, data-driven group metadata, and a per-section navigation box on article pages.
- **Project Components**: Optional project metadata block (screenshot, specs, links), a project-infobox shortcode, and a project archetype.
- **Security & SEO**: Configurable Content-Security-Policy, robots.txt, Open Graph/Twitter metadata, and JSON-LD for articles, breadcrumbs and the author profile.
- **Zero Bloat**: Modular CSS/JS bundle compilation — loads only the assets needed for each specific page.

## Quick Start

### Installation

Add `biforma` as a Git submodule to your Hugo site:

```bash
git submodule add https://github.com/b1sted/biforma.git themes/biforma
```

### Search Indexing

Generate the search index after building your site:

```bash
hugo --gc --minify
npx pagefind --site public
```

### Build-time Rendering (Optional)

The theme can pre-render KaTeX math and Mermaid diagrams to static HTML/SVG
before deployment, eliminating client-side layout shift and flashes of
unstyled content. Copy the scripts from `themes/biforma/scripts/` into your
site's `scripts/` directory and run them after `hugo`:

```bash
node scripts/render-math.js public
node scripts/render-mermaid.js public
```

- `render-math.js` pre-renders all formulas, including those inside `define`
  modal templates. Requires `jsdom`.
- `render-mermaid.js` renders both light and dark themes at build time.
  Requires `jsdom` and `puppeteer-core` with a local Chromium/Chrome binary.

Both scripts are optional: without them the client-side modules render the
same content on demand.

### PWA & Offline

The theme ships with a web app manifest, installable icons, an offline fallback
page, and a service worker that is registered automatically after page load.
Static assets (fonts, icons, CSS, JS) use a cache-first strategy, while pages
use network-first with a cached/offline fallback.

The bundled `static/manifest.json` is intentionally generic. To brand the
installed app, override it by placing your own `static/manifest.json` in the
site root (site static files take precedence over theme files). Keep the icon
paths relative if the site is hosted under a subpath.

`static/sw.js` derives its scope from its own URL, so it works both at the site
root and under a base path. Bump `CACHE_VERSION` when changing the precache
list. The service worker skips Pagefind assets to avoid caching the search
index.

---

## Configuration

Add the following options to your `hugo.toml`:

```toml
baseURL = "https://example.com"
title = "My Site"
theme = "biforma"

# Optional Multilingual Configuration
defaultContentLanguage = "ru"

[languages]
  [languages.ru]
    label = "Русский"
    weight = 1

  [languages.en]
    label = "English"
    weight = 2

[params]
  # Select theme mode: "docs" or "blog"
  themeMode = "docs"

  logo = "📝"
  description = "Notes & Technical Documentation"
  author = "Your Name"
  keywords = ["hugo", "documentation", "blog"]  # Default <meta name="keywords"> fallback

  # Content-Security-Policy. The theme ships a policy that allows its inline
  # scripts/styles, local assets, Pagefind WASM and the built-in analytics.
  # Set to false to disable the meta tag, or replace it with your own policy.
  csp = "default-src 'self'; ..."

  # Navigation & Links
  mainSite = "https://example.com"
  github = "https://github.com/b1sted"
  donate = "https://cloudtips.ru/..."  # Adds donate buttons & article support block
  searchPlaceholder = "Search..."

  # Analytics (Lazy-loaded for 100/100 Lighthouse performance)
  googleAnalytics = "G-XXXXXXXXXX"
  yandexMetrika = 12345678

  # Verification Meta Tags
  googleVerification = "your-google-verification-code"
  yandexVerification = "your-yandex-verification-code"

  # Table of Contents
  tocMaxLevel = 3   # Deepest heading level (h2=2 ... h6=6) that gets a hover anchor link;
                    # should match markup.tableOfContents.endLevel

  # Blog pagination (only used when themeMode = "blog")
  blogPageSize = 14  # Posts per page on the blog home (default: 14). The bento grid
                     # layout assumes a full page (hero + wide cards at fixed positions),
                     # so keep this >= 8 or the layout will look sparse on the last page.

  # Footer Theme Credit
  showThemeCredit = true                            # Set false to hide the "Theme: Biforma" footer line
  themeName = "Biforma"                             # Override the displayed theme name
  themeURL = "https://github.com/b1sted/biforma"    # Override the link target

  # RSS feed
  rssSections = ["blog", "notes"]     # Optional: limit the home feed to these sections.
                                      # When omitted, all sections except `rss` and
                                      # pages marked `searchHidden`/`type: about` are included.
  rssFullContent = true               # Include full rendered article HTML in <description>.
                                      # Set false to fall back to description/summary.

  # Sidebar customization
  [params.sidebar]
    generalTitle = "General"           # Rename root section (default: "Общее")
    hideGeneralTitle = false           # Set true to hide root section title

# Optional: customize how deep headings are collected into the sidebar TOC.
# If you change this, update params.tocMaxLevel above to match — Hugo doesn't
# expose this section to templates, so the theme can't read it directly.
[markup.tableOfContents]
  startLevel = 2
  endLevel = 3
```

The theme ships a fallback `static/robots.txt`. For an absolute sitemap URL,
enable Hugo's robots template so the theme's `layouts/robots.txt` is used:

```toml
enableRobotsTXT = true
```

---

## Asset Loading

CSS and JS are selected per page kind from data files, not from hard-coded
lists in templates.

- `data/css_modules.yaml` defines `core` modules (loaded everywhere) and
  `by_kind` modules. The theme also appends content-specific modules when a
  page actually needs them: code blocks (`chroma`), tables, tabs, compare
  blocks, images/lightbox, mermaid, math, project meta/infobox, section
  navbox and donation. The `responsive` module is always appended last so
  its media queries override page-specific styles.
- `data/js_modules.yaml` maps each page kind to an entry in
  `assets/js/entries/` and documents the core/page-specific module split. The
  entry imports only its own modules; `fallback` loads everything for
  unknown page kinds.

Site-level `data/css_modules.yaml` and `data/js_modules.yaml` files override
the theme maps, so you can tune the module sets per site. Keep the same schema:
`core`, `by_kind` and (for JS) `entries`. `by_kind` keys are `home`, `list`,
`single`, `about`, `feeds`, `404` and `fallback`.

---

## Front Matter

Supported page parameters in Markdown headers:

```yaml
---
title: "Article Title"
subtitle: "Optional subtitle shown under the title" # Falls back to `description` if omitted
description: "Brief summary of the article"
icon: "🚀"            # Emoji icon displayed in cards and sidebar
group: "Getting Started" # Group notes into collapsible sections & filters
group_description: "Core guides for beginners"
difficulty: "Easy"    # Difficulty level badge shown on article cards.
                      # "Easy"/"Medium"/"Hard" (or "Легко"/"Средне"/"Сложно") get a colored badge;
                      # any other value is shown with a neutral badge.
tags: ["hugo", "css"] # Shown as chips on cards and at the bottom of the article
featured: true        # Pins the article into the "Featured" block of the blog sidebar
                      # (up to 3 posts; if none are marked, the 3 most recent are shown instead)
math: true            # Enable KaTeX math rendering ($E = mc^2$)
toc: true             # Enable/disable Table of Contents sidebar
tocDisable: false     # Alternative way to hide the TOC (either this or `hideToc`)
hideToc: false        # Alias for `tocDisable`
searchHidden: false   # Exclude page from Pagefind search & site search engines.
                      # Also adds <meta name="robots" content="noindex, nofollow">
                      # (same effect as `noindex`, see below).
noindex: false        # Add <meta name="robots" content="noindex, nofollow"> to the page
                      # without excluding it from the on-site Pagefind search.
---
```

---

## Section Components

Section pages group articles by the `group` front matter value. Groups are
collapsible, have an expand/collapse-all control, and remember their state in
`localStorage`. When a section has more than one article, article pages also
show a collapsible navigation box for the current section.

Group metadata is resolved in this order:

1. `data/section_categories.yaml` in the site (overrides the theme file):
   ```yaml
   - key: "Getting Started"
     icon: "🚀"
     description: "Installation, configuration and first steps"
   ```
   The `key` must match the `group` value exactly.
2. `group_icon` / `group_description` params on the first page in the group.
3. Neutral defaults (`📌`, no description).

```yaml
---
title: "Installation"
group: "Getting Started"
group_icon: "🚀"
group_description: "Installation, configuration and first steps"
---
```

The section filter bar, collapsible groups and the section navbox are rendered
for every section regardless of `themeMode`; no assembly-specific markup is
required.

---

## Project Pages

Set `projectMeta: true` in front matter to render a metadata block above the
article content. All fields are optional:

```yaml
---
title: "CorporateDirectory"
projectMeta: true
screenshot: "/images/projects/corporate-directory.webp"
projectType: "REST API"
language: "Java 21"
year: 2026
linesOfCode: "~4k"
modules: 12
duration: "3 weeks"
status: "Active"
github: "https://github.com/example/project"
demo: "https://example.com"
documentation: "https://docs.example.com"
---
```

The screenshot opens in the theme lightbox. The block renders type, language,
year, lines of code, modules, duration, status and GitHub/Demo/Documentation
links.

For an in-article summary card, use the shortcode:

```markdown
{{< project-infobox
    title="CorporateDirectory"
    type="REST API"
    status="Active"
    year="2026"
    language="Java 21"
    framework="Spring Boot"
    database="PostgreSQL"
    lines="~4k"
    modules="12"
    tags="Java, Spring Boot, REST"
    github="https://github.com/example/project"
    demo="https://example.com"
>}}
```

Supported shortcode fields: `title`, `image`, `type`, `status`, `year`,
`language`, `framework`, `platform`, `architecture`, `lines`, `files`,
`modules`, `dependencies`, `database`, `api`, `performance`, `accuracy`,
`coverage`, `grade`, `team`, `duration`, `license`, `tags` (comma-separated),
`github`, `demo`, `documentation`.

Create a new project page with:

```bash
hugo new content projects/my-project.md --kind project
```

---

## Shortcodes

- **Admonitions (`admonition.html`)**:  
  `{{< admonition type="note" title="Note" >}}Content{{< /admonition >}}`  
  *(Types: `note`, `tip`, `warning`, `danger`)*

- **Custom Code Block (`code.html`)**:  
  `{{< code lang="c" title="main.c" >}}code{{< /code >}}`  
  *(Options: `noheader="true"`, `center="true"`)*

- **Diagrams (Mermaid.js)**: use a fenced code block with the `mermaid` language:
  ````markdown
  ```mermaid
  graph TD
    A[Start] --> B[End]
  ```
  ````
  *(Optional attributes: `scale="1.5"` to resize, `caption="..."` / `title="..."` for a figure caption. Diagrams lazy-load on scroll and re-render automatically on theme switch, with a zoom & pan lightbox on click.)*

  The shortcode form is equivalent and is useful when attributes are easier to
  pass explicitly:
  ```markdown
  {{< mermaid scale="1.5" caption="Request flow" >}}
  graph TD
    A[Start] --> B[End]
  {{< /mermaid >}}
  ```

- **Code Compare (`compare.html`, `compare-left.html`, `compare-right.html`)**:  
  ```markdown
  {{< compare copy="true" >}}
    {{< compare-left title="Old Way" lang="c" >}}old code{{< /compare-left >}}
    {{< compare-right title="New Way" lang="c" >}}new code{{< /compare-right >}}
  {{< /compare >}}
  ```

- **Tabs (`tabs.html`)**:  
  ```markdown
  {{< tabs tabs="C++, Rust" >}}
  // C++ code
  <!-- tab -->
  // Rust code
  {{< /tabs >}}
  ```  
  *(Use `style="content"` for Markdown content tabs)*

- **Definitions (`define.html`)**: inline or modal explanations for terms,
  with KaTeX support and keyboard-accessible triggers.

  ```markdown
  {{< define term="RAII" >}}Resource Acquisition Is Initialization — a C++
  idiom that ties resource lifetime to object scope.{{< /define >}}
  ```

  The term itself is rendered as Markdown, so inline math works:
  `{{< define term="$O(1)$" >}}Constant time.{{< /define >}}`

  - `term` (or the first positional argument) — the visible term. Defaults to
    the plain-text form of the argument.
  - `mode` — `auto` (default), `inline`, or `modal`. In `auto` mode the theme
    uses a modal for multi-paragraph content, lists, code blocks, or text
    longer than 140 characters; otherwise the explanation is revealed inline.
  - `title` — modal heading. Defaults to the plain-text term.
  - `kind` — optional semantic label (defaults to `term`).

  Inline definitions toggle on click, `Enter`, or `Space`. Modal definitions
  open a focus-trapped dialog with `Escape` to close. Math inside both forms is
  pre-rendered at build time when `scripts/render-math.js` is used.

- **Dividers (`divider.html`)**:  
  `{{< divider type="dots" >}}` *(Types: `dots`, `decorated`, `section`, `thin`)*

- **Images (`img.html`)**:  
  `{{< img src="/image.png" alt="Alt text" caption="Caption" loading="lazy" >}}`

- **RSS Feeds Grid (`rss-feeds.html`)**:  
  `{{< rss-feeds >}}` — renders an interactive grid of RSS links for all site sections.

---

## License

Distributed under the **GNU General Public License v3.0**.

The GPL applies strictly to the source code, templates, and styling of this theme. Site content created using Biforma remains the exclusive property of its respective author under their chosen license.

Full text of the license: [LICENSE](./LICENSE).
