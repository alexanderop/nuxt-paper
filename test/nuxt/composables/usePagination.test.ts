import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { usePagination } from "~/composables/usePagination";
import type { PostItem } from "~/utils/posts";

function makePosts(count: number): PostItem[] {
  return Array.from({ length: count }, (_, i) => ({
    path: `/posts/post-${i}`,
    title: `Post ${i}`,
    pubDatetime: "2024-01-01T00:00:00.000Z",
    tags: [],
  }));
}

type PaginationResult = ReturnType<typeof usePagination>;

async function setup(options: {
  count: number;
  page: number;
  baseUrl?: string;
}): Promise<PaginationResult> {
  let result!: PaginationResult;
  await mountSuspended({
    setup() {
      result = usePagination({
        items: makePosts(options.count),
        page: options.page,
        baseUrl: options.baseUrl ?? "/posts",
      });
      return () => null;
    },
  });
  return result;
}

describe("usePagination", () => {
  it("computes lastPage from item count and perPage (4)", async () => {
    const { lastPage } = await setup({ count: 10, page: 1 });
    expect(lastPage.value).toBe(3);
  });

  it("never returns a lastPage below 1, even with no items", async () => {
    const { lastPage } = await setup({ count: 0, page: 1 });
    expect(lastPage.value).toBe(1);
  });

  it("slices the items for the current page", async () => {
    const { pagePosts } = await setup({ count: 10, page: 2 });
    expect(pagePosts.value.map(p => p.path)).toEqual([
      "/posts/post-4",
      "/posts/post-5",
      "/posts/post-6",
      "/posts/post-7",
    ]);
  });

  it("has no prevUrl on the first page", async () => {
    const { prevUrl } = await setup({ count: 10, page: 1 });
    expect(prevUrl.value).toBeNull();
  });

  it("links page 2's prevUrl to the bare baseUrl", async () => {
    const { prevUrl } = await setup({ count: 10, page: 2 });
    expect(prevUrl.value).toBe("/posts");
  });

  it("links later prevUrls to baseUrl/<n-1>", async () => {
    const { prevUrl } = await setup({ count: 20, page: 3 });
    expect(prevUrl.value).toBe("/posts/2");
  });

  it("links nextUrl to baseUrl/<n+1> when more pages exist", async () => {
    const { nextUrl } = await setup({ count: 20, page: 2 });
    expect(nextUrl.value).toBe("/posts/3");
  });

  it("has no nextUrl on the last page", async () => {
    const { nextUrl } = await setup({ count: 10, page: 3 });
    expect(nextUrl.value).toBeNull();
  });
});
