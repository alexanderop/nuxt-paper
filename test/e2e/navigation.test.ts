import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;

test.describe("navigation", () => {
  test("home page hydrates cleanly", async ({ goto, hydrationErrors }) => {
    await goto("/", { waitUntil: "hydration" });
    expect(hydrationErrors).toEqual([]);
  });

  test("home → click a post → land on the post page", async ({
    page,
    goto,
  }) => {
    await goto("/", { waitUntil: "hydration" });

    const postLink = page
      .getByRole("link", { name: /predefined color schemes/i })
      .first();
    await expect(postLink).toBeVisible({ timeout: CONTENT_TIMEOUT });
    await postLink.click();

    await expect(page).toHaveURL(/\/posts\/predefined-color-schemes\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /predefined color schemes/i })
    ).toBeVisible({ timeout: CONTENT_TIMEOUT });
  });
});
