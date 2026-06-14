import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAllPosts } from "~/composables/useAllPosts";
import type { PostItem } from "~/utils/posts";

const { collectionAll } = vi.hoisted(() => ({
  collectionAll: vi.fn<() => Promise<PostItem[]>>(),
}));

// queryCollection(...).select(...).all() — chainable stub ending in all().
mockNuxtImport("queryCollection", () => {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.all = collectionAll;
  return () => builder;
});

function makePost(overrides: Partial<PostItem>): PostItem {
  return {
    path: "/posts/x",
    title: "X",
    pubDatetime: "2024-01-01T00:00:00.000Z",
    tags: [],
    ...overrides,
  };
}

type AllPostsResult = Awaited<ReturnType<typeof useAllPosts>>;

async function setup(): Promise<AllPostsResult> {
  let result!: AllPostsResult;
  await mountSuspended({
    async setup() {
      result = await useAllPosts();
      return () => null;
    },
  });
  return result;
}

describe("useAllPosts", () => {
  beforeEach(() => {
    // useAsyncData caches by key "all-posts"; clear so each test re-fetches.
    clearNuxtData("all-posts");
    collectionAll.mockReset();
  });

  it("returns posts sorted by last-updated descending", async () => {
    collectionAll.mockResolvedValue([
      makePost({ path: "/a", pubDatetime: "2024-01-01T00:00:00.000Z" }),
      makePost({ path: "/b", pubDatetime: "2024-03-01T00:00:00.000Z" }),
      makePost({ path: "/c", pubDatetime: "2024-02-01T00:00:00.000Z" }),
    ]);
    const { data } = await setup();
    expect(data.value.map(p => p.path)).toEqual(["/b", "/c", "/a"]);
  });

  it("filters out drafts", async () => {
    collectionAll.mockResolvedValue([
      makePost({ path: "/visible" }),
      makePost({ path: "/hidden", draft: true }),
    ]);
    const { data } = await setup();
    expect(data.value.map(p => p.path)).toEqual(["/visible"]);
  });

  it("defaults to an empty array", async () => {
    collectionAll.mockResolvedValue([]);
    const { data } = await setup();
    expect(data.value).toEqual([]);
  });
});
