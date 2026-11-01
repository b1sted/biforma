---
title: "Customization"
description: "Change colors, fonts, navigation labels, and content modules without forking the theme."
icon: "🎨"
date: 2026-09-10
lastmod: 2026-10-20
weight: 10
group: "Extending the theme"
group_description: "Make the theme match your project"
tags: ["css", "customization", "assets"]
difficulty: "Medium"
---

## Override CSS variables

The theme exposes its design tokens as CSS custom properties. Add a small
stylesheet to your site and load it after the theme bundle:

```css
:root {
  --accent-primary: #2563eb;
  --radius-md: 10px;
}
```

## Replace the logo and avatar

```toml
[params]
  logo = "/logo.svg"
  avatar = "/avatar.png"
```

Both values accept a root-relative path or an absolute URL. Emoji values are
also supported for `logo` and `avatarEmoji`.

## Tune the module bundles

CSS and JavaScript are selected per page kind from `data/css_modules.yaml` and
`data/js_modules.yaml`. Copy either file into your site's `data/` directory to
override the theme map without changing the theme itself.

{{< admonition type="warning" title="Keep the schema" >}}
When overriding a module map, preserve the `core`, `by_kind`, and (for
JavaScript) `entries` keys. Missing keys fall back to the theme defaults.
{{< /admonition >}}

## Change navigation labels

The sidebar root title comes from `params.sidebar.generalTitle`. Interface
strings are translated through `i18n/en.toml`; override a string by adding the
same key to your site's `i18n/` directory.
