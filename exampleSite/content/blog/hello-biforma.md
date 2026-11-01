---
title: "Hello, Biforma"
description: "A short introduction to the dual-mode Hugo theme and what this example site demonstrates."
date: 2026-10-12
lastmod: 2026-10-20
tags: ["hugo", "theme", "documentation"]
categories: ["Announcements"]
image: "/cover-blog-1.png"
featured: true
difficulty: "Easy"
---

{{< img src="/cover-blog-1.png" alt="Hello, Biforma cover image" caption="A placeholder cover image for the first blog post." loading="eager" fetchpriority="high" >}}

**Biforma** is a dual-mode Hugo theme for documentation, knowledge bases, and
personal blogs. It keeps the same content model in both modes: sections become
navigation, pages become articles, and front matter controls the presentation.

## Why a dual-mode theme?

Documentation and blogging have different reading rhythms. A documentation
site benefits from a persistent tree, a table of contents, and grouped article
lists. A blog benefits from a feed, dates, reading times, and tags. Biforma lets
you choose the home-page experience without maintaining two content trees.

## What is in this example

- A multi-level **Guides** section with nested sections and collapsible groups.
- A small **Blog** section with dated articles and cover images.
- A **Feature Showcase** page that exercises the theme's components.
- An **About** page, RSS directory, PWA manifest, and offline fallback.

## Try it locally

```bash
hugo server --source exampleSite
```

Then open <http://localhost:1313/> and use the search trigger or
<kbd>Ctrl</kbd> + <kbd>K</kbd> to open the search modal. Build the Pagefind index
before testing search results:

```bash
npx pagefind --site exampleSite/public
```

The theme is designed to stay out of the way: write Markdown, choose a mode, and
publish static files.
