import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { renderSSRHead } from "unhead/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePageSeo } from "~/composables/usePageSeo";

const { routeMock, ogImageSpy } = vi.hoisted(() => ({
  routeMock: { path: "/" },
  ogImageSpy: vi.fn<(component: string, options: unknown) => void>(),
}));

mockNuxtImport("useRoute", () => () => routeMock);
// og-image module is disabled in tests; stub the auto-import.
mockNuxtImport("defineOgImageComponent", () => ogImageSpy);

// Resolves the head built during a composable's setup into rendered HTML so we
// can assert on the actual tags unhead would emit.
async function renderHead(
  options?: Parameters<typeof usePageSeo>[0]
): Promise<string> {
  let html = "";
  await mountSuspended({
    async setup() {
      usePageSeo(options);
      const head = injectHead();
      const { headTags } = await renderSSRHead(head);
      html = headTags;
      return () => null;
    },
  });
  return html;
}

describe("usePageSeo", () => {
  beforeEach(() => {
    routeMock.path = "/";
    ogImageSpy.mockReset();
  });

  it("falls back to the site title and description", async () => {
    const html = await renderHead();
    expect(html).toContain("<title>NuxtPaper</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain("minimal");
  });

  it("uses the provided title and description", async () => {
    const html = await renderHead({
      title: "Custom",
      description: "Custom desc",
    });
    expect(html).toContain("<title>Custom</title>");
    expect(html).toContain('content="Custom desc"');
    expect(html).toContain('property="og:title"');
  });

  it("derives the canonical URL from the route path", async () => {
    routeMock.path = "/posts/hello";
    const html = await renderHead();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain(
      'href="https://alexanderop.github.io/nuxt-paper/posts/hello"'
    );
  });

  it("honours an explicit canonicalURL", async () => {
    const html = await renderHead({ canonicalURL: "https://example.com/x" });
    expect(html).toContain('href="https://example.com/x"');
  });

  it("defaults ogType to website", async () => {
    const html = await renderHead();
    expect(html).toContain('property="og:type"');
    expect(html).toContain('content="website"');
  });

  it("respects an article ogType override", async () => {
    const html = await renderHead({ ogType: "article" });
    expect(html).toContain('content="article"');
  });

  it("emits an absolute og:image when ogImage is provided", async () => {
    const html = await renderHead({ ogImage: "/custom.jpg" });
    expect(html).toContain(
      'content="https://alexanderop.github.io/nuxt-paper/custom.jpg"'
    );
    expect(ogImageSpy).not.toHaveBeenCalled();
  });

  it("generates an og image component when none is provided", async () => {
    await renderHead({ title: "Hello | NuxtPaper", description: "d" });
    expect(ogImageSpy).toHaveBeenCalledWith("BlogPost", {
      title: "Hello",
      description: "d",
    });
  });

  it("omits the google verification meta by default", async () => {
    const html = await renderHead();
    expect(html).not.toContain("google-site-verification");
  });
});
