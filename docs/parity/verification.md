# Verification record — 2026-10-07

The final local product source passed lint, TypeScript checking, static generation, 167 tests across 39 files, and 18 Playwright browser journeys. Coverage was 79.61% lines and 88.12% functions, above the existing configured thresholds.

The [visual report](evidence/final-comparison.json) passes all 34 states with zero changed RGBA bytes, identical dimensions, and no captured runtime errors. The [source manifest](evidence/fixture-source-manifest.json) binds the generated fixture to original input hashes. The only product edit after this capture corrected author spacing in the social-card image component, which is outside the browser matrix. Final lint, typecheck, unit tests, generation, and browser tests include that edit.

The publication test built an isolated site twice, changing a published article into a draft between builds. It scanned HTML, payloads, exported Content data, and compressed Pagefind fragments for excluded content; it also verified full ISO timestamps, same-day ordering, slug overrides, and underscore-directory behavior. Both builds passed. Publication and index-cleanup code did not change after that proof. CI repeats it on the submitted commit.

An actual Chrome smoke test passed with the GitHub Pages `/nuxt-paper/` prefix: search → article → Go back preserved the query, URLs had one base prefix, robots and sitemap were valid, and there were no runtime errors. That isolated build preceded only the final transition rules, code-token typography, and social-card spacing changes. The deployed commit will receive the same smoke test after Pages finishes.

Independent same-model review found no blocking code or harness issues. It separately measured [native transition timing](evidence/transition-roundtrip.json), reviewed publication boundaries and navigation, and tested comparator safeguards against overlapping outputs, runtime errors, and altered screenshot hashes. Cross-model review and Cursor cloud tooling were unavailable; local Chrome, reproducible scripts, CI, and independent local review were used.

The original repository's two posts and About Markdown file remain unchanged. Nuxt Content/MDC replaces Astro/MDX; Pagefind retains the reference search behavior. Dynamic social-card layout matches, but PNG raster edges may differ between Nuxt OG Image's Resvg and AstroPaper's Sharp renderer. See the [comparison method](README.md) for the exact scope and limitations.
