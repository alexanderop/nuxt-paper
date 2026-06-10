/**
 * One-time migration of AstroPaper content (cloned at /tmp/astro-paper)
 * into this Nuxt Content project.
 *
 * - Renames post files to their frontmatter `slug` (Astro's glob loader used
 *   the slug as the post id, so URLs match the original site)
 * - Flattens `_releases/` and `_color-schemes/` (underscore dirs don't appear
 *   in AstroPaper URLs)
 * - Converts MDX to MDC (strips imports, rewrites <ResponsiveTable> to
 *   ::responsive-table blocks, removes JSX artifacts)
 * - Rewrites image references to /images/ and copies the assets to public/
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "/tmp/astro-paper/src";
const ROOT = path.dirname(new URL(import.meta.url).pathname) + "/..";

const contentPosts = path.join(ROOT, "content/posts");
const contentPages = path.join(ROOT, "content/pages");
const publicImages = path.join(ROOT, "public/images");

fs.mkdirSync(contentPosts, { recursive: true });
fs.mkdirSync(path.join(contentPosts, "examples"), { recursive: true });
fs.mkdirSync(contentPages, { recursive: true });
fs.mkdirSync(publicImages, { recursive: true });

function getSlug(content) {
  const fmEnd = content.indexOf("---", 4);
  const fm = content.slice(0, fmEnd);
  const match = fm.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
  return match ? match[1].trim() : null;
}

function transform(content) {
  let out = content;

  // MDX import lines (top-level only, not in code fences — imports of
  // ResponsiveTable appear right after frontmatter)
  out = out.replace(
    /^import ResponsiveTable from ['"]@\/components\/ResponsiveTable\.astro['"];?\n/gm,
    ""
  );

  // <ResponsiveTable> JSX -> MDC block component
  out = out.replace(
    /<ResponsiveTable\s+variant="([\w-]+)"[^>]*>/g,
    '::responsive-table{variant="$1"}'
  );
  out = out.replace(/<ResponsiveTable\s*>/g, "::responsive-table");
  out = out.replace(/<\/ResponsiveTable>/g, "::");

  // JSX whitespace artifacts
  out = out.replaceAll('{" "}', " ");

  // Escape callout markers so MDC's inline span syntax ([text]) doesn't
  // consume them before rehype-callouts runs.
  out = out.replace(/^(>\s*)\[!(\w+)\]/gm, "$1\\[!$2]");

  // Image path rewrites
  out = out.replace(/(\.\.\/)+assets\/images\//g, "/images/");
  out = out.replace(/@\/assets\/images\//g, "/images/");
  out = out.replace(/\]\((\.\/)?assets\//g, "](/images/");

  return out;
}

function migrateFile(srcPath, destDir) {
  const raw = fs.readFileSync(srcPath, "utf8");
  const slug = getSlug(raw);
  const base = path.basename(srcPath).replace(/\.mdx?$/, "");
  const name = (slug ?? base) + ".md";
  fs.writeFileSync(path.join(destDir, name), transform(raw));
  console.log(`${path.relative(SRC, srcPath)} -> ${name}`);
}

// Root posts (md + mdx)
for (const f of fs.readdirSync(path.join(SRC, "content/posts"))) {
  if (!/\.mdx?$/.test(f)) continue;
  migrateFile(path.join(SRC, "content/posts", f), contentPosts);
}

// Example posts (keep subdirectory, matches original URLs)
for (const f of fs.readdirSync(path.join(SRC, "content/posts/examples"))) {
  if (!/\.mdx?$/.test(f)) continue;
  migrateFile(
    path.join(SRC, "content/posts/examples", f),
    path.join(contentPosts, "examples")
  );
}

// Release + color-scheme posts (underscore dirs flatten to the posts root)
for (const dir of ["_releases", "_color-schemes"]) {
  const full = path.join(SRC, "content/posts", dir);
  for (const f of fs.readdirSync(full)) {
    if (!/\.mdx?$/.test(f)) continue;
    migrateFile(path.join(full, f), contentPosts);
  }
  // Their assets
  const assets = path.join(full, "assets");
  if (fs.existsSync(assets)) {
    for (const img of fs.readdirSync(assets)) {
      fs.copyFileSync(path.join(assets, img), path.join(publicImages, img));
    }
  }
}

// About page
migrateFile(path.join(SRC, "content/pages/about.md"), contentPages);

// Shared images
for (const img of fs.readdirSync(path.join(SRC, "assets/images"))) {
  fs.copyFileSync(
    path.join(SRC, "assets/images", img),
    path.join(publicImages, img)
  );
}

// Public assets
for (const f of fs.readdirSync("/tmp/astro-paper/public")) {
  fs.copyFileSync(
    path.join("/tmp/astro-paper/public", f),
    path.join(ROOT, "public", f)
  );
}

console.log("Done.");
