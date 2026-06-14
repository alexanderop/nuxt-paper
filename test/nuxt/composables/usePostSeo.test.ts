import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { renderSSRHead } from "@unhead/vue/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePostSeo } from "~/composables/usePostSeo";

const { routeMock, ogImageSpy } = vi.hoisted(() => ({
  routeMock: { path: "/posts/hello" },
  ogImageSpy: vi.fn<(component: string, options: unknown) => void>(),
}));

mockNuxtImport("useRoute", () => () => routeMock);
mockNuxtImport("defineOgImageComponent", () => ogImageSpy);

type PostInput = Parameters<typeof usePostSeo>[0];

async function renderHead(post: PostInput): Promise<string> {
  let html = "";
  await mountSuspended({
    async setup() {
      usePostSeo(post);
      const head = injectHead();
      const { headTags } = await renderSSRHead(head);
      html = headTags;
      return () => null;
    },
  });
  return html;
}

// Pulls the BlogPosting JSON-LD objects out of the rendered head HTML. The
// head instance can accumulate entries across renders, so callers match the
// one that belongs to their post.
function extractJsonLd(html: string): Record<string, unknown>[] {
  const matches = [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
    ),
  ];
  return matches.map(
    m => JSON.parse(m[1] ?? "{}") as Record<string, unknown>
  );
}

const basePost: PostInput = {
  title: "My Post",
  description: "About my post",
  pubDatetime: "2024-01-01T00:00:00.000Z",
};

describe("usePostSeo", () => {
  beforeEach(() => {
    ogImageSpy.mockReset();
  });

  it("suffixes the page title and marks it as an article", async () => {
    const html = await renderHead(basePost);
    expect(html).toContain("<title>My Post | NuxtPaper</title>");
    expect(html).toContain('content="article"');
  });

  it("sets the article published time from pubDatetime", async () => {
    const html = await renderHead(basePost);
    expect(html).toContain('property="article:published_time"');
    expect(html).toContain('content="2024-01-01T00:00:00.000Z"');
  });

  it("sets the modified time when modDatetime is present", async () => {
    const html = await renderHead({
      ...basePost,
      modDatetime: "2024-02-01T00:00:00.000Z",
    });
    expect(html).toContain('property="article:modified_time"');
    expect(html).toContain('content="2024-02-01T00:00:00.000Z"');
  });

  it("emits BlogPosting JSON-LD with the expected fields", async () => {
    const lds = extractJsonLd(
      await renderHead({ ...basePost, title: "Jane Post", author: "Jane" })
    );
    const ld = lds.find(entry => entry.headline === "Jane Post")!;
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.datePublished).toBe("2024-01-01T00:00:00.000Z");
    expect(ld.author).toEqual([
      {
        "@type": "Person",
        name: "Jane",
        url: "https://satna.ing",
      },
    ]);
  });

  it("falls back to the site author and omits dateModified", async () => {
    const lds = extractJsonLd(
      await renderHead({ ...basePost, title: "Fallback Post" })
    );
    const ld = lds.find(entry => entry.headline === "Fallback Post")!;
    expect((ld.author as Array<{ name: string }>)[0]!.name).toBe("Sat Naing");
    expect(ld.dateModified).toBeUndefined();
  });
});
