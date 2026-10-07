# AstroPaper → NuxtPaper architecture grounding

## Overview

The public `active/nuxt-paper` repository already contains a substantial Vue/Nuxt Content port. Preserve its history and repair concrete parity gaps rather than replacing it. The comparison baseline is AstroPaper commit `35cfa7fbe0b897306d27670d3819e55d5205f3dd` in `/tmp/astro-paper-nuxt-research-20261007`.

The existing shell closely matches upstream: 768px layout, Google Sans Code, color tokens, unboxed post lists, mobile navigation, article layout, reading progress, and touch/keyboard lightbox. The largest differences concern search, content conventions, generated outputs, and Markdown renderer markup. Findings are source-based; generated HTML and browser comparisons remain necessary.

## Key Concepts

- **Published posts:** exclude drafts; production includes scheduled posts within the configured 15-minute margin. General lists sort by `modDatetime ?? pubDatetime`; archives group by publication date.
- **Source identity versus public path:** upstream omits underscore-prefixed ancestor directories from URLs while retaining their posts, and supports custom frontmatter slugs. Nuxt Content paths need an explicit equivalent.
- **Feature configuration:** shared site configuration controls archives, search, editing, themes, and generated social images. Output generators must honor the same decisions as pages.
- **Renderer contract:** Nuxt Content must produce markup compatible with upstream prose CSS, including optional inline TOC, callouts, heading anchors, code annotations, and filename labels.

## How It Works

Markdown enters `content.config.ts`, then shared queries and post utilities provide eligible, sorted content to homepage, post lists, tags, archives, and article routes. Homepage displays all featured posts and four recent nonfeatured posts; listings paginate four at a time. The existing migration script adapted demo filenames once, but ongoing authoring still needs upstream-compatible source-path handling.

`PostDetailView.vue` combines content rendering, date/edit controls, tags, sharing, adjacent posts, SEO, and client interaction composables. Vue lifecycle cleanup replaces Astro transition hooks. Verify route-to-route changes refresh content, metadata, heading controls, code buttons, and lightbox bindings; current data keys may retain an earlier article.

Search currently queries Nuxt Content sections into MiniSearch. For parity, prerender eligible article HTML, mark article main with `data-pagefind-body`, exclude adjacent navigation, then run Pagefind. The search page should mount upstream Pagefind UI and synchronize `q` plus the stored return URL.

RSS, sitemap, robots, and OG images are separate output paths. RSS and sitemap currently bypass part of publication filtering. Centralize eligibility and route construction, include pagination, honor feature flags, and make URLs configurable. Replace the OG card geometry with upstream’s bordered paper design while retaining correct custom-image precedence.

## Where Things Live

- `shared/utils/site.ts`: configuration and project identity.
- `content.config.ts`, `scripts/migrate-content.mjs`, `app/utils/posts.ts`: content ownership, paths, filtering, sorting.
- `app/pages`, `app/components/PostDetailView.vue`: routes and article orchestration.
- `app/assets/css`, `app/components/content`, `mdc.config.ts`: visual and renderer ownership.
- `app/composables`: theme, search, SEO, copy, lightbox behavior.
- `server/routes`, OG components, build scripts: feeds, discovery, social images, search index.

## Gotchas

Do not assume missing explicit Shiki configuration means missing functionality: MDC may supply line-highlight and diff transformers by default. The local config explicitly adds word highlighting. Verify generated fixture HTML before changing transformer registration.

TOCs are author-requested and inline, not universal sidebars. Match trailing separate hash anchors and small filename badges. Fix skip-link focus, image-button focus styling, and table alignment. Compare identical content, theme, viewport, and dates; branding changes otherwise obscure genuine layout differences. Nuxt’s root wrapper must retain the flex layout that pushes the footer down.
