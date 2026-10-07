import { expect, test } from "./test-utils";

test("Pagefind searches article text and restores the query after returning", async ({ page, goto }) => {
  await goto("/search", { waitUntil: "hydration" });
  const input = page.getByRole("textbox", { name: "Search" });
  await input.fill("color");
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: "Predefined color schemes", exact: true });
  await expect(result).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/q=color/);
  await result.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Predefined color schemes");
  await page.getByRole("link", { name: /go back/i }).click();
  await expect(input).toHaveValue("color");
  await expect(result).toBeVisible();
  await page.getByRole("button", { name: /clear/i }).click();
  await expect(page).not.toHaveURL(/q=/);
});

test("a shared query searches immediately and survives a reload", async ({ page, goto }) => {
  await goto("/search/?q=color", { waitUntil: "hydration" });
  const input = page.getByRole("textbox", { name: "Search" });
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: "Predefined color schemes", exact: true });
  await expect(input).toHaveValue("color");
  await expect(result).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(input).toHaveValue("color");
  await expect(result).toBeVisible({ timeout: 15000 });
});
