---
author: Alexander Opalic
pubDatetime: 2026-06-10T07:00:00Z
title: How I Ported AstroPaper to Nuxt Content with Fable 5
featured: true
draft: false
tags:
  - nuxt
  - nuxt-content
  - ai
  - port
description: "A full walkthrough of porting the AstroPaper blog theme from Astro 6 to Nuxt 4 and Nuxt Content v3 — done in one session with Claude Code running Fable 5."
---

This entire blog is a port of [AstroPaper](https://github.com/satnaing/astro-paper) — Sat Naing's minimal, accessible Astro blog theme — rebuilt on **Nuxt 4** and **Nuxt Content v3**. The port was done in a single session by Claude Code running **Fable 5**, and this post documents exactly how it went: the plan, the architecture mapping, and the gotchas that only showed up once a real browser looked at the result.

## Table of contents

## The starting point

The prompt was simple: _"create a port of astro-paper, clone this to tmp, but use Nuxt 4 and Nuxt Content."_ The agent's first moves:

1. `git clone --depth 1` AstroPaper into `/tmp/astro-paper`
2. Read the Nuxt and Nuxt Content `llms.txt` docs to confirm current APIs
3. Read **every** source file of the theme — config, layouts, components, pages, utils, and all three CSS files — before writing a single line

That last step mattered. AstroPaper v6 has subtle behavior baked in: frontmatter `slug` overrides file names, underscore-prefixed directories are stripped from URLs (the release posts live in `_releases/` but appear at `/posts/astro-paper-v6`), and scheduled posts get a 15-minute publish margin. Skipping the reading phase would have produced a port that *looked* right and behaved wrong.

## Mapping Astro concepts to Nuxt

| AstroPaper (Astro 6)             | NuxtPaper (Nuxt 4)                            |
| -------------------------------- | --------------------------------------------- |
| Content collections + glob loader | `@nuxt/content` collections in `content.config.ts` |
| `getCollection("posts")`         | `queryCollection("posts")` + `useAsyncData`   |
| `.astro` components              | Vue SFCs with auto-import                     |
| `getStaticPaths` pagination      | One catch-all route deciding list vs. detail  |
| Pagefind search                  | MiniSearch + `queryCollectionSearchSections`  |
| `@astrojs/rss` / sitemap         | Nitro server routes (`/rss.xml`, `/sitemap.xml`) |
| Inline theme script in Layout    | `app.head.script` + a `useTheme` composable   |

The trickiest routing decision: Astro disambiguates `/posts/2` (pagination) from `/posts/my-post` (detail) at build time via `getStaticPaths`. Nuxt routes dynamically, so the port uses a single `pages/posts/[...slug].vue` catch-all — an empty or numeric segment renders the paginated list, anything else renders the post.

```ts
// pages/posts/[...slug].vue
const isList = computed(
  () =>
    segments.value.length === 0 ||
    (segments.value.length === 1 && /^\d+$/.test(segments.value[0]!))
);
```

## Porting the design

AstroPaper's look survives almost verbatim because both projects use Tailwind CSS v4:

- `theme.css` — the design tokens (`--background`, `--accent`, …) copied as-is, including the `@custom-variant dark` that keys off `data-theme="dark"`
- `typography.css` — the `app-prose` overrides ported with one change: Astro's `.astro-code` selectors became Nuxt Content's `.shiki`
- The Tabler icons were code-generated: a small script read every SVG from the cloned repo and wrapped each one in a Vue SFC

The FOUC-free dark mode works the same way as the original — an inline script in `<head>` sets `data-theme` before first paint, and a `useTheme` composable handles toggling, `localStorage`, and OS-preference sync.

## Migrating the content

A migration script (`scripts/migrate-content.mjs`) converted the original posts:

- Files renamed to their frontmatter `slug`, so every URL matches the original site
- `_releases/` and `_color-schemes/` flattened into the posts root, mirroring Astro's underscore-stripping
- MDX converted to MDC: imports stripped, `<ResponsiveTable>` JSX rewritten to `::responsive-table` blocks backed by a Vue component in `components/content/`
- Image references rewritten to `/images/` in `public/`

## The gotchas

This is the part worth reading. Three issues only surfaced when the agent drove a real browser against the dev server.

> \[!NOTE]
> Everything below was found by taking screenshots with a browser-automation CLI and actually looking at them — not by tests or type checks.

### 1. pnpm blocks native build scripts

Nuxt Content v3 stores content in SQLite via `better-sqlite3`. The first `pnpm dev` crashed with *"Could not locate the bindings file"* because pnpm refuses to run install scripts by default. Fix:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["better-sqlite3"]
  }
}
```

…followed by `pnpm rebuild better-sqlite3`.

### 2. Shiki tokens are class-based, not inline

Astro emits Shiki tokens with inline styles. Nuxt Content emits *classes* (`<span class="sCRLn">`) plus a generated stylesheet of `--shiki-default` / `--shiki-dark` variables, and switches them via the `dark` class on `<html>`. Token colors worked out of the box — but the `<pre>` element ships with an **empty** `style` attribute, so Tailwind Typography's default dark-gray code background showed through in both themes. The fix was defining the block backgrounds explicitly:

```css
.app-prose pre.shiki {
  --shiki-default-bg: #ffffff; /* min-light */
  --shiki-dark-bg: #011627; /* night-owl */
  background-color: var(--shiki-default-bg);
}

html[data-theme="dark"] .app-prose pre.shiki {
  background-color: var(--shiki-dark-bg);
}
```

### 3. MDC eats callout markers

AstroPaper uses `rehype-callouts` for GitHub-style `> [!TIP]` callouts. In Nuxt Content they rendered as plain blockquotes containing a mysterious `<span>!TIP</span>` — because MDC's inline span syntax (`[text]`) consumed the brackets **before** the rehype plugin ever ran. The migration script now escapes them:

```js
out = out.replace(/^(>\s*)\[!(\w+)\]/gm, "$1\\[!$2]");
```

With the escape in place, `rehype-callouts` sees the literal `[!TIP]` and renders proper callouts — like the one above.

## Verification

The port wasn't declared done until:

- Every route returned the right status code (`/`, pagination, nested post URLs, tags, archives, search, RSS, sitemap, and a 404 for garbage paths)
- Screenshots confirmed both themes, code highlighting, callouts, tables, the mobile hamburger menu, and search results
- `nuxt generate` produced a fully static build — 96 prerendered routes, with draft posts correctly excluded from the output, the RSS feed, and the sitemap

## What was deliberately left out

- **Dynamic OG images** — AstroPaper renders per-post OG images with satori; the port falls back to a static default image
- **remark-collapse** — the table of contents renders expanded
- **Per-element view transitions** — document-level transitions are enabled, but the title/tag morph animations were skipped

## Takeaway

The port took one session: read everything first, map the concepts honestly, migrate content with a script instead of by hand, and verify in a real browser — because the only three real bugs were ones no compiler would ever catch.
