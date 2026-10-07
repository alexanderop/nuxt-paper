import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

const source = resolve(import.meta.dirname, "..");
const stage = await mkdtemp(join(tmpdir(), "nuxt-paper-publication-"));
const omitted = new Set(["node_modules", ".git", ".nuxt", ".output", ".data", ".nitro", "coverage", "test-results", "playwright-report", "pagefind"]);
await cp(source, stage, { recursive: true, filter: path => !omitted.has(basename(path)) });
const content = join(stage, "publication-fixture");
await mkdir(join(content, "pages"), { recursive: true });
await writeFile(join(content, "pages/about.md"), "---\ntitle: About\n---\nPublication test.");
async function post(path, title, fields = "") {
  const file = join(content, "posts", path);
  await mkdir(resolve(file, ".."), { recursive: true });
  await writeFile(file, `---\ntitle: ${title}\ndescription: ${title}\npubDatetime: 2020-01-01\ntags: [fixture]\n${fields}\n---\n${title}`);
}
await post("public.md", "RetiredCanaryAlpha");
await post("morning.md", "MorningCanary", "modDatetime: 2020-01-01T04:57:06.476Z");
await post("later.md", "LaterCanary");
const later = join(content, "posts/later.md");
await writeFile(later, (await readFile(later, "utf8")).replace("2020-01-01", "2020-01-01T07:15:45.792Z"));
await post("_org/guides/Visible Entry.md", "VisibleCanaryBeta");
await post("custom.md", "CustomCanaryGamma", "slug: custom-location");
await post("draft.md", "DraftCanaryDelta", "draft: true");
await post("_private.md", "PrivateCanaryEpsilon");
await post("future.md", "FutureCanaryZeta", "draft: false");
const future = join(content, "posts/future.md");
await writeFile(future, (await readFile(future, "utf8")).replace("2020-01-01", "2100-01-01"));
const env = { ...process.env, NUXT_CONTENT_ROOT: content, NUXT_PUBLICATION_NOW: String(Date.parse("2026-10-07T12:00:00Z")), NUXT_APP_BASE_URL: "/" };
function run(args) { execFileSync("pnpm", args, { cwd: stage, env, stdio: "inherit" }); }
async function files(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]))).flat();
}
async function publishedText() {
  const chunks = await Promise.all((await files(join(stage, ".output/public"))).map(async file => {
    const bytes = await readFile(file);
    return bytes.toString() + (bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes).toString() : "");
  }));
  return chunks.join("\n");
}
run(["install", "--offline", "--frozen-lockfile"]);
run(["generate"]);
let output = await publishedText();
const listing = await readFile(join(stage, ".output/public/posts/index.html"), "utf8");
assert.ok(listing.indexOf("LaterCanary") < listing.indexOf("MorningCanary"), "Publication timestamp hours determine newest-first ordering");
const laterArticle = await readFile(join(stage, ".output/public/posts/later/index.html"), "utf8");
assert.ok(laterArticle.includes("2020-01-01T07:15:45.792Z"), "Publication preserves timezone and subsecond precision");
assert.match(output, /VisibleCanaryBeta/);
assert.match(output, /RetiredCanaryAlpha/);
for (const hidden of ["DraftCanaryDelta", "PrivateCanaryEpsilon", "FutureCanaryZeta"]) assert.ok(!output.includes(hidden), `${hidden} absent from HTML, payload, database and compressed index`);
await readFile(join(stage, ".output/public/posts/guides/visible-entry/index.html"));
await readFile(join(stage, ".output/public/posts/custom-location/index.html"));
await post("public.md", "RetiredCanaryAlpha", "draft: true");
run(["build"]);
output = await publishedText();
assert.match(output, /VisibleCanaryBeta/);
assert.ok(!output.includes("RetiredCanaryAlpha"), "Retired post absent after consecutive build, including old Pagefind fragments");
console.log(`Publication artifacts verified in ${stage}`);
