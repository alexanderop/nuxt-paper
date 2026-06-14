import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useImageLightbox } from "~/composables/useImageLightbox";

function flushRaf(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function mountWithArticle(html: string) {
  const article = document.createElement("div");
  article.id = "article";
  article.innerHTML = html;
  document.body.appendChild(article);

  const wrapper = await mountSuspended({
    setup() {
      useImageLightbox();
      return () => null;
    },
  });
  // Attribute mutations are deferred to requestAnimationFrame.
  await flushRaf();
  return { article, unmount: () => wrapper.unmount() };
}

describe("useImageLightbox", () => {
  beforeEach(() => {
    // Reduced motion: close() removes the overlay synchronously instead of
    // waiting on a transitionend the layout-less test env never fires.
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    document.getElementById("article")?.remove();
  });

  afterEach(() => {
    document.querySelector('[role="dialog"]')?.remove();
    document.getElementById("article")?.remove();
    document.body.style.overflow = "";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("makes standalone images keyboard-activatable", async () => {
    const { article } = await mountWithArticle(
      '<img src="/a.jpg" alt="A diagram">'
    );
    const img = article.querySelector("img")!;
    expect(img.getAttribute("role")).toBe("button");
    expect(img.getAttribute("tabindex")).toBe("0");
    expect(img.getAttribute("aria-haspopup")).toBe("dialog");
    expect(img.getAttribute("aria-label")).toBe("Zoom image: A diagram");
  });

  it("skips images already wrapped in a link", async () => {
    const { article } = await mountWithArticle(
      '<a href="/x"><img src="/b.jpg" alt="B"></a>'
    );
    const img = article.querySelector("img")!;
    expect(img.getAttribute("role")).toBeNull();
  });

  it("opens a modal dialog when an image is clicked", async () => {
    const { article } = await mountWithArticle(
      '<img src="/a.jpg" alt="A diagram">'
    );
    article.querySelector("img")!.click();

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.getAttribute("aria-label")).toBe("Image preview: A diagram");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes the dialog on Escape (reduced motion removes it immediately)", async () => {
    const { article } = await mountWithArticle('<img src="/a.jpg" alt="A">');
    article.querySelector("img")!.click();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("is a no-op when there is no #article element", async () => {
    await expect(
      mountSuspended({
        setup() {
          useImageLightbox();
          return () => null;
        },
      })
    ).resolves.toBeTruthy();
    await flushRaf();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
