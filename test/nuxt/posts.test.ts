import { describe, expect, it } from "vitest";
import {
  getPostsByGroupCondition,
  getSortedPosts,
  getUniqueTags,
  slugifyAll,
  slugifyStr,
  type PostItem,
} from "~/utils/posts";

function makePost(overrides: Partial<PostItem> = {}): PostItem {
  return {
    path: "/posts/example",
    title: "Example",
    pubDatetime: "2024-01-01T00:00:00Z",
    tags: [],
    ...overrides,
  };
}

describe("slugifyStr", () => {
  it("kebab-cases spaces and lowercases", () => {
    expect(slugifyStr("E2E Testing")).toBe("e2e-testing");
  });

  it("strips special characters", () => {
    expect(slugifyStr("Hello, World!")).toBe("hello-world");
  });

  it("collapses repeated separators and trims dashes", () => {
    expect(slugifyStr("  foo__bar  baz  ")).toBe("foo-bar-baz");
  });

  it("keeps non-latin characters", () => {
    expect(slugifyStr("日本語 タグ")).toBe("日本語-タグ");
  });
});

describe("slugifyAll", () => {
  it("slugifies every entry", () => {
    expect(slugifyAll(["Foo Bar", "Baz Qux"])).toEqual(["foo-bar", "baz-qux"]);
  });
});

describe("getSortedPosts", () => {
  it("excludes drafts", () => {
    const posts = [
      makePost({ title: "draft", draft: true }),
      makePost({ title: "published" }),
    ];
    expect(getSortedPosts(posts).map(p => p.title)).toEqual(["published"]);
  });

  it("sorts by modDatetime falling back to pubDatetime, descending", () => {
    const posts = [
      makePost({ title: "old", pubDatetime: "2023-01-01T00:00:00Z" }),
      makePost({
        title: "updated",
        pubDatetime: "2022-01-01T00:00:00Z",
        modDatetime: "2024-06-01T00:00:00Z",
      }),
      makePost({ title: "recent", pubDatetime: "2024-01-01T00:00:00Z" }),
    ];
    expect(getSortedPosts(posts).map(p => p.title)).toEqual([
      "updated",
      "recent",
      "old",
    ]);
  });
});

describe("getUniqueTags", () => {
  it("dedupes by slug and sorts alphabetically", () => {
    const posts = [
      makePost({ tags: ["Vue", "Testing"] }),
      makePost({ tags: ["vue", "Nuxt"] }),
    ];
    expect(getUniqueTags(posts)).toEqual([
      { tag: "nuxt", tagName: "Nuxt" },
      { tag: "testing", tagName: "Testing" },
      { tag: "vue", tagName: "Vue" },
    ]);
  });

  it("ignores tags from drafts", () => {
    const posts = [makePost({ tags: ["secret"], draft: true })];
    expect(getUniqueTags(posts)).toEqual([]);
  });
});

describe("getPostsByGroupCondition", () => {
  it("groups posts by the given key", () => {
    const posts = [
      makePost({ title: "a", pubDatetime: "2023-05-01T00:00:00Z" }),
      makePost({ title: "b", pubDatetime: "2024-02-01T00:00:00Z" }),
      makePost({ title: "c", pubDatetime: "2024-08-01T00:00:00Z" }),
    ];
    const grouped = getPostsByGroupCondition(posts, post =>
      new Date(post.pubDatetime).getFullYear()
    );
    expect(Object.keys(grouped).toSorted()).toEqual(["2023", "2024"]);
    expect(grouped["2024"]?.map(p => p.title)).toEqual(["b", "c"]);
  });
});
