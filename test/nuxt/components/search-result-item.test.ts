import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SearchResultItem from "~/components/SearchResultItem.vue";

describe("SearchResultItem", () => {
  it("links to the section id", async () => {
    const wrapper = await mountSuspended(SearchResultItem, {
      props: {
        result: { id: "/posts/my-post#intro", title: "Intro" },
        query: "intro",
      },
    });
    expect(wrapper.find("a").attributes("href")).toBe("/posts/my-post#intro");
  });

  it("joins titles and title with a separator for the display title", async () => {
    const wrapper = await mountSuspended(SearchResultItem, {
      props: {
        result: {
          id: "/posts/my-post#deep",
          titles: ["My Post", "Section"],
          title: "Deep Heading",
        },
        query: "deep",
      },
    });
    expect(wrapper.find("a").text()).toBe("My Post › Section › Deep Heading");
  });

  it("renders an excerpt around the query term", async () => {
    const wrapper = await mountSuspended(SearchResultItem, {
      props: {
        result: {
          id: "/posts/my-post#body",
          title: "Body",
          content: "The quick brown fox jumps over the lazy dog.",
        },
        query: "brown",
      },
    });
    expect(wrapper.find("p").text()).toContain("brown");
  });
});
