import { expect, test } from "./test-utils";

for (const width of [320, 390]) {
  test(`article tables scroll without widening a ${width}px page`, async ({ page, goto }) => {
    await page.setViewportSize({ width, height: 844 });
    await goto("/posts/how-i-ported-astropaper-to-nuxt-content-with-fable-5", { waitUntil: "hydration" });
    const table = page.getByRole("table").first();
    await table.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const region = page.getByRole("region", { name: "Scrollable table" });
    await expect(region).toBeVisible();
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
  });
}
