import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { searchExcerpt, useSearch } from "~/composables/useSearch";

interface SearchSection {
  id: string;
  title: string;
  titles: string[];
  content: string;
}

const sections: SearchSection[] = [
  {
    id: "1",
    title: "Getting started with Nuxt",
    titles: [],
    content: "Nuxt is a framework for building Vue applications.",
  },
  {
    id: "2",
    title: "Vue reactivity",
    titles: [],
    content: "Refs and computed values drive reactivity in Vue.",
  },
  {
    id: "3",
    title: "Tailwind styling",
    titles: [],
    content: "Utility classes for styling components quickly.",
  },
];

type SearchResult = ReturnType<typeof useSearch>;

async function setup(): Promise<SearchResult> {
  let result!: SearchResult;
  await mountSuspended({
    setup() {
      result = useSearch(sections);
      return () => null;
    },
  });
  return result;
}

describe("useSearch", () => {
  it("starts with an empty query and no results", async () => {
    const { query, results } = await setup();
    expect(query.value).toBe("");
    expect(results.value).toEqual([]);
  });

  it("returns no results for whitespace-only queries", async () => {
    const { query, results } = await setup();
    query.value = "   ";
    expect(results.value).toEqual([]);
  });

  it("finds matching sections by content", async () => {
    const { query, results } = await setup();
    query.value = "reactivity";
    expect(results.value.length).toBeGreaterThan(0);
    expect(results.value[0]!.id).toBe("2");
  });

  it("matches by title with prefix search", async () => {
    const { query, results } = await setup();
    query.value = "Tailw";
    expect(results.value.map(r => r.id)).toContain("3");
  });

  it("caps results at 20", async () => {
    const many: SearchSection[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      title: `Nuxt topic ${i}`,
      titles: [],
      content: "Nuxt content body",
    }));
    let result!: SearchResult;
    await mountSuspended({
      setup() {
        result = useSearch(many);
        return () => null;
      },
    });
    result.query.value = "Nuxt";
    expect(result.results.value.length).toBe(20);
  });
});

describe("searchExcerpt", () => {
  it("returns an empty string for empty content", () => {
    expect(searchExcerpt("", "nuxt")).toBe("");
  });

  it("centres the excerpt on the first match", () => {
    const content =
      "Lorem ipsum dolor sit amet, the special keyword lives here, consectetur adipiscing elit.";
    const excerpt = searchExcerpt(content, "special");
    expect(excerpt).toContain("special");
  });

  it("prefixes an ellipsis when the match is not at the start", () => {
    const content = `${"x".repeat(100)} keyword tail`;
    const excerpt = searchExcerpt(content, "keyword");
    expect(excerpt.startsWith("…")).toBe(true);
  });

  it("returns a leading slice when the term is not found", () => {
    const content = "short content without the term";
    const excerpt = searchExcerpt(content, "missing");
    expect(excerpt).toContain("short content");
    expect(excerpt.startsWith("…")).toBe(false);
  });
});
