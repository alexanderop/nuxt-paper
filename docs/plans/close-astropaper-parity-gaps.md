# Close AstroPaper Feature-Parity Gaps

## Context

A multi-agent comparison of upstream [AstroPaper](https://github.com/satnaing/astro-paper)
(Astro) against this Nuxt 4 + Nuxt Content v3 port found a set of features that
exist upstream but were missing or weaker here. During grilling, several
"confirmed gaps" were **empirically overturned** by inspecting the built
`dist/` and the installed `@nuxtjs/mdc` source — so this plan implements only
what is genuinely missing, at the scope the user chose: **everything closeable**
(excludes the deliberate architectural choices MDX→MDC and single-locale i18n).

### Verified-false (already working — do NOT touch)
- **Heading anchor links.** Nuxt Content v3 generates them natively
  (`renderer.anchorLinks` for h2–h4). Confirmed in built HTML:
  `<h2 id="the-gotchas"><a href="#the-gotchas">…`. Styled already at
  `app/assets/css/typography.css:34-47`.
- **Code notation transformers `[!code ++]` / `[!code --]` / `[!code highlight]`
  / `[!code focus]` / error-level.** MDC's Shiki highlighter applies
  `transformerNotationDiff/Highlight/Focus/ErrorLevel` **by default**
  (`@nuxtjs/mdc@0.22.0/dist/runtime/highlighter/shiki.js:28-33`). Output classes
  already styled at `typography.css:120-134`. Only **word-highlight** and a
  **filename label** are actually missing.

### Doc-verified contracts (sources)
- Nuxt Content **v3.14.0** (installed) — markdown config, remark/rehype plugin
  registration, `ProsePre` props. Docs:
  https://content.nuxt.com/docs/getting-started/configuration and
  https://content.nuxt.com/docs/components/prose
- `@nuxtjs/mdc` **v0.22.0** (installed) — `defineConfig` from `@nuxtjs/mdc/config`
  exposes `shiki.transformers: ShikiTransformer[]`. Verified in installed source:
  `dist/shared/mdc.B7_zBGwd.d.mts:56` and merge logic `dist/runtime/highlighter/shiki.js:92-107`.
- `ProsePre` meta syntax ` ```ts [file.ts]{2} ` → props `filename`, `highlights`
  (native; no custom Shiki transformer needed for filenames). Source:
  content docs "ProsePre"; `@nuxtjs/mdc/.../prose/ProsePre.vue:15` has a
  `filename` prop.
- `@shikijs/transformers` — `transformerNotationWordHighlight()` for `[!code word:x]`.
- LaTeX: `remark-math` + `rehype-katex` + `katex` CSS (registered exactly like
  the existing `remark-toc` / `rehype-callouts` entries in `nuxt.config.ts`).
- Lightbox: upstream viewer is vanilla DOM-delegation JS over `#article img`
  (`/tmp/astro-paper-upstream/src/pages/posts/[...slug]/index.astro:263-532`),
  directly portable to a composable that mirrors `app/composables/useCodeCopyButtons.ts`.

### Project conventions
- All Vue follows Michael Thiessen patterns (logic in composables, humble
  components). Lightbox logic → `useImageLightbox`; `PostDetailView` stays humble.
- Config lives as typed constants in `shared/utils/site.ts` (the port's
  equivalent of `astro-paper.config.ts`), not env vars — so Google verification
  is a constant, matching existing `SITE`/`FEATURES` style.

## Decisions
- **Image lightbox:** port upstream's full custom viewer (4× zoom, mouse-drag
  pan, pinch-to-zoom, focus trap, keyboard nav, reduced-motion) as a composable —
  full parity, chosen over `medium-zoom`/PhotoSwipe.
- **Giscus:** scaffold a `<GiscusComments>` component behind a `FEATURES.giscus`
  flag, **default off**, with placeholder config in `site.ts`. Nothing renders
  until the user fills in repo/repoId/category/categoryId.
- **Filename labels:** implement via a custom `ProsePre` prose component using
  the native `filename` prop — NOT a custom Shiki transformer.
- **Word-highlight:** add the one missing transformer via root `mdc.config.ts`.
- **Google verification:** plain `SITE.googleVerification` constant + conditional
  meta tag (no env var, per port convention).
- **theme-color across transitions:** NOT a build task — verify-only (see Notes).
- **Color schemes:** port upstream's documentation post(s) as MDC markdown;
  optionally add the named scheme variable blocks (commented) to `theme.css`.
  No runtime scheme switcher (upstream has none either).

## Contracts
- **Plugin order:** `remark-toc` must run before `remark-collapse` (collapse
  wraps the generated "Table of contents" section). Verify the `remarkPlugins`
  record applies in insertion order in Nuxt Content v3; if not, this is the one
  ordering risk to resolve. Collapse `test` value: `"Table of contents"`.
- **Code-block coexistence:** the custom `ProsePre.vue` must keep the inner
  `<pre>` element intact and inside `#article`, because `useCodeCopyButtons()`
  queries `#article pre` and wraps it. ProsePre adds a filename header *around*
  the `<pre>`, not replacing it. Verify copy button still positions correctly.
- **Lightbox scope:** binds to `#article img` excluding images already wrapped
  in `<a>` (matches upstream). Runs client-only in `onMounted`, like
  `useCodeCopyButtons`. Must not regress LCP — defer attribute mutations via
  `requestAnimationFrame` (as upstream does).
- **KaTeX CSS:** add `"katex/dist/katex.min.css"` to the `css` array in
  `nuxt.config.ts` so it is bundled (no CDN).
- **RTL/lang:** `nuxt.config.ts` `htmlAttrs.dir`/`lang` read from
  `SITE.dir`/`SITE.lang` (imported from `shared/utils/site.ts`) instead of
  hardcoded literals, making direction configurable in one place.
- **Giscus contract:** component loads the giscus client script with
  `data-*` attributes from `SITE.giscus`; respects current theme via
  `useTheme()` (light/dark mapping). Renders only when `FEATURES.giscus` is true
  AND required config is present.

## Open Non-Blocking Notes
- **theme-color meta during view transitions:** likely already correct — this is
  a Nuxt SPA, so the `<meta name="theme-color">` set by `useTheme.reflect()`
  persists across client navigation (Astro lost it only because it swaps the full
  document on `astro:before-swap`). Action: QA a few navigations and confirm no
  Android chrome flash; add a `page:finish` re-apply guard *only if* a real flash
  is observed.
- **Google verification env override:** upstream also read
  `PUBLIC_GOOGLE_SITE_VERIFICATION`. Omitted by convention (port uses constants).
  Can be added later via `runtimeConfig.public` if desired.
- **README "Not ported" section** is stale: it lists dynamic per-post OG images
  as not ported, but they ARE implemented via `nuxt-og-image` +
  `app/components/OgImage/BlogPost.takumi.vue`. Update the section as part of S1
  or a follow-up: remove the OG bullet; once this plan lands, also drop the
  `remark-collapse` bullet.

## Tasks

- **Wave 1 — parallel** (disjoint files, no shared contract):
  - **S1 — Markdown pipeline & deps** · owns `nuxt.config.ts`, `mdc.config.ts` (new),
    `package.json`, and `README.md` (Not-ported section) · depends: none
    - Add deps: `remark-math`, `rehype-katex`, `katex`, `remark-collapse`,
      `@shikijs/transformers`.
    - `nuxt.config.ts`: register `remark-math` (remarkPlugins) and `rehype-katex`
      (rehypePlugins); add `remark-collapse` after `remark-toc` with
      `{ options: { test: "Table of contents" } }`; add
      `"katex/dist/katex.min.css"` to `css`; set `htmlAttrs.dir`/`lang` from
      imported `SITE`.
    - `mdc.config.ts`: `export default defineConfig({ shiki: { transformers:
      [transformerNotationWordHighlight()] } })`.
    - Update stale README "Not ported" bullets.
  - **S2 — Code-block filename/line display** · owns
    `app/components/content/ProsePre.vue` (new) · depends: none
    - Humble component rendering optional `filename` header + native `highlights`;
      keep `<pre>` intact (see coexistence contract).
  - **S3 — Image lightbox** · owns `app/composables/useImageLightbox.ts` (new),
    `app/components/PostDetailView.vue` · depends: none
    - Port upstream viewer (pan/pinch/zoom 4×/focus-trap/keyboard/reduced-motion)
      as a composable; call `useImageLightbox()` in `PostDetailView` next to
      `useCodeCopyButtons()`. Use Tailwind classes via `createElement` (no new CSS file).
  - **S4 — Google Site Verification** · owns `shared/utils/site.ts`,
    `app/composables/usePageSeo.ts` · depends: none
    - Add `SITE.googleVerification?: string`; in `usePageSeo`, inject
      `<meta name="google-site-verification">` when set.
  - **S5 — Color-scheme docs** · owns
    `content/posts/predefined-color-schemes.md` (new) and `app/assets/css/theme.css`
    · depends: none
    - Port upstream's predefined + customizing color-scheme docs as MDC markdown;
      optionally add commented named scheme variable blocks to `theme.css`.

- **Wave 2 — depends on Wave 1** (edits files owned by S3/S4):
  - **S6 — Giscus (scaffold, off)** · owns `app/components/GiscusComments.vue` (new);
    appends to `shared/utils/site.ts` (`FEATURES.giscus` + `SITE.giscus` placeholders)
    and `app/components/PostDetailView.vue` (`<GiscusComments v-if="FEATURES.giscus" />`)
    · depends: S3 (PostDetailView), S4 (site.ts)
    - Theme-aware giscus loader; renders only when flag on AND config present.

**Verification**
1. `pnpm lint && pnpm typecheck && pnpm test`
2. `pnpm generate` (must succeed; static build is the deployment target).
3. Create/extend a demo post (or temporary fixture) exercising: a `$…$` and
   `$$…$$` equation, a code block with ` [file.ts]{2} ` and `// [!code word:foo]`,
   a `## Table of contents`, and an article `<img>`.
4. `agent-browser` a rendered post: KaTeX renders; clicking an image opens the
   lightbox (zoom/pan/Esc/focus-trap work); filename header shows; word-highlight
   styles apply; TOC section is collapsible.
5. Confirm copy buttons still attach/position correctly with the new `ProsePre`.
6. QA theme-color across 2–3 navigations (Non-Blocking Note) — guard only if a flash appears.

---
Input to `afk:implement`. Slices are independently mergeable; consider
`afk:batch` if you want Wave 1 as parallel PRs.
