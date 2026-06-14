import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "./test-utils";

// test/e2e/ → repo root → .output/public
const PUBLIC_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  ".output",
  "public"
);

function collectPngs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectPngs(full));
    else if (entry.isFile() && entry.name.endsWith(".png")) out.push(full);
  }
  return out;
}

test.describe("prerender artifacts", () => {
  test("GET /rss.xml is valid XML with at least one item", async ({
    request,
  }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);

    const body = await res.text();
    // Well-formed XML: declaration, rss root, and at least one item.
    expect(body).toMatch(/^<\?xml\s/);
    expect(body).toContain("<rss");
    expect(body).toMatch(/<item>/);
  });

  test("GET /sitemap.xml is valid XML with at least one url", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);

    const body = await res.text();
    expect(body).toMatch(/^<\?xml\s/);
    expect(body).toContain("<urlset");
    expect(body).toMatch(/<url>/);
  });

  test("OG image PNGs exist on disk and are non-empty", () => {
    const ogDir = join(PUBLIC_DIR, "_og");
    expect(existsSync(ogDir)).toBe(true);

    const pngs = collectPngs(ogDir);
    expect(pngs.length).toBeGreaterThan(0);

    for (const png of pngs) {
      expect(statSync(png).size).toBeGreaterThan(0);
    }
  });
});
