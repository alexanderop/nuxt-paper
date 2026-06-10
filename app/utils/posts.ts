export interface PostItem {
  path: string;
  title: string;
  description?: string;
  pubDatetime: string;
  modDatetime?: string | null;
  timezone?: string;
  featured?: boolean;
  draft?: boolean;
  tags: string[];
}

export interface TagItem {
  tag: string;
  tagName: string;
}

/**
 * Slugify a string: "E2E Testing" -> "e2e-testing".
 * Non-latin characters are kept as-is (kebab-cased).
 */
export function slugifyStr(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

/**
 * Determines whether a post is eligible to be listed/rendered.
 *
 * - Excludes drafts always
 * - In production, excludes scheduled posts until `pubDatetime` minus the configured margin
 * - In dev, always shows non-draft posts to make authoring easier
 */
export function postFilter(post: Pick<PostItem, "draft" | "pubDatetime">) {
  const isPublishTimePassed =
    Date.now() >
    new Date(post.pubDatetime).getTime() - POSTS.scheduledPostMargin;
  return !post.draft && (import.meta.dev || isPublishTimePassed);
}

/**
 * Returns posts that are eligible to be shown, sorted by "last updated"
 * descending (uses `modDatetime` when present, otherwise `pubDatetime`).
 */
export function getSortedPosts<T extends PostItem>(posts: T[]): T[] {
  return posts
    .filter(postFilter)
    .toSorted(
      (a, b) =>
        Math.floor(new Date(b.modDatetime ?? b.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(a.modDatetime ?? a.pubDatetime).getTime() / 1000)
    );
}

/**
 * Builds a de-duplicated, sorted tag list from posts.
 * `tag` is the slug used in URLs; `tagName` is the original label for display.
 */
export function getUniqueTags(posts: PostItem[]): TagItem[] {
  return posts
    .filter(postFilter)
    .flatMap(post => post.tags)
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .toSorted((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
}

/**
 * Groups posts by a given key (e.g. year, month).
 */
export function getPostsByGroupCondition<T extends PostItem>(
  posts: T[],
  groupFunction: (post: T) => string | number
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const post of posts) {
    const groupKey = String(groupFunction(post));
    (result[groupKey] ??= []).push(post);
  }
  return result;
}
