# Independent arena judgment

This is an independent **same-model review**: the runtime provided no configured model diversity. I assessed the three supplied candidates against the supplied brief, rubric and pinned-source grounding; this is a design assessment, not runtime proof.

| Criterion (0–5) | A | B | C |
| --- | ---: | ---: | ---: |
| Pixel and behavior parity, including Pagefind | 4 | 4 | 4 |
| Consistent eligibility across every publication surface | 4 | 5 | 2 |
| Minimal change preserving history, content and contracts | 5 | 3 | 2 |
| Reproducible identical-data visual/browser proof | 5 | 5 | 4 |
| Static root/base-path portability without runtime service | 5 | 4 | 2 |
| **Total** | **23/25** | **21/25** | **14/25** |

**Select A, with ingestion exclusion made concrete before implementation expands.** It repairs the existing native Content queries and components without introducing another content compiler or transport. Its explicit Pagefind lifecycle, source-path retention, shared build timestamp, reactive article key and identical-data profile address the actual gaps. Pixel parity scores remain four because all candidates require generated markup and screenshot evidence before their styling proposals are proven.

A's ingestion hook question is material: a parse hook must not be assumed to support dropping a document by returning null. Compute production-ineligible source files before ingestion and supply them through Content's `source.exclude`, using the same pure publication predicate and fixed build context used by feed/sitemap/OG. Keep the parse hook narrowly responsible for canonical path/source metadata. Verify this mechanism against the installed version with actual exported database inspection. A wildcard or path-pattern mistake could otherwise publish hidden content or exclude organizational directories.

**Graft B's collision rejection and structural publication guarantee**, not its projection directory or metadata manifest. Reject conflicting canonical post paths deterministically and fail invalid frontmatter clearly. B has the strongest guarantee as written because Content reads only eligible projected documents, but maintaining copied Markdown, atomic replacement and a development watcher is disproportionate when native source exclusion works. It remains a fallback only if the native mechanism demonstrably fails.

**Graft C's complete route inventory idea** as a small pure derivation from eligible summaries. This helps pagination, optional routes, sitemap and prerender agree. Do not adopt its endpoint or snapshot ownership: neither inherently prevents Content's own database export, and static navigation introduces an avoidable API/payload-extraction dependency.

First proof should cover drafts, scheduled-margin boundaries, underscore filenames versus directories, normal nested directories, custom slugs and collisions. Then inspect hidden-title/body absence, root and base-path output, article-to-article navigation, search query restoration and optional disabled routes. Screenshots must use identical fixture data/config and disclose every nonzero difference without masks or relaxed thresholds. Preserve the three author documents, existing components, history and coverage gate throughout.
