import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdjacentPosts } from "~/composables/useAdjacentPosts";
import type { PostItem } from "~/utils/posts";

const { collectionAll } = vi.hoisted(() => ({
  collectionAll: vi.fn<() => Promise<PostItem[]>>(),
}));

mockNuxtImport("queryCollection", () => {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.all = collectionAll;
  return () => builder;
});

function makePost(path: string, pubDatetime: string): PostItem {
  return { path, title: path, pubDatetime, tags: [] };
}

// Sorted newest-first: /b (Mar), /c (Feb), /a (Jan).
const posts: PostItem[] = [
  makePost("/a", "2024-01-01T00:00:00.000Z"),
  makePost("/b", "2024-03-01T00:00:00.000Z"),
  makePost("/c", "2024-02-01T00:00:00.000Z"),
];

type AdjacentResult = Awaited<ReturnType<typeof useAdjacentPosts>>;

async function setup(path: string): Promise<AdjacentResult> {
  let result!: AdjacentResult;
  await mountSuspended({
    async setup() {
      result = await useAdjacentPosts(path);
      return () => null;
    },
  });
  return result;
}

describe("useAdjacentPosts", () => {
  beforeEach(() => {
    clearNuxtData("all-posts");
    collectionAll.mockReset();
    collectionAll.mockResolvedValue(posts);
  });

  it("returns prev and next around a middle post", async () => {
    const { nextPost, prevPost } = await setup("/c");
    expect(nextPost.value?.path).toBe("/b");
    expect(prevPost.value?.path).toBe("/a");
  });

  it("has no nextPost for the first post", async () => {
    const { nextPost, prevPost } = await setup("/b");
    expect(nextPost.value).toBeNull();
    expect(prevPost.value?.path).toBe("/c");
  });

  it("has no prevPost for the last post", async () => {
    const { nextPost, prevPost } = await setup("/a");
    expect(nextPost.value?.path).toBe("/c");
    expect(prevPost.value).toBeNull();
  });

  it("returns null on both sides for an unknown path", async () => {
    const { nextPost, prevPost } = await setup("/missing");
    expect(nextPost.value).toBeNull();
    expect(prevPost.value).toBeNull();
  });
});
