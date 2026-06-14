import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;

test.describe("theme", () => {
  test("toggle flips the <html> data-theme/class and hydrates cleanly", async ({
    page,
    goto,
    hydrationErrors,
  }) => {
    await goto("/", { waitUntil: "hydration" });

    // Highest-value assertion: the SSG output hydrates without mismatches.
    expect(hydrationErrors).toEqual([]);

    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: /toggle theme/i });
    await expect(toggle).toBeVisible({ timeout: CONTENT_TIMEOUT });

    const before = await html.getAttribute("data-theme");

    await toggle.click();

    // The theme attribute must flip to the other value.
    const expected = before === "dark" ? "light" : "dark";
    await expect(html).toHaveAttribute("data-theme", expected, {
      timeout: CONTENT_TIMEOUT,
    });

    // The `dark` class is kept in sync with the theme.
    if (expected === "dark") {
      await expect(html).toHaveClass(/(^|\s)dark(\s|$)/);
    } else {
      await expect(html).not.toHaveClass(/(^|\s)dark(\s|$)/);
    }

    // Toggling back restores the original theme.
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", before ?? "light", {
      timeout: CONTENT_TIMEOUT,
    });

    expect(hydrationErrors).toEqual([]);
  });
});
