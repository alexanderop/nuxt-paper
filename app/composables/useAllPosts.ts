import type { PostItem } from "~/utils/posts";

/**
 * Fetches all posts (lean fields only, no body), filtered for visibility
 * and sorted by "last updated" descending.
 */
export function useAllPosts() {
  return useAsyncData(
    "all-posts",
    () =>
      queryCollection("posts")
        .select(
          "path",
          "title",
          "description",
          "pubDatetime",
          "modDatetime",
          "timezone",
          "featured",
          "draft",
          "tags"
        )
        .all() as Promise<PostItem[]>,
    {
      transform: posts => getSortedPosts(posts),
      default: () => [] as PostItem[],
    }
  );
}
