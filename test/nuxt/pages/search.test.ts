import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import SearchPage from "~/pages/search.vue";

const { sections } = vi.hoisted(() => {
  const { ref } = require("vue");
  return {
    sections: ref([
      {
        id: "/posts/vue-tips#intro",
        title: "Vue Tips",
        titles: ["Vue Tips"],
        content: "A collection of useful Vue tips and tricks.",
      },
      {
        id: "/posts/nuxt-guide#intro",
        title: "Nuxt Guide",
        titles: ["Nuxt Guide"],
        content: "An introductory guide to building Nuxt apps.",
      },
    ]),
  };
});

mockNuxtImport("useAsyncData", () => () => ({ data: sections }));

describe("search page", () => {
  it("renders the search UI with title and input", async () => {
    const wrapper = await mountSuspended(SearchPage);
    expect(wrapper.find("h1").text()).toBe("Search");
    expect(wrapper.find("#search-container").exists()).toBe(true);
    expect(wrapper.find("input[type='search']").exists()).toBe(true);
  });

  it("shows no results summary before any query is typed", async () => {
    const wrapper = await mountSuspended(SearchPage);
    expect(wrapper.text()).not.toContain("result");
  });

  it("renders matching results when a query is entered", async () => {
    const wrapper = await mountSuspended(SearchPage);
    const input = wrapper.find("input[type='search']");
    await input.setValue("Vue");
    expect(wrapper.text()).toContain("Vue Tips");
    expect(wrapper.text()).toContain("result");
  });

  it("shows the no-results message for a non-matching query", async () => {
    const wrapper = await mountSuspended(SearchPage);
    const input = wrapper.find("input[type='search']");
    await input.setValue("zzzznomatch");
    expect(wrapper.text()).toContain("No results found");
  });
});
