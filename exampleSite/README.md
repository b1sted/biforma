# Biforma Example Site

This directory is the canonical example site for the **Biforma** Hugo theme. It
is self-contained: `hugo.toml` points at the parent theme directory through
`themesDir`, so you can build it without installing the theme anywhere else.

## Requirements

- Hugo Extended **0.156.0** or newer
- Node.js and `npx` only if you want to generate the Pagefind search index

## Run locally

From the theme repository root:

```bash
hugo server --source exampleSite
```

Open <http://localhost:1313/>.

## Build and validate

```bash
hugo --source exampleSite --gc --minify --panicOnWarning
```

The output is written to `exampleSite/public/`.

## Enable search

Pagefind indexes the generated HTML after Hugo finishes:

```bash
hugo --source exampleSite --gc --minify
npx pagefind --site exampleSite/public
```

The theme lazy-loads `/pagefind/pagefind.js` when the search modal opens. Without
the index, the modal shows a short instruction instead of results.

## Preview blog mode

The site ships with `themeMode = "docs"`. To preview the blog layout, change the
value in `exampleSite/hugo.toml`:

```toml
[params]
  themeMode = "blog"
```

The same content is reused. In blog mode the home page renders the bento feed
and the sidebar switches to the profile/category layout.

## Content map

| Path | Demonstrates |
|:-----|:-------------|
| `content/_index.md` | Documentation home page |
| `content/introduction.md`, `content/changelog.md` | Root-level pages in the sidebar |
| `content/guides/` | Multi-level documentation section |
| `content/guides/getting-started/` | Nested section and collapsible groups |
| `content/guides/advanced/` | Nested section with multiple groups |
| `content/guides/advanced/feature-showcase.md` | Rich Markdown, math, footnotes, tables, and shortcodes |
| `content/blog/` | Dated articles with tags, categories, and cover images |
| `content/about.md` | About layout with profile, social links, and projects |
| `content/rss/` | RSS directory built with the `rss-feeds` shortcode |
| `data/section_categories.yaml` | Shared group icons and descriptions |

## Placeholder assets

All names, links, social handles, and images are generic placeholders:

- Author: **Demo Author**
- Email: `hello@example.org`
- GitHub: `https://github.com/example`
- Telegram: `https://t.me/example`
- Base URL: `https://example.org/`

Replace the files in `static/` with your own brand assets before publishing.
