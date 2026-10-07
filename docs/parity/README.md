# AstroPaper parity verification

The reference is AstroPaper commit [`35cfa7fbe0b897306d27670d3819e55d5205f3dd`](https://github.com/satnaing/astro-paper/tree/35cfa7fbe0b897306d27670d3819e55d5205f3dd). NuxtPaper keeps its existing repository history and demo articles. Comparisons run against an isolated Nuxt copy populated with the reference content and configuration.

## Verified result

On 2026-10-07, all **34/34 comparison states matched exactly**: identical dimensions, zero changed RGBA bytes, and zero captured runtime errors. Chrome was 154.0.8037.98 on macOS with the software-rendering method below. This is evidence for the recorded matrix and browser, not a claim about every browser or possible article.

- [Final comparison report](evidence/final-comparison.json)
- [Reference capture manifest](evidence/upstream-software-manifest.json) and [Nuxt capture manifest](evidence/nuxt-software-manifest.json)
- [Fixture inputs and original source hashes](evidence/fixture-source-manifest.json)
- [Independent transition roundtrip measurements](evidence/transition-roundtrip.json)
- Representative original screenshots: [reference home](evidence/reference/desktop-light-home.png), [Nuxt home](evidence/nuxt/desktop-light-home.png), [reference mobile article](evidence/reference/mobile-dark-article.png), [Nuxt mobile article](evidence/nuxt/mobile-dark-article.png)

The two screenshot pairs above are retained in Git. All 34 captures have hashes in the manifests and can be recreated with the commands below. The fixture source manifest records the input files before content/config normalization. Subsequent edits to documentation and the OG image component do not affect the captured page rendering.

Native view-transition timing was checked separately during real navigation: root/group 250ms, destination card/tag fades 180ms, article-title and outgoing-only snapshots 250ms. Search query persistence, keyboard skip focus, article navigation, code copying, theme persistence, and publication isolation have separate behavioral tests.

Dynamic social cards preserve the source layout and fonts. Their PNG pixels are not part of the 34-state browser claim: Nuxt OG Image uses Satori/Resvg while the pinned AstroPaper source uses Satori/Sharp, so rasterized edges can differ.

## What the comparison measures

The matrix contains 34 full-page Chrome screenshots: home, posts, tags, archives, about, search, an article, and populated search results, in light/dark mode at desktop 1280×900 and mobile 390×844. Mobile adds the expanded navigation menu. Device scale is 1, locale is en-US, and browser timezone is Europe/Berlin.

Both sites use identical fixture content, site settings, icons, font bytes, and image bytes. The fixture converts MDX tables and captions into equivalent MDC/HTML and leaves fenced examples intact. Its asset map copies the reference build's optimized about image, with source and output hashes recorded. Product components and styles are never replaced by the fixture.

Screenshots wait for network idle, loaded fonts, and decoded images. No screenshot masks, injected comparison styles, pixel tolerance, or screenshot editing are used. A pass requires identical dimensions and zero changed RGBA bytes. Missing screenshots, changed screenshot hashes, mismatched browser versions, and captured runtime errors fail. Capture and comparison outputs must be new directories, so the tools cannot overwrite a baseline.

## Rendering repeatability

The first GPU-rendered reference repeated exactly in 31 of 34 states. The other three differences were confined to an AVIF photo, despite identical downloaded bytes and image geometry. A separate software-rendered method (`--disable-gpu`) passed two complete reference captures: **34/34 exact**. The original baseline was retained; it was not overwritten. [Repeat report](evidence/upstream-software-repeat.json).

Use `capture-software.mjs` for both sites. Do not compare software captures against GPU captures. The scripts record the Chrome version and launch arguments; use the same machine and browser version for each pair. The clock is not frozen, so capture both sites on the same date.

## Reproduce

Install the main project first. Use a separate working directory for the reference checkout and generated evidence.

```sh
git clone https://github.com/satnaing/astro-paper.git /tmp/astropaper-reference
git -C /tmp/astropaper-reference checkout 35cfa7fbe0b897306d27670d3819e55d5205f3dd
pnpm --dir /tmp/astropaper-reference install --frozen-lockfile
pnpm --dir /tmp/astropaper-reference build
pnpm --dir scripts/parity/visual install --frozen-lockfile
```

The capture script uses installed Google Chrome. Serve the reference build on port 4322 in another terminal:

```sh
pnpm --dir /tmp/astropaper-reference preview --host 127.0.0.1 --port 4322
```

Create the image map and isolated Nuxt fixture. The fixture rejects a modified reference checkout, overlapping paths, and existing output directories. `--build` installs from the existing pnpm cache with the project's frozen lockfile and generates a static site.

```sh
node scripts/parity/map-assets.mjs /tmp/astropaper-reference /tmp/astropaper-assets.json
node scripts/parity/parity.mjs --source . --upstream /tmp/astropaper-reference --output /tmp/nuxtpaper-fixture --asset-map /tmp/astropaper-assets.json --now 2026-10-07T12:00:00.000Z --build
node scripts/parity/parity.test.mjs /tmp/astropaper-reference /tmp/nuxtpaper-fixture
pnpm exec serve /tmp/nuxtpaper-fixture/.output/public -l 5679 --no-clipboard
```

With both servers running, capture and compare from another terminal. Every output path must be unused and its parent must exist.

```sh
node scripts/parity/visual/capture-software.mjs http://localhost:4322 /tmp/astro-baseline 35cfa7fbe0b897306d27670d3819e55d5205f3dd
node scripts/parity/visual/capture-software.mjs http://localhost:5679 /tmp/nuxt-candidate candidate-revision
node scripts/parity/visual/compare.mjs /tmp/astro-baseline /tmp/nuxt-candidate /tmp/parity-diff
```

The comparator returns a nonzero exit code for any difference and writes `report.json` plus diff PNGs. Inspect differences in the browser before changing product code. Content and asset normalization must be recorded separately from product changes.

## Behavioral verification

`pnpm test:browser` generates the site and checks real Chromium navigation, query search and return navigation, theme persistence, article controls, and keyboard focus. `pnpm test:publication` builds an isolated fixture twice, scans static HTML, Content's exported data, and compressed Pagefind fragments, then verifies that changing a published post to a draft removes it from the second build.

Unit tests cover publication rules, slug construction, collision handling, metadata, and shared helpers. Existing Nuxt component tests run in a simulated DOM. Neither suite is evidence of pixel parity.

The project-path smoke test uses installed Chrome. After deploying the preserved demo content, run `node scripts/verify-subpath.mjs https://alexanderop.github.io` to verify search, article navigation, return query, robots, and sitemap under `/nuxt-paper/`.

## Workflow record

[Verification record](verification.md) summarizes the final local checks and their scope.

[Grounding](grounding.md), [design judgment](judgment.md), [plan](plan.md), and the append-only [decision log](decisions.tsv) record the implementation decisions. Independent review covered publication boundaries, route handling, search behavior, comments, and this verification harness. The available agents use the same model; independent cross-model review was unavailable.
