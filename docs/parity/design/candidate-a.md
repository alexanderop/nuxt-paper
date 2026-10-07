# Candidate A: native collections with one publication policy

## Problem
The existing port already owns working Nuxt layouts, content rendering, article interactions and deployment. Replace the mismatched search, repair cross-surface publication and source-path semantics, and make existing markup match pinned AstroPaper; avoid rebuilding the application. Preserve the three current Markdown documents and repository history.

## Usage (caller's view)
Authors continue writing `content/posts/**/*.md`, including organizational `_folders`, normal nested folders and frontmatter `slug`. Only underscore-prefixed filenames are excluded. Pages remain a separate collection. Existing paths remain stable.

```ts
// Existing listing composable; query remains Nuxt-native.
const { data: posts } = await useAllPosts();

// Server feed: transport query is local; shared policy is identical.
const rows = await queryCollection(event, 'posts').all();
const posts = publishedPosts(rows, publicationContext);
return renderRss(posts, site);

// Article: reactive route key, publication checked before rendering.
const { data: post } = await useAsyncData(
  () => `post:${route.path}`,
  () => queryCollection('posts').path(route.path).first(),
);
if (!post.value || !isPublished(post.value, publicationContext)) {
  throw createError({ statusCode: 404 });
}
```

## Shape
```ts
type PublicationContext = Readonly<{
  now: number; development: boolean; scheduledMarginMs: number;
}>;
type PublicationFields = Readonly<{
  draft?: boolean; pubDatetime: string; modDatetime?: string | null;
}>;
type PostSummary = Readonly<{
  path: string; title: string; description: string;
  tags: readonly string[]; author: string; sourcePath: string;
}> & PublicationFields;
function isPublished(post: PublicationFields, ctx: PublicationContext): boolean;
function publishedPosts<T extends PublicationFields>(
  posts: readonly T[], ctx: PublicationContext
): T[];
function postPath(sourcePath: string, slug?: string): string;
```
Bodies initially throw `new Error('not implemented')`. One shared post-policy module owns eligibility, modification sorting, tag slugging and source-path conversion. Existing `useAllPosts` hides query field selection and publication policy; server routes query directly and apply the same pure policy. No repository/service/adapter stack: Nuxt query transport types remain private to callers, domain policy uses structural fields, per boundary-discipline and minimize-reader-load.

Collection schema validates required fields and author/tag defaults. A Content parse hook assigns canonical `path` and retained `sourcePath`; downstream consumers never reconstruct source filenames. Normal ancestors survive, underscore ancestors disappear, custom slugs follow verified upstream output. Build context is captured once so boundary-time posts cannot disagree between pages/feed/OG; browser receives the same build policy. Development permits scheduled articles, never drafts.

Nuxt Content's shipped collection data must also exclude unpublished production documents, not merely hide route links: implement eligibility at the ingestion boundary, with policy reused defensively by feed/sitemap/OG. Inspect exported SQLite/chunks for hidden fixture titles. This protects publication even when an inquisitive client queries collections.

Pagefind runs after generation against `.output/public`; article main gets `data-pagefind-body`, adjacent links get ignore. Search owns PagefindUI creation/destruction, upstream CSS, query restoration and `backUrl`. Bundle imports and every public URL derive from Nuxt baseURL. Remove obsolete MiniSearch code after replacement.

Retain current components and pure interaction composables. Patch heading anchor DOM, filename code badges, focus rules and exact SVGs/classes. Verify generated highlighting before changing it: existing MDC defaults may already supply diff/highlight transforms. OG template changes inside existing module. Article navigation uses reactive async-data keys and lifecycle cleanup.

## Verification
A separate fixture content source/config profile supplies pinned upstream documents, title, author, dates and assets through identical product components. Never overwrite current documents. Compare baseline and port at matching viewport/theme/config, recording exact diffs without masks/tolerance. Test real Chrome navigation, Pagefind query return, lightbox/focus and hidden-content absence. Generate and serve both `/` and `/nuxt-paper/` artifacts; inspect feeds, sitemap, OG and static files.

## Tradeoffs accepted
- Accept native Nuxt queries in client/server shells for low migration risk; shared pure policy prevents invariant duplication.
- Accept a parser hook for source compatibility instead of inventing another content compiler.

## Alternatives considered
A build-owned manifest hides querying but duplicates Nuxt Content indexing and risks two content truths. A repository abstraction merely forwards native queries and exposes more methods without hiding additional policy.

## Open questions and risks
Can the installed Content ingestion hook omit production entries completely? Does generated Shiki HTML already preserve notation, and does filename metadata survive? Resolve these with generated-output spikes before layering workarounds.

## Synthesis decision
Pending independent judge.

## Next implementation step
Prove ingestion exclusion and source-path conversion using draft, future, nested and custom-slug fixtures.
