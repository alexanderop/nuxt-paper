import { isPublished, publishedPosts, type PublicationContext } from "#shared/utils/publication";

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
export { slugifyStr } from "#shared/utils/routes";
import { slugifyStr } from "#shared/utils/routes";

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

export function postFilter(post: Pick<PostItem, "draft" | "pubDatetime">, context: PublicationContext) {
  return isPublished(post, context);
}

export function getSortedPosts<T extends PostItem>(posts: T[], context: PublicationContext): T[] {
  return publishedPosts(posts, context);
}

/**
 * Builds a de-duplicated, sorted tag list from posts.
 * `tag` is the slug used in URLs; `tagName` is the original label for display.
 */
export function getUniqueTags(posts: PostItem[]): TagItem[] {
  return posts.toSorted((a, b) => a.path.localeCompare(b.path))
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
