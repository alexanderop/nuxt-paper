# NuxtPaper

A port of [AstroPaper](https://github.com/satnaing/astro-paper) (v6) — a minimal,
responsive, accessible and SEO-friendly blog theme — to **Nuxt 4** and
**Nuxt Content v3**.

## Stack

| Concern        | AstroPaper                  | NuxtPaper                                |
| -------------- | --------------------------- | ---------------------------------------- |
| Framework      | Astro 6                     | Nuxt 4 (Vue 3)                           |
| Content        | Astro content collections   | @nuxt/content v3 (`content.config.ts`)   |
| Styling        | Tailwind CSS v4             | Tailwind CSS v4 (`@tailwindcss/vite`)    |
| Typography     | @tailwindcss/typography     | @tailwindcss/typography                  |
| Fonts          | Astro fonts (Google)        | @nuxt/fonts (Google Sans Code)           |
| Search         | Pagefind                    | MiniSearch + `queryCollectionSearchSections` |
| Code highlight | Shiki (min-light/night-owl) | Shiki via Nuxt Content (same themes)     |
| Callouts       | rehype-callouts             | rehype-callouts (obsidian theme)         |
| TOC            | remark-toc                  | remark-toc                               |
| RSS / Sitemap  | @astrojs/rss + sitemap      | Nitro server routes (`/rss.xml`, `/sitemap.xml`) |

## Features

- Light/dark mode with FOUC-free inline theme script and OS-preference sync
- Paginated post list (`/posts`, `/posts/2`, …) and per-tag pagination
- Tags, archives (grouped by year/month), about page, fuzzy search
- Featured/recent sections on the home page
- Draft posts and scheduled publishing (15-min margin), hidden in production
- Reading progress bar, copy-code buttons, back-to-top, prev/next post nav
- Share links, edit-page link, breadcrumbs, skip-to-content, RSS + sitemap
- Full SSG via `nuxt generate` (deployable to any static host)

## Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm generate   # static build in .output/public
```

## Configuration

Site metadata, feature flags, socials and share links live in
`shared/utils/site.ts` (the equivalent of `astro-paper.config.ts`).
UI strings live in `shared/utils/i18n.ts`.

## Content

Posts are markdown files in `content/posts/` (drafts: `draft: true`).
Frontmatter schema is defined in `content.config.ts`. The original AstroPaper
posts were migrated with `scripts/migrate-content.mjs` (MDX → MDC conversion,
slug-based file names, image path rewrites).

## License & credits

MIT — this is a port of [AstroPaper](https://github.com/satnaing/astro-paper)
by [Sat Naing](https://satna.ing), whose original MIT copyright notice is
retained in [LICENSE](./LICENSE). The demo blog posts are AstroPaper's
original content.

## Not ported

- Dynamic per-post OG image generation (satori) — posts fall back to the
  default OG image
- `remark-collapse` (the TOC renders expanded)
- View-transition names on post titles/tags (document-level transitions are
  enabled via `experimental.viewTransition`)
