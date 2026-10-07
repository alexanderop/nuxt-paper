import { describe, expect, it } from "vitest";
import { isPublished, postPath, publishedPosts } from "#shared/utils/publication";
import { escapeXml, publicationRoutes } from "#shared/utils/routes";

const context = { now: Date.parse("2026-10-07T12:00:00Z"), development: false, scheduledMarginMs: 900000 };

describe("publication policy", () => {
  it("uses the strict scheduled margin boundary and never exposes drafts", () => {
    const post = { pubDatetime: "2026-10-07T12:15:00Z" };
    expect(isPublished(post, context)).toBe(false);
    expect(isPublished(post, { ...context, now: context.now + 1 })).toBe(true);
    expect(isPublished(post, { ...context, development: true })).toBe(true);
    expect(isPublished({ ...post, draft: true }, { ...context, development: true })).toBe(false);
  });

  it("filters then orders by effective modified date", () => {
    const posts = [
      { title: "Old", pubDatetime: "2020-01-01", modDatetime: "2026-01-01" },
      { title: "Recent", pubDatetime: "2025-01-01" },
      { title: "Hidden", pubDatetime: "2026-01-01", draft: true },
      { title: "Future", pubDatetime: "2100-01-01" },
    ];
    expect(publishedPosts(posts, context).map(post => post.title)).toEqual(["Old", "Recent"]);
  });
});

it("keeps normal directories, hides organizational directories, and uses a custom slug", () => {
  expect(postPath("posts/_guides/vue/_drafting/hello.md")).toBe("/posts/vue/hello");
  expect(postPath("posts/My Guides/Hello World.md")).toBe("/posts/my-guides/hello-world");
  expect(postPath("posts/_guides/vue/hello.md", "custom/name")).toBe("/posts/vue/name");
});

it("includes every post and tag pagination route and honors optional pages", () => {
  const posts = [1, 2, 3].map(n => ({ path: `/posts/post-${n}`, tags: ["Vue", "vue"] }));
  expect(publicationRoutes(posts, { perPage: 2, archives: false, search: true })).toEqual([
    "/", "/posts", "/tags", "/about", "/search", "/posts/2", "/posts/post-1", "/posts/post-2", "/posts/post-3", "/tags/vue", "/tags/vue/2",
  ]);
  expect(publicationRoutes([], { perPage: 4, archives: true, search: false })).toEqual(["/", "/posts", "/tags", "/about", "/archives"]);
});

it("escapes XML text and URLs", () => {
  expect(escapeXml('https://example.com/?a=1&b="<x>\'' )).toBe("https://example.com/?a=1&amp;b=&quot;&lt;x&gt;&apos;");
});
