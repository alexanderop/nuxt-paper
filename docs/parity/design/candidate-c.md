# Candidate C: server-owned publication snapshot

## Problem

The existing port already has valuable visual components and authored content. Its systemic gap is that page queries, feeds, search, and prerender discovery independently decide what is published and how routes work. A server-owned publication snapshot can make those decisions once, while retaining Nuxt Content's parsing and rendering and the existing three Markdown documents. This candidate changes data ownership, not the visual implementation.

## Usage (caller's view)

```ts
// server/routes/rss.xml.ts: one snapshot governs every export.
const publication = await publicationFor(event)
return renderRss(publication.posts, publication.site)

// Prerender route discovery: includes pagination, tags, enabled features.
const publication = await publicationFor(event)
prerenderRoutes(publication.routes.map(route => route.path))

// PostDetailView.vue: keyed payload supports static client navigation.
const route = useRoute()
const { data: page } = await useAsyncData(
  () => `publication:${route.path}`,
  () => $fetch('/api/publication/page', { query: { path: route.path } }),
)
// The prerendered async-data payload includes the eligible Content document.
// <ContentRenderer :value="page.document" />
```

## Shape

```ts
type PostSummary = Readonly<{
  path: string; sourcePath: string; title: string; description: string
  publishedAt: string; modifiedAt: string | null
  author: string; tags: readonly { label: string; slug: string }[]
  featured: boolean
}>
type PublishedRoute = Readonly<{
  path: string
  kind: 'home' | 'posts' | 'tag' | 'tags' | 'archives' | 'about' | 'search' | 'article'
}>
type Publication = Readonly<{
  posts: readonly PostSummary[]
  routes: readonly PublishedRoute[]
  site: SiteConfig
}>
// Server capability: hides Content query, eligibility, source URL rules,
// sorting, tag deduplication and complete route discovery.
async function publicationFor(event: H3Event): Promise<Publication> {
  throw new Error('not implemented')
}
```

`server/utils/publication.ts` owns the Content adapter and snapshot construction. Its private path-index maps eligible routes to page descriptors; all list order and pagination derive from this snapshot. `server/api/publication/page.get.ts` validates requested paths and returns the matching page or 404, including the native Content-renderable document only for an eligible article. It is deliberately an HTTP adapter, not another business layer. `shared/types/publication.ts` holds domain summaries; the rendering transport contract remains separate because ContentRenderer necessarily consumes Nuxt Content's native document structure. `content.config.ts` remains the schema boundary and preserves source paths/custom slugs. Existing page components receive payloads instead of issuing unrestricted collection queries.

One injected build timestamp and publication mode determine eligibility for the entire generated artifact. Development snapshots refresh with Content changes. There is no mutable global snapshot shared across production/development profiles. The interface hides publication policy, but exposes rendering documents at the renderer boundary explicitly, per boundary-discipline. Routes and metadata are derived, never independently maintained, per single-source-of-truth.

## Synthesis decision

Pending independent judge. This is the strongest policy-isolation candidate, but I recommend selecting it only if preventing raw-content publication can be verified without fighting Nuxt Content's generated database behavior.

## Tradeoffs accepted

- We accept server adapters and a payload contract in exchange for one authoritative publication surface.
- We accept larger prerendered payloads in exchange for static client navigation without requiring a deployed API.
- We accept more migration work than shared pure helpers in exchange for removing eligibility decisions from every consumer.

## Alternatives considered

Native collection queries plus shared eligibility/path functions require less change and preserve Content hot reload naturally. They hide less policy: every new caller must remember filtering. For this bounded repair, that cost may still be preferable to a new transport layer.

A generated JSON catalog decouples pages from Content queries completely but creates another build dependency and document serialization format. It hides storage while exposing synchronization failure; rejected.

## Open questions and risks

Can the selected Nuxt Content version avoid exporting excluded bodies in client SQLite artifacts? Can static payload extraction prove article-to-article navigation never needs the server endpoint? Does Content's development invalidation provide a stable snapshot refresh hook? These are implementation proof questions, not approval requirements.

## Next implementation step

Prototype one existing article through the facade, generate under `/nuxt-paper/`, and test direct load plus client navigation before expanding ownership.

Minimal parity delivery then ports Pagefind UI/build indexing, heading/code DOM, OG template and missing CSS; preserves existing content/history; verifies exports and disabled routes; and compares identical upstream fixtures at both widths/themes without masks or relaxed thresholds. Red-flag screening finds genuine interface depth, no pass-through domain services, and one publication-policy owner; the main rejection risk is excessive infrastructure for a mostly correct existing port.
