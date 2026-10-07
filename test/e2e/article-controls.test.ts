import { expect, test } from "./test-utils";

test("copy preserves the article's multiline CSS including its blank line", async ({ page, context, goto }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await goto("/posts/how-i-ported-astropaper-to-nuxt-content-with-fable-5", { waitUntil: "hydration" });
  const block = page.locator("pre").filter({ hasText: ".app-prose pre.shiki {" });
  await block.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(block.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`.app-prose pre.shiki {
  --shiki-default-bg: #ffffff; /* min-light */
  --shiki-dark-bg: #011627; /* night-owl */
  background-color: var(--shiki-default-bg);
}

html[data-theme="dark"] .app-prose pre.shiki {
  background-color: var(--shiki-dark-bg);
}`);
});
