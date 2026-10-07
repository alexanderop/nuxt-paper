import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const origin = process.argv[2] || "http://localhost:5681";
const base = "/nuxt-paper";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${origin}${base}/search?q=color`);
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: "Predefined color schemes", exact: true });
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("href", `${base}/posts/predefined-color-schemes`);
  await result.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Predefined color schemes");
  const back = page.getByRole("link", { name: "Go back", exact: true });
  await expect(back).toHaveAttribute("href", `${base}/search?q=color`);
  await back.click();
  await expect(page).toHaveURL(`${origin}${base}/search?q=color`);
  await expect(page.getByRole("textbox", { name: "Search" })).toHaveValue("color");
  await expect(result).toBeVisible();
  const robots = await page.request.get(`${origin}${base}/robots.txt`);
  assert.equal(robots.status(), 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/alexanderop.github.io\/nuxt-paper\/sitemap.xml/);
  const sitemap = await page.request.get(`${origin}${base}/sitemap.xml`);
  assert.match(await sitemap.text(), /https:\/\/alexanderop.github.io\/nuxt-paper\/posts\/predefined-color-schemes/);
  assert.deepEqual(errors, []);
  console.log("Actual Chrome subpath search, article, return query, robots and sitemap passed.");
} finally {
  await browser.close();
}
