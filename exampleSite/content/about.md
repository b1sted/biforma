---
title: "About"
type: "about"
layout: "about"
searchHidden: true
icon: "👤"
weight: 30
group: "Orientation"
date: 2026-09-01
lastmod: 2026-10-20
profile:
  name: "Demo Author"
  avatar: "/avatar.png"
  role: "Documentation Maintainer"
social:
  - name: "GitHub"
    icon: "github"
    url: "https://github.com/example"
  - name: "Telegram"
    icon: "telegram"
    url: "https://t.me/example"
  - name: "Email"
    icon: "mail"
    url: "#"
    label: "hello@example.org"
    data_email: "aGVsbG9AZXhhbXBsZS5vcmc="
bio:
  title: "About this demo"
  text: "This example site is maintained by **Demo Author**, a fictional documentation maintainer. It exists to demonstrate the Biforma theme with safe, generic placeholders."
tech_stack: ["Hugo", "Go templates", "Markdown", "JavaScript", "Pagefind"]
projects:
  title: "Demo projects"
  items:
    - name: "Biforma Example Site"
      icon: "📘"
      description: "The canonical showcase for the theme, including documentation, blog, and rich content pages."
      tech: "Hugo • Markdown"
      links:
        - text: "View"
          url: "https://example.org/"
    - name: "Docs Starter"
      icon: "🧭"
      description: "A minimal documentation skeleton with nested sections and grouped articles."
      tech: "Hugo • TOML"
      links:
        - text: "View"
          url: "https://example.org/guides/"
    - name: "Static Search Notes"
      icon: "🔎"
      description: "A research note on client-side search for static sites."
      tech: "Pagefind • JavaScript"
      academic: true
      links:
        - text: "Read"
          url: "https://example.org/blog/"
---

This page demonstrates the **About** layout: a profile card, social links,
Markdown body content, a technology stack, and a project showcase with an
academic toggle.

All names, links, and contact details are generic placeholders. Replace them
with your own information before publishing.

{{< admonition type="note" title="Email obfuscation" >}}
The email link uses the theme's base64-encoded `data_email` attribute. The
address is only assembled in the browser, which reduces scraping by simple
bots.
{{< /admonition >}}
