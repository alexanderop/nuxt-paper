import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCodeCopyButtons } from "~/composables/useCodeCopyButtons";

async function mountWithArticle(html: string) {
  const article = document.createElement("div");
  article.id = "article";
  article.innerHTML = html;
  document.body.appendChild(article);

  await mountSuspended({
    setup() {
      useCodeCopyButtons();
      return () => null;
    },
  });
  return article;
}

describe("useCodeCopyButtons", () => {
  beforeEach(() => {
    document.getElementById("article")?.remove();
  });

  afterEach(() => {
    document.getElementById("article")?.remove();
    vi.restoreAllMocks();
  });

  it("wraps each code block and injects a copy button", async () => {
    const article = await mountWithArticle(
      "<pre><code>const a = 1;</code></pre>"
    );
    const wrapper = article.querySelector(".code-block-wrapper");
    expect(wrapper).not.toBeNull();
    const button = wrapper?.querySelector("button.copy-code");
    expect(button?.textContent).toBe("Copy");
    expect(wrapper?.querySelector("pre")).not.toBeNull();
  });

  it("does not double-wrap an already-wrapped block", async () => {
    const article = await mountWithArticle(
      '<div class="code-block-wrapper"><pre><code>x</code></pre></div>'
    );
    expect(article.querySelectorAll(".code-block-wrapper").length).toBe(1);
    expect(article.querySelectorAll("button.copy-code").length).toBe(0);
  });

  it("copies the code text to the clipboard and shows feedback", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const article = await mountWithArticle(
      "<pre><code>copy me</code></pre>"
    );
    const button = article.querySelector<HTMLButtonElement>("button.copy-code")!;
    button.click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("copy me");
    expect(button.innerText).toBe("Copied");

    vi.unstubAllGlobals();
  });
});
