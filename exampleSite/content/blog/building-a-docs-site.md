---
title: "Building a Documentation Site"
description: "A practical structure for sections, nested sections, groups, and article ordering."
date: 2026-10-05
lastmod: 2026-10-18
tags: ["documentation", "structure", "navigation"]
categories: ["Guides"]
image: "/cover-blog-2.png"
difficulty: "Medium"
---

{{< img src="/cover-blog-2.png" alt="Building a documentation site cover image" caption="A placeholder cover image for the documentation article." >}}

A documentation site is easiest to maintain when its structure is obvious from
the filesystem. Biforma maps directories to navigation and front matter to the
details.

## Start with the reader's path

Before creating files, write down the order in which a new reader should learn
the product:

1. What is it?
2. How do I install it?
3. How do I configure it?
4. How do I extend it?
5. How do I deploy it?

That list usually becomes your top-level sections and the `weight` values on
their `_index.md` files.

## Use nested sections for depth

A section can contain other sections. In this example, `guides/` contains
`getting-started/` and `advanced/`. The sidebar renders that hierarchy directly,
so readers can collapse the parts they do not need.

```text
guides/
├── _index.md
├── overview.md
├── getting-started/
│   ├── _index.md
│   └── installation.md
└── advanced/
    ├── _index.md
    └── deployment.md
```

## Group related articles

The `group` front matter value collects pages into a collapsible category on the
section page and in the sidebar:

| Group | Example pages | Why group them? |
|:------|:--------------|:----------------|
| Fundamentals | Installation, Configuration | Shared prerequisites |
| Extending the theme | Customization, Showcase | Optional deep dives |
| Shipping | Deployment | The final step |

{{< admonition type="tip" title="Keep group names stable" >}}
Group names are keys. If you rename a group, update
`data/section_categories.yaml` as well so its icon and description still match.
{{< /admonition >}}

## Let the theme do the rest

Once the structure is in place, the theme generates breadcrumbs, previous/next
navigation, a section navbox, article cards, and RSS feeds. You only need to
write the content.
