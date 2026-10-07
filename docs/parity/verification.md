# Verification record — 2026-10-07

The final local product source passed lint, TypeScript checking, static generation, 167 tests across 39 files, and 18 Playwright browser journeys. Coverage was 79.61% lines and 88.12% functions, above the existing configured thresholds.

The [visual report](evidence/final-comparison.json) passes all 34 states with zero changed RGBA bytes, identical dimensions, and no captured runtime errors. The [source manifest](evidence/fixture-source-manifest.json) binds the generated fixture to original input hashes. The only product edit after this capture corrected author spacing in the social-card image component, which is outside the browser matrix. Final lint, typecheck, unit tests, generation, and browser tests include that edit.

The publication test built an isolated site twice, changing a published article into a draft between builds. It scanned HTML, payloads, exported Content data, and compressed Pagefind fragments for excluded content; it also verified full ISO timestamps, same-day ordering, slug overrides, and underscore-directory behavior. Both builds passed. Publication and index-cleanup code did not change after that proof. CI repeats it on the submitted commit.

An actual Chrome smoke test passed with the GitHub Pages `/nuxt-paper/` prefix: search → article → Go back preserved the query, URLs had one base prefix, robots and sitemap were valid, and there were no runtime errors. That isolated build preceded only the final transition rules, code-token typography, and social-card spacing changes. The deployed commit received the same smoke test after Pages finished; see the delivery record below.

Independent same-model review found no blocking code or harness issues. It separately measured [native transition timing](evidence/transition-roundtrip.json), reviewed publication boundaries and navigation, and tested comparator safeguards against overlapping outputs, runtime errors, and altered screenshot hashes. Cross-model review and Cursor cloud tooling were unavailable; local Chrome, reproducible scripts, CI, and independent local review were used.

The original repository's two posts and About Markdown file remain unchanged. Nuxt Content/MDC replaces Astro/MDX; Pagefind retains the reference search behavior. Dynamic social-card layout matches, but PNG raster edges may differ between Nuxt OG Image's Resvg and AstroPaper's Sharp renderer. See the [comparison method](README.md) for the exact scope and limitations.

## Delivery

[PR #14](https://github.com/alexanderop/nuxt-paper/pull/14) merged as `71fd32eb3cfd978fbe33658be72f91b1e79fec82` after [CI](https://github.com/alexanderop/nuxt-paper/actions/runs/37581296501) and independent commit-bound review passed. [GitHub Pages deployment](https://github.com/alexanderop/nuxt-paper/actions/runs/37581498964) succeeded for that merged commit.

Actual installed Chrome then passed search → article → Go back, query retention, single base prefix, robots, sitemap, and zero runtime errors against [the live site](https://alexanderop.github.io/nuxt-paper/). GitHub Pages redirects `/search` to `/search/`; the smoke script now validates either normalized entry path and requires the back link and returned URL to retain that path and the exact query.

The repository is public and enabled as a GitHub template. Existing history and Markdown content were preserved. This delivery follow-up changes the smoke script and documentation only; application source and the recorded visual evidence remain unchanged.
