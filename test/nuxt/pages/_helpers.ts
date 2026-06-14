import type { PostItem } from "~/utils/posts";

/**
 * Builds a PostItem for tests, with sensible defaults that can be overridden.
 */
export function makePost(overrides: Partial<PostItem> = {}): PostItem {
  return {
    path: "/posts/example",
    title: "Example Post",
    description: "An example post description.",
    pubDatetime: "2024-01-15T00:00:00.000Z",
    modDatetime: null,
    timezone: "Asia/Bangkok",
    featured: false,
    draft: false,
    tags: ["vue"],
    ...overrides,
  };
}
