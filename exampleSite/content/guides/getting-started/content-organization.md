---
title: "Content Organization"
description: "How sections, nested sections, and groups produce the documentation tree."
icon: "🗂️"
date: 2026-09-05
lastmod: 2026-10-20
weight: 30
group: "Fundamentals"
tags: ["content", "sections", "groups"]
difficulty: "Medium"
---

## Directory layout

The example site uses this structure:

```text
content/
├── _index.md
├── introduction.md
├── changelog.md
├── guides/
│   ├── _index.md
│   ├── overview.md
│   ├── getting-started/
│   │   ├── _index.md
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   └── content-organization.md
│   └── advanced/
│       ├── _index.md
│       ├── customization.md
│       ├── feature-showcase.md
│       └── deployment.md
├── blog/
│   ├── _index.md
│   └── *.md
└── about.md
```

## What becomes a sidebar section?

- A directory with an `_index.md` file becomes a section.
- Nested directories with `_index.md` become nested sidebar sections.
- Regular `.md` files become leaf articles.
- Regular pages in the content root appear under **Start Here**.

## What becomes a collapsible category?

Pages in the same section that share a `group` value are collected into a
collapsible category:

```yaml
---
title: "Installation"
group: "Fundamentals"
group_icon: "📦"
group_description: "The minimum steps to get a working site"
---
```

The theme also reads `data/section_categories.yaml` to supply a shared icon and
description for a group:

```yaml
- key: "Fundamentals"
  icon: "📦"
  description: "The minimum steps to get a working site"
```

Group metadata resolves in this order:

1. `data/section_categories.yaml`
2. `group_icon` / `group_description` on the first page in the group
3. Neutral defaults

{{< admonition type="note" title="Ordering" >}}
Use `weight` to control the order of sections, nested sections, and articles.
Lower values appear first.
{{< /admonition >}}
