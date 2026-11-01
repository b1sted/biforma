---
title: "A Markdown Workflow"
description: "A lightweight writing workflow for technical notes, with front matter, footnotes, and a repeatable build."
date: 2026-09-28
lastmod: 2026-10-15
tags: ["markdown", "writing", "workflow"]
categories: ["Writing"]
image: "/cover-blog-3.png"
difficulty: "Easy"
---

{{< img src="/cover-blog-3.png" alt="A Markdown workflow cover image" caption="A placeholder cover image for the writing workflow article." >}}

The best writing workflow is the one you actually use. For technical notes, a
plain Markdown file with a small front matter block is hard to beat.

## A minimal front matter block

```yaml
---
title: "A Markdown Workflow"
date: 2026-09-28
tags: ["markdown", "writing"]
categories: ["Writing"]
image: "/cover-blog-3.png"
---
```

The title and description appear in cards, search results, and social metadata.
The date controls ordering, the tags appear as chips, and the image is used for
Open Graph previews.

## Write in small passes

1. **Draft the outline.** Use `h2` headings for the main beats.
2. **Add the details.** Fill in examples, code, and links.
3. **Trim the repetition.** Remove anything the reader can infer.
4. **Check the build.** Run Hugo with warnings enabled.

```bash
hugo --source exampleSite --panicOnWarning
```

> A page is finished when a reader can solve the problem without asking a
> follow-up question.

## Footnotes are enough for asides

Sometimes a detail matters but does not deserve its own section. A footnote keeps
the main text focused.[^1]

[^1]: Footnotes get two-way links and a short highlight when you jump back and
    forth. The theme handles the anchor offsets for the fixed header.

## Publish

Commit the Markdown, run the build, generate the search index, and upload the
static output. That is the entire pipeline.
