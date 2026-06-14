import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;

test.describe("tags", () => {
  test("tags index → a tag page lists posts for that tag", async ({
    page,
    goto,
  }) => {
    await goto("/tags", { waitUntil: "hydration" });

    const tagLink = page.getByRole("link", { name: /color-schemes/i }).first();
    await expect(tagLink).toBeVisible({ timeout: CONTENT_TIMEOUT });
    await tagLink.click();

    await expect(page).toHaveURL(/\/tags\/color-schemes\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /color-schemes/i })
    ).toBeVisible({ timeout: CONTENT_TIMEOUT });

    // The tag page must list at least one post link for that tag.
    const postLinks = page.locator('a[href^="/posts/"]');
    await expect(postLinks.first()).toBeVisible({ timeout: CONTENT_TIMEOUT });
    expect(await postLinks.count()).toBeGreaterThan(0);
    await expect(
      page.getByRole("link", { name: /predefined color schemes/i }).first()
    ).toBeVisible({ timeout: CONTENT_TIMEOUT });
  });
});
