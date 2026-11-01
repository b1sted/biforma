---
title: "Deployment"
description: "Build the site, generate the search index, and publish the static output."
icon: "🚀"
date: 2026-09-12
lastmod: 2026-10-20
weight: 30
group: "Shipping"
group_description: "Build and publish the generated site"
tags: ["deployment", "pagefind", "ci"]
difficulty: "Medium"
---

## Build

```bash
hugo --source exampleSite --gc --minify
```

The output is written to `exampleSite/public/`.

## Search index

```bash
npx pagefind --site exampleSite/public
```

Run Pagefind **after** Hugo so the generated HTML is available to the indexer.
The theme's service worker deliberately skips `pagefind/` assets.

## Deploy

Upload the contents of `exampleSite/public/` to any static host. The site has no
server-side runtime requirements.

{{< admonition type="tip" title="Cache headers" >}}
Fingerprinted CSS and JavaScript can be cached for a long time. HTML and the
Pagefind index should use a shorter cache lifetime so content updates appear
promptly.
{{< /admonition >}}

## Optional build-time rendering

The theme can pre-render KaTeX and Mermaid output during the build:

```bash
node scripts/render-math.js public
node scripts/render-mermaid.js public
```

Both scripts are optional. Without them, the client-side modules render the
same content on demand.
