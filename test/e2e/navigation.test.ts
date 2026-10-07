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
    const transitionName = await postLink.getByRole("heading").evaluate(element => getComputedStyle(element).viewTransitionName);
    expect(transitionName).not.toBe("none");
    await postLink.click();

    await expect(page).toHaveURL(/\/posts\/predefined-color-schemes\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /predefined color schemes/i })
    ).toBeVisible({ timeout: CONTENT_TIMEOUT });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("view-transition-name", transitionName);
  });
});

test("adjacent articles update content and metadata, then browser back restores both", async ({ page, goto }) => {
  await goto("/posts/how-i-ported-astropaper-to-nuxt-content-with-fable-5", { waitUntil: "hydration" });
  const original = await page.getByRole("heading", { level: 1 }).innerText();
  await page.getByRole("link", { name: /Previous Post Predefined color schemes/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Predefined color schemes");
  await expect(page).toHaveTitle("Predefined color schemes | NuxtPaper");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/posts\/predefined-color-schemes$/);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(original);
  await expect(page).toHaveTitle(`${original} | NuxtPaper`);
});

test("skip link moves keyboard focus to main content", async ({ page, goto }) => {
  await goto("/", { waitUntil: "hydration" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

for (const path of ["/posts/", "/tags/", "/archives/", "/about/", "/posts/predefined-color-schemes/"]) {
  test(`initial ${path} does not start a route transition during hydration`, async ({ page, goto }) => {
    await page.addInitScript(() => {
      let starts = 0;
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        starts++;
        document.documentElement.dataset.initialTransitions = String(starts);
        return start(...args);
      };
    });
    await goto(path, { waitUntil: "hydration" });
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#main-content")).toBeVisible();
    if (path === "/about/") await expect(page.getByRole("link", { name: "Link to this section" })).toHaveCount(0);
    expect(await page.locator("html").getAttribute("data-initial-transitions")).toBeNull();
  });
}

test("shared article titles use destination card fade timing only on return", async ({ page, goto }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      document.documentElement.dataset.transitionFinished = "false";
      const transition = start(...args);
      void transition.finished.then(() => { document.documentElement.dataset.transitionFinished = "true"; });
      void transition.ready.then(() => {
        document.documentElement.dataset.transitions = JSON.stringify(document.getAnimations().map(animation => ({
          name: animation instanceof CSSAnimation ? animation.animationName : "",
          pseudo: animation.effect instanceof KeyframeEffect ? animation.effect.pseudoElement : "",
          duration: animation.effect?.getTiming().duration,
        })));
      });
      return transition;
    };
  });
  await goto("/", { waitUntil: "hydration" });
  await page.getByRole("link", { name: "Predefined color schemes", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Predefined color schemes");
  await expect.poll(() => page.locator("html").getAttribute("data-transitions")).toContain("250");
  const destination = JSON.parse((await page.locator("html").getAttribute("data-transitions"))!);
  expect(destination.filter((sample: { pseudo?: string }) => sample.pseudo?.includes("postspredefined-color-schemes")).every((sample: { duration: number }) => sample.duration === 250)).toBe(true);
  expect(destination.filter((sample: { pseudo?: string }) => sample.pseudo === "::view-transition-old(postshow-i-ported-astropaper-to-nuxt-content-with-fable-5)").every((sample: { duration: number }) => sample.duration === 250)).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-transition-finished", "true");
  await page.goBack();
  await expect.poll(async () => {
    const samples = JSON.parse((await page.locator("html").getAttribute("data-transitions"))!);
    return samples.find((sample: { pseudo?: string }) => sample.pseudo === "::view-transition-new(postspredefined-color-schemes)")?.duration;
  }).toBe(180);
  const returning = JSON.parse((await page.locator("html").getAttribute("data-transitions"))!);
  expect(returning.filter((sample: { pseudo?: string }) => sample.pseudo === "::view-transition-old(tag-color-schemes)").every((sample: { duration: number }) => sample.duration === 250)).toBe(true);
});
