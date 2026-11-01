---
title: "Installation"
description: "Create a Hugo site, add the theme, and start the development server."
icon: "📦"
date: 2026-09-03
lastmod: 2026-10-20
weight: 10
group: "Fundamentals"
group_description: "The minimum steps to get a working site"
tags: ["install", "hugo", "setup"]
difficulty: "Easy"
---

## Create a new site

```bash
hugo new site my-docs
cd my-docs
```

## Add the theme

The example site uses a relative `themesDir` so it can run directly from the
theme repository. For a real project, add the theme as a Git submodule:

```bash
git submodule add https://github.com/example/biforma.git themes/biforma
```

Then set the theme in `hugo.toml`:

```toml
theme = "biforma"
```

## Run the example site

From the theme repository root:

```bash
hugo server --source exampleSite
```

Open <http://localhost:1313/>. The documentation home page lists the available
sections and the most recently updated pages.

## Build for production

```bash
hugo --source exampleSite --gc --minify
npx pagefind --site exampleSite/public
```

The first command writes the site to `exampleSite/public/`. The second command
creates the Pagefind index used by the search modal.

{{< admonition type="warning" title="Search index required" >}}
The search modal loads `/pagefind/pagefind.js`. If you open the site without
running Pagefind, the modal displays a short instruction instead of results.
{{< /admonition >}}
