---
title: "Introduction"
description: "What this example site contains and how to navigate the documentation."
icon: "🚀"
date: 2026-09-01
lastmod: 2026-10-20
weight: 10
group: "Orientation"
group_description: "A short tour before you dive into the guides"
tags: ["overview", "getting-started"]
difficulty: "Easy"
---

This example site is the canonical showcase for the **Biforma** Hugo theme. It
is designed to be copied, edited, and used as a starting point for your own
documentation or blog.

## What is included

- A multi-level **documentation section** with root pages, nested sections,
  collapsible groups, and leaf articles.
- A small **blog** with dated posts, tags, categories, cover images, and
  reading times.
- A **feature showcase** that exercises headings, code blocks, math, footnotes,
  tables, callouts, tabs, comparison blocks, diagrams, and more.
- An **About** page, an RSS directory, an offline page, and a web app manifest.

## How the navigation works

The documentation sidebar is generated from content, not from a hard-coded menu:

1. Regular pages stored in `content/` appear under **Start Here**.
2. Every top-level section becomes a sidebar section.
3. Nested sections become nested sidebar sections.
4. Pages with the same `group` front matter value are collected into a
   collapsible category.

The `menu.main` table in `hugo.toml` is included for custom templates; the
theme's built-in navigation does not require it.

## Next steps

Continue with [Installation](/guides/getting-started/installation/) or read
about [content organization](/guides/getting-started/content-organization/).
