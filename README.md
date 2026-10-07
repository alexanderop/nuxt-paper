# NuxtPaper

[AstroPaper](https://github.com/satnaing/astro-paper) ported to Nuxt 4 and Nuxt Content 3. The port keeps AstroPaper's narrow layout, Google Sans Code font, light and dark themes, article controls, and Pagefind search.

[Live site](https://alexanderop.github.io/nuxt-paper/) · [Parity evidence](docs/parity/README.md)

## Run the blog

Use Node.js 22 or newer and the pnpm version in `package.json`.

```sh
pnpm install
pnpm generate
pnpm dev
```

Open the local address printed by Nuxt. `pnpm generate` also creates the Pagefind index used during development. Regenerate after content changes when you need updated search results. Restart the dev server after changing a post’s draft status, publication eligibility, filename, or folder; the source inclusion list is computed at startup.

## Publish a static site

```sh
pnpm build
```

`build` runs the static generation and search-index pipeline.

Deploy `.output/public` to a static host. For a GitHub Pages project path, generate with its base URL.

```sh
NUXT_APP_BASE_URL=/nuxt-paper/ pnpm generate
```

The existing GitHub Actions workflow builds and deploys `main` to GitHub Pages. Scheduled posts become public when a new build runs after their publication time, including the configured scheduling margin.

## Customize the template

Edit `shared/utils/site.ts` to set site metadata, homepage text, pagination, feature flags, social links, and sharing links. Set the site URL to the full public address, including a project subpath when applicable. Keep the build's base URL consistent with that address.

The appearance lives in `app/assets/css`. Components use the original outline icons and Tailwind CSS 4 classes. Nuxt Content renders Markdown through the Vue prose components in `app/components/content`.

## Write a post

Create a Markdown file in `content/posts`.

```md
---
title: My first post
description: What this article covers.
pubDatetime: 2026-10-07T12:00:00Z
tags:
  - nuxt
featured: false
draft: false
---

Write your article here.
```

Add `modDatetime` when you update a post. Optional fields include `author`, `slug`, `ogImage`, `canonicalURL`, `hideEditPost`, and `timezone`.

Ordinary folders remain in article URLs. Organizational folders beginning with `_` do not appear in URLs. Files beginning with `_` are excluded. A custom `slug` changes the article's final URL segment. Conflicting post URLs fail the build.

Drafts stay unpublished. Production builds exclude future posts outside the scheduling margin from Content's exported data, article pages, search, RSS, and sitemap.

Use Nuxt Content's MDC syntax for Vue components inside Markdown. Astro MDX imports need conversion. An explicit `## Table of contents` heading generates the collapsible inline contents list. Code blocks support syntax highlighting, annotations, filename labels, and copy controls.

## Verify changes

```sh
pnpm exec playwright install chromium
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm generate
pnpm test:browser:prebuilt
pnpm test:publication
```

The browser suite exercises the generated static site. Existing Nuxt component tests use a simulated DOM; they do not establish visual parity or browser focus behavior. The separate parity workflow compares the same upstream content and configuration through both implementations. See [the comparison method and results](docs/parity/README.md).

## Framework mapping

| AstroPaper | NuxtPaper |
| --- | --- |
| Astro pages and layouts | Nuxt pages and Vue components |
| Astro content collections | Nuxt Content collections |
| Tailwind CSS 4 | Tailwind CSS 4 through the Vite plugin |
| Astro font loading | Bundled Google Sans Code static fonts |
| Pagefind | Pagefind over generated Nuxt HTML |
| Shiki and Markdown plugins | Nuxt Content, MDC, and compatible plugins |
| Social preview images | `nuxt-og-image` |
| RSS and sitemap generation | Prerendered Nitro routes |

Existing optional math and Giscus support remain available. Giscus is disabled until configured. Nuxt navigation and hydration use Vue lifecycle hooks in place of Astro's document lifecycle.

## Credits

MIT licensed. AstroPaper was created by [Sat Naing](https://satna.ing). Its original copyright notice remains in [LICENSE](LICENSE). Existing demo content retains its attribution. The bundled Google Sans Code fonts retain their [SIL Open Font License](app/assets/fonts/OFL.txt). The port's upstream comparison is pinned to commit `35cfa7fbe0b897306d27670d3819e55d5205f3dd`.
