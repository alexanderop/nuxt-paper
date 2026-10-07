# Candidate B: publish once, render everywhere

## Problem

Keep the existing Nuxt repository, history, three authored documents, components and working article interactions. Eligibility currently diverges across listings, feeds and search; Nuxt Content can export hidden documents even when pages filter them. Resolve publication before Content ingestion rather than asking every consumer to implement publication rules.

## Usage (caller's view)

```sh
pnpm dev       # projects eligible development content; watches author sources
pnpm generate  # production projection → Nuxt generate → Pagefind
NUXT_PAPER_PROFILE=parity pnpm generate # identical product, alternate fixture/config
```

```ts
// Existing page callers retain Nuxt Content's API.
const { data: posts } = await useAllPosts(); // published, modified-date sorted
const article = await queryCollection('posts').path(route.path).first();

// Server feed and static route enumeration share the generated manifest.
import { publication } from '#publication';
const xml = renderRss(publication.posts, site);
const routes = publication.routes;
```

## Shape

```ts
type PublishedPost = Readonly<{
  path: `/posts/${string}`;
  sourcePath: string;
  title: string;
  description: string;
  pubDatetime: string;
  modDatetime: string | null;
  author: string;
  tags: readonly Readonly<{ label: string; slug: string }>[];
  featured: boolean;
}>;
type Publication = Readonly<{
  posts: readonly PublishedPost[]; // effective-date descending
  routes: readonly string[]; // pages + post/tag pagination + enabled features
}>;
type PublicationOptions = Readonly<{
  sourceRoot: string;
  mode: 'development' | 'production';
  now: Date;
  scheduledMarginMs: number;
  outputRoot: string;
}>;
/** Validate sources, derive eligible projection and manifest, replace atomically. */
async function publishContent(options: PublicationOptions): Promise<Publication> {
  throw new Error('not implemented');
}
```

`scripts/publication.ts` owns author-file interpretation, validated frontmatter, publication eligibility, custom slugs, underscore-directory removal, normalized tag slugs, collision rejection and manifest creation. Original files never change. It writes ignored `content/.published/posts/**` Markdown with canonical output paths and original `sourcePath`; `content.config.ts` reads only this projection for posts. Pages retain their existing source. Validate Content's source prefix/path behavior with a nested-route fixture before integrating. The generated manifest module is an output of the same operation, never independently edited.

This boundary hides file naming and scheduling from callers (boundary-discipline). Dates serialize explicitly; existing presentation helpers retain timezone and later-modification display behavior. Archive grouping uses publication dates, independently of manifest list order. The site’s generated routes, RSS, sitemap and OG enumeration consume the manifest; rendered articles still use ContentRenderer. The manifest contains metadata only; article bodies are not duplicated there. It is deeper than a query wrapper because it controls everything that can enter the exported Content database.

Keep existing Vue/CSS ownership. Apply narrowly verified differences to upstream classes, SVGs, heading-anchor markup, skip-link focus and filename badges. Inspect generated Shiki HTML before changing transformers; MDC may already provide notation transforms. Pagefind indexes only generated article `data-pagefind-body`, ignores adjacent navigation, and ships upstream UI/CSS variables. Resolve bundle paths against Nuxt baseURL; initialize/destroy once per search mount and synchronize `q`/backUrl.

Parity fixtures live outside author content. The profile selects fixture source root and upstream config, with identical components and build pipeline. Record upstream SHA and compare unmasked screenshots across routes/themes/viewports; report nonzero pixels without claiming exact parity.

## Synthesis decision

Pending independent judge.

## Tradeoffs accepted

- Accept generated-source plumbing and development watcher invalidation for structural prevention of hidden-content export.
- Accept scheduled publication requiring regeneration, matching static hosting.
- Accept roughly 3–5 additional infrastructure files and dedicated projection tests; most visual work remains unchanged. Content module/version compatibility makes this cost materially higher than a shared filter.

## Alternatives considered

Runtime shared predicates are smaller, but callers can omit them and Content exports may still disclose bodies. A Nitro publication repository centralizes access but requires every Content consumer to adopt a new interface without controlling raw database exports.

## Open questions and risks

Can Content source routing preserve nested custom slugs without hooks? Does its watcher reliably observe atomic projection replacement? Prove both before adopting this shape; otherwise its operational cost outweighs its depth.

## Next implementation step

Build projection tests for drafts, margin boundaries, underscore paths, custom-slug collisions and published-only generated Content output, then wire one existing article through it.
