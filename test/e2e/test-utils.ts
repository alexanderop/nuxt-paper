import { expect, test as base } from "@nuxt/test-utils/playwright";

/**
 * Extends the base Nuxt/Playwright `test` with an auto fixture that collects
 * Vue hydration-mismatch console errors. The single highest-value e2e check for
 * a static site is that the SSG output hydrates cleanly — see brain/testing/e2e.md.
 *
 * Usage:
 *   test("home hydrates cleanly", async ({ page, goto, hydrationErrors }) => {
 *     await goto("/", { waitUntil: "hydration" });
 *     expect(hydrationErrors).toEqual([]);
 *   });
 */
const HYDRATION_PATTERN = /hydration.*mismatch|hydration node mismatch|hydration children mismatch/i;

export const test = base.extend<{ hydrationErrors: string[] }>({
  hydrationErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() !== "error" && msg.type() !== "warning") return;
        const text = msg.text();
        if (HYDRATION_PATTERN.test(text)) errors.push(text);
      });
      page.on("pageerror", (err) => {
        if (HYDRATION_PATTERN.test(err.message)) errors.push(err.message);
      });
      await use(errors);
    },
    { auto: true },
  ],
});

export { expect };
