import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;

test.describe("search", () => {
  test("typing a query renders client-side results", async ({ page, goto }) => {
    await goto("/search", { waitUntil: "hydration" });

    const input = page.getByRole("searchbox");
    await expect(input).toBeVisible({ timeout: CONTENT_TIMEOUT });

    await input.fill("color");

    // minisearch runs client-side; the results list should populate.
    const results = page.locator("#search-container ul li");
    await expect(results.first()).toBeVisible({ timeout: CONTENT_TIMEOUT });
    expect(await results.count()).toBeGreaterThan(0);

    await expect(
      page.getByRole("link", { name: /color schemes/i }).first()
    ).toBeVisible({ timeout: CONTENT_TIMEOUT });
  });
});
