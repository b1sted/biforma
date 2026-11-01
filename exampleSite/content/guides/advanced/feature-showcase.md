---
title: "Feature Showcase"
subtitle: "A single page that exercises the theme's typography, components, math, code, and shortcodes."
description: "Use this page as a visual reference for every major Biforma content component."
icon: "🧪"
date: 2026-10-15
lastmod: 2026-10-20
weight: 20
group: "Extending the theme"
tags: ["showcase", "markdown", "math", "shortcodes"]
categories: ["Documentation"]
difficulty: "Hard"
featured: true
math: true
mermaid: true
image: "/cover.png"
sources:
  - id: hugo-docs
    author: "Hugo Authors"
    title: "Hugo Documentation"
    publisher: "gohugo.io"
    year: 2026
    url: "https://gohugo.io/documentation/"
  - id: katex-docs
    author: "KaTeX Contributors"
    title: "KaTeX Supported Functions"
    publisher: "katex.org"
    year: 2026
    url: "https://katex.org/docs/supported.html"
  - id: knuth-taocp
    author: "Donald E. Knuth"
    title: "The Art of Computer Programming"
    publisher: "Addison-Wesley"
    year: 1997
    url: "https://www-cs-faculty.stanford.edu/~knuth/taocp.html"
projectMeta: true
screenshot: "/project-screenshot.png"
projectType: "Theme showcase"
language: "Markdown"
year: 2026
linesOfCode: "~350"
modules: "All content modules"
duration: "1 day"
status: "Reference"
github: "https://github.com/example/biforma-demo"
demo: "https://example.org"
documentation: "https://example.org/guides/"
---

This page is a compact visual reference for the theme. The **page title above is
the document's `h1`**; the content hierarchy starts at `h2` and goes down to
`h4`. Everything below is ordinary Markdown or a theme shortcode.

{{< admonition type="note" title="How to use this page" >}}
Open it in a browser, switch between light and dark mode, and use the table of
contents on the right to jump between sections. The source file is a good
starting point for your own component tests.
{{< /admonition >}}

## Heading hierarchy

The page title is the only `h1`. Use `h2` for major sections, `h3` for
subsections, and `h4` for focused blocks.

### H3 — subsection

H3 headings are used for subsections inside a major section.

#### H4 — focused block

H4 headings define a narrower topic. Deeper levels (`h5`, `h6`) are supported by
the renderer but are not used on this page.

## Text formatting

Standard inline styles are supported:

- **Bold text** for emphasis.
- *Italic text* for a term.
- ***Bold italic*** for strong emphasis.
- ~~Strikethrough~~ for deprecated information.
- `Inline code` for identifiers such as `Page.RelPermalink`.
- A [relative link](/guides/) and an [external link](https://example.org/).

Long inline code should wrap on narrow screens:
`struct ExampleWithAVeryLongName { int id; char name[256]; };`.

## Lists

### Unordered list

- First-level item
  - Nested second-level item
    - Nested third-level item
- Second first-level item
- Third first-level item

### Ordered list

1. Install Hugo.
2. Add the theme.
3. Create content.
   1. Add front matter.
   2. Add Markdown.
4. Build the site.

### Task list

- [x] Configure the site
- [x] Add the documentation section
- [ ] Replace the placeholder brand assets

## Blockquotes

> Documentation is a conversation between the author and the reader.
> Good structure makes that conversation easier to follow.

A multi-paragraph quote:

> First paragraph of the quote.
>
> Second paragraph with `inline code` and a [link](/guides/).

### Quote shortcode

{{< quote translation="A translation can be shown below the original quote." source="Demo Author, [Example](https://example.org)" >}}
The best documentation is the documentation that answers the question before
the reader has to ask it.
{{< /quote >}}

## Admonitions

{{< admonition type="note" title="Note" >}}
A note adds context without interrupting the main flow.
{{< /admonition >}}

{{< admonition type="tip" title="Tip" >}}
Use tips for shortcuts, best practices, and optional improvements.
{{< /admonition >}}

{{< admonition type="warning" title="Warning" >}}
Warnings flag behavior that can surprise the reader, such as a required build
step.
{{< /admonition >}}

{{< admonition type="danger" title="Danger" >}}
Danger blocks are reserved for destructive actions or security-sensitive
mistakes.
{{< /admonition >}}

## Tables

| Component | Front matter or shortcode | Notes |
|:----------|:--------------------------|:------|
| TOC | `toc: true` | Generated from `h2`–`h4` |
| Math | `math: true` | KaTeX rendering |
| Diagrams | `mermaid: true` | Lazy-loaded Mermaid |
| Groups | `group: "Name"` | Collapsible sidebar categories |
| Cover image | `image: "/cover.png"` | Open Graph and article figure |

## Code blocks

A fenced block with syntax highlighting:

```go
package main

import "fmt"

func main() {
    message := "Hello from the Biforma example site"
    fmt.Println(message)
}
```

The `code` shortcode adds a filename header, a copy button, and optional line
numbers:

{{< code lang="go" title="main.go" linenos="true" >}}
package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println(greet("Demo Author"))
}
{{< /code >}}

A headerless block is useful for terminal output:

{{< code lang="text" noheader="true" >}}
$ hugo --source exampleSite --gc --minify
$ npx pagefind --site exampleSite/public
{{< /code >}}

### Code tabs

{{< tabs tabs="Bash,PowerShell" >}}
```bash
hugo new site my-docs
cd my-docs
```

<!-- tab -->

```powershell
hugo new site my-docs
Set-Location my-docs
```
{{< /tabs >}}

### Side-by-side comparison

{{< compare copy="true" >}}
  {{< compare-left title="Before" lang="text" >}}
Build the site, then run Pagefind.
The search index lives in public/pagefind/.
  {{< /compare-left >}}

  {{< compare-right title="After" lang="text" >}}
hugo --gc --minify
npx pagefind --site public
The search modal now returns results.
  {{< /compare-right >}}
{{< /compare >}}

## Math and equations

Inline math works with `$...$`: the mass-energy relation is $E = mc^2$.

Display math uses `$$...$$`:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

The `equation` shortcode numbers formulas and creates an anchor:

{{< equation label="energy" >}}
E = mc^2
{{< /equation >}}

Equation {{< eqref "energy" >}} is the mass-energy equivalence. The next formula
is the Gaussian integral:

{{< equation label="gaussian" >}}
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
{{< /equation >}}

Equation {{< eqref "gaussian" >}} appears again here as a back-reference.

KaTeX supports a wide range of functions{{< cite "katex-docs" >}}. Hugo's
passthrough configuration keeps the delimiters intact{{< cite "hugo-docs" >}}.

## Footnotes

Footnotes are ordinary Markdown and get two-way links automatically.[^1] The
theme adds smooth scrolling and a short target highlight, with a reduced-motion
fallback.[^2]

[^1]: A footnote definition can contain **inline markup**, `code`, and
    [links](https://example.org/).

[^2]: The highlight is driven by `:target` and uses paint-only properties, so it
    does not cause layout shift.

## Diagrams

{{< mermaid scale="0.9" caption="Figure 1. A small publishing pipeline." >}}
graph LR
    A[Write Markdown] --> B[Hugo build]
    B --> C[Pagefind index]
    C --> D[Deploy]
{{< /mermaid >}}

## Definitions

The theme supports inline and modal explanations for terms. An inline
definition {{< define term="shortcode" >}}a reusable template fragment invoked from Markdown{{< /define >}}
is expanded in place.

A longer explanation opens in a focus-trapped modal:

{{< define term="Pagefind" title="Pagefind search index" >}}
**Pagefind** is a static search library that indexes the generated HTML after
the Hugo build.

- The index is written to `public/pagefind/`.
- The theme lazy-loads it when the search modal opens.
- Results are filtered by the page language.
{{< /define >}}

## Images and figures

{{< img src="/cover.png" alt="Biforma Demo cover image" caption="A placeholder cover image rendered by the img shortcode." loading="lazy" >}}

## Dividers

{{< divider type="dots" >}}

{{< divider type="decorated" >}}

{{< divider type="thin" >}}

{{< divider type="section" >}}

## Project components

The metadata block at the top of this page comes from `projectMeta: true` and
the related front matter. The infobox below is the shortcode version:

{{< project-infobox
    title="Biforma Example Site"
    image="/project-screenshot.png"
    type="Hugo theme demo"
    status="Reference"
    year="2026"
    language="Markdown, TOML"
    framework="Hugo"
    platform="Web"
    architecture="Static site"
    lines="~350"
    files="20+"
    modules="All content modules"
    dependencies="Hugo 0.156+, Pagefind"
    database="—"
    api="—"
    performance="Static output"
    accuracy="—"
    coverage="—"
    grade="—"
    team="Demo Author"
    duration="1 day"
    license="GPL-3.0"
    tags="Hugo, Markdown, Pagefind"
    github="https://github.com/example/biforma-demo"
    demo="https://example.org"
    documentation="https://example.org/guides/"
>}}

## RSS feeds

{{< rss-feeds >}}

## Global UI checklist

The following elements are rendered by layouts rather than Markdown:

| Element | Where to look |
|:--------|:--------------|
| Breadcrumbs | Above the page title |
| Table of contents | Right sidebar on desktop, collapsible block on mobile |
| Search | Header trigger or <kbd>Ctrl</kbd> + <kbd>K</kbd> |
| Theme toggle | Header sun/moon button |
| Section navbox | Below this article (Advanced has multiple pages) |
| Previous/next navigation | Bottom of this article |
| Article tags | Below the article |
| Donation block | Below the article when a donate URL is configured |
| License modals | Footer license links |
| Scroll-to-top button | Appears while scrolling |
| Image lightbox | Click the cover or project screenshot |
| Mermaid lightbox | Click the diagram above |
| 404 page | `/404.html` |
| About page | `/about/` |
| RSS feeds | `/rss.xml`, `/blog/rss.xml`, `/guides/rss.xml` |
| PWA assets | `/manifest.json`, `/sw.js`, `/offline.html` |

The theme's source citations use the `sources` front matter and the `cite`
shortcode. Knuth's *The Art of Computer Programming* is a classic reference for
the kind of structured technical writing this theme is designed for{{< cite "knuth-taocp" >}}.
