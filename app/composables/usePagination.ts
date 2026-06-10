import type { PostItem } from "~/utils/posts";

interface PaginationOptions {
  items: MaybeRefOrGetter<PostItem[]>;
  page: MaybeRefOrGetter<number>;
  /** Page 1 lives at `baseUrl` itself; later pages at `baseUrl/<n>`. */
  baseUrl: MaybeRefOrGetter<string>;
}

/**
 * Slices a post list into pages and derives prev/next URLs.
 */
export function usePagination(options: PaginationOptions) {
  const items = computed(() => toValue(options.items));
  const page = computed(() => toValue(options.page));
  const baseUrl = computed(() => toValue(options.baseUrl));

  const lastPage = computed(() =>
    Math.max(1, Math.ceil(items.value.length / POSTS.perPage))
  );

  const pagePosts = computed(() =>
    items.value.slice(
      (page.value - 1) * POSTS.perPage,
      page.value * POSTS.perPage
    )
  );

  const prevUrl = computed(() => {
    if (page.value <= 1) return null;
    return page.value === 2
      ? baseUrl.value
      : `${baseUrl.value}/${page.value - 1}`;
  });

  const nextUrl = computed(() =>
    page.value < lastPage.value ? `${baseUrl.value}/${page.value + 1}` : null
  );

  return { lastPage, pagePosts, prevUrl, nextUrl };
}
