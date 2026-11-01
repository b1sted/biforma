---
title: "RSS — Subscribe to Updates"
description: "How to subscribe to the demo site's documentation and blog feeds."
icon: "📡"
date: 2026-09-01
lastmod: 2026-10-20
weight: 100
toc: false
searchHidden: true
---

## Available feeds

The theme generates a home feed and a feed for every section. Use the cards
below to copy a feed URL or open it in a new tab.

{{< rss-feeds >}}

## How to subscribe

1. Install an RSS reader.
2. Copy the feed URL for the section you care about.
3. Add the URL to your reader.
4. New articles appear automatically after the next build.

## Reader suggestions

- **Cross-platform:** [Feedly](https://feedly.com), [Inoreader](https://www.inoreader.com)
- **Desktop:** [Thunderbird](https://www.thunderbird.net), [Fluent Reader](https://hyliu.me/fluent-reader/)
- **Browser:** [Feedbro](https://nodetics.com/feedbro/)

{{< admonition type="tip" title="Focused feeds" >}}
Subscribe to `/blog/rss.xml` for articles only, or `/guides/rss.xml` for
documentation updates. The home feed combines the sections listed in
`params.rssSections`.
{{< /admonition >}}
