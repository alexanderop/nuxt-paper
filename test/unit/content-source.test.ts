import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { excludedPostSources } from "../../build/content-source";

const roots: string[] = [];
const context = { now: Date.parse("2026-10-07T12:00:00Z"), development: false, scheduledMarginMs: 900000 };
function source(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "nuxt-paper-content-test-"));
  roots.push(root);
  for (const [path, fields] of Object.entries(files)) {
    const file = join(root, "posts", path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `---\ntitle: Fixture\ndescription: Fixture description\n${fields.includes("pubDatetime:") ? "" : "pubDatetime: 2024-01-01\n"}${fields}\n---\nFixture body`);
  }
  return root;
}
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

it("excludes hidden documents at ingestion while keeping underscore directories", () => {
  const root = source({
    "visible.md": "",
    "_private.md": "",
    "_guides/visible.md": "slug: nested",
    "draft.md": "draft: true",
    "future.md": "pubDatetime: 2100-01-01",
  });
  expect(excludedPostSources(root, context).toSorted()).toEqual(["posts/_private.md", "posts/draft.md", "posts/future.md"]);
  expect(excludedPostSources(root, { ...context, development: true }).toSorted()).toEqual(["posts/_private.md", "posts/draft.md"]);
});

it("rejects canonical collisions and pagination names", () => {
  expect(() => excludedPostSources(source({ "one.md": "slug: same", "_folder/two.md": "slug: same" }), context)).toThrow(/Duplicate post path \/posts\/same/);
  expect(() => excludedPostSources(source({ "one.md": "slug: '2'" }), context)).toThrow(/conflicts with pagination/);
});

it("rejects invalid publication fields before exclusions can hide them", () => {
  expect(() => excludedPostSources(source({ "bad.md": "draft: 'false'" }), context)).toThrow(/Invalid frontmatter in posts\/bad.md/);
  expect(() => excludedPostSources(source({ "bad.md": "modDatetime: tomorrow" }), context)).toThrow(/Invalid frontmatter/);
  expect(() => excludedPostSources(source({ "bad.md": "slug: ../escape" }), context)).toThrow(/Invalid slug/);
});
