---
title: "Configuration"
description: "The theme parameters you are most likely to change first."
icon: "🎛️"
date: 2026-09-04
lastmod: 2026-10-20
weight: 20
group: "Fundamentals"
tags: ["configuration", "toml", "theme-mode"]
difficulty: "Easy"
---

The example `hugo.toml` documents every parameter used by the theme. The most
important ones are grouped below.

## Layout mode

```toml
[params]
  themeMode = "docs" # or "blog"
```

- `docs` renders the tree-view sidebar, the documentation landing page, and
  grouped article lists.
- `blog` renders a bento post feed on the home page and a profile/category
  sidebar.

## Branding

```toml
[params]
  logo = "📘"
  description = "A canonical example site for the Biforma Hugo theme."
  author = "Demo Author"
  role = "Documentation Maintainer"
  avatar = "/avatar.png"
```

`logo` accepts an emoji or a path to an image. `avatar` is used by the blog
profile and the About page; `avatarEmoji` takes precedence in blog mode.

## Navigation

```toml
[params]
  mainSite = "https://example.org"
  showAbout = true

  [params.social]
    github = "https://github.com/example"
    telegram = "https://t.me/example"
    email = "hello@example.org"

  [params.externalLinks]
    donateUrl = "https://example.org/donate"
```

The header, footer, sidebar, and donation block share the same contact-link
fallback chain.

## Search

Pagefind is a separate build step. The theme only needs `searchPlaceholder`:

```toml
[params]
  searchPlaceholder = "Search the demo..."
```

Build the index after Hugo:

```bash
npx pagefind --site exampleSite/public
```

{{< admonition type="tip" title="Keep the TOC depth in sync" >}}
`params.tocMaxLevel` controls heading anchors. Set it to the same value as
`markup.tableOfContents.endLevel`; Hugo does not expose that setting to
templates.
{{< /admonition >}}
