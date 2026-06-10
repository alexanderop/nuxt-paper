import MiniSearch from "minisearch";

interface SearchSection {
  id: string;
  title: string;
  titles: string[];
  content: string;
}

/**
 * Full-text search over the post search sections, max 20 results.
 */
export function useSearch(sections: MaybeRefOrGetter<SearchSection[]>) {
  const query = ref("");

  const miniSearch = computed(() => {
    const search = new MiniSearch({
      fields: ["title", "content"],
      storeFields: ["title", "content", "titles", "id"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: { title: 2 },
      },
    });
    search.addAll(toValue(sections));
    return search;
  });

  const results = computed(() => {
    if (!query.value.trim()) return [];
    return miniSearch.value.search(query.value).slice(0, 20);
  });

  return { query, results };
}

/**
 * A short snippet of `content` around the first occurrence of `query`.
 */
export function searchExcerpt(content: string, query: string) {
  if (!content) return "";
  const lower = content.toLowerCase();
  const term = query.trim().toLowerCase().split(/\s+/)[0] ?? "";
  const index = lower.indexOf(term);
  const start = Math.max(0, index - 60);
  const end = Math.min(content.length, (index < 0 ? 0 : index) + 160);
  return (
    (start > 0 ? "…" : "") +
    content.slice(start, end).trim() +
    (end < content.length ? "…" : "")
  );
}
