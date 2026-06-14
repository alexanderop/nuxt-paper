import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import TagsIndexPage from "~/pages/tags/index.vue";
import { makePost } from "./_helpers";

const { posts } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { posts: ref([]) };
});

mockNuxtImport("useAllPosts", () => () => ({ data: posts }));

posts.value = [
  makePost({ path: "/posts/a", title: "A", tags: ["Vue", "Nuxt"] }),
  makePost({ path: "/posts/b", title: "B", tags: ["Testing"] }),
];

describe("tags index page", () => {
  it("renders the page title and description", async () => {
    const wrapper = await mountSuspended(TagsIndexPage);
    expect(wrapper.find("h1").text()).toBe("Tags");
    expect(wrapper.text()).toContain("All the tags used in posts.");
  });

  it("lists a pill for each unique tag, linking to its tag page", async () => {
    const wrapper = await mountSuspended(TagsIndexPage);
    const hrefs = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/tags/vue");
    expect(hrefs).toContain("/tags/nuxt");
    expect(hrefs).toContain("/tags/testing");
    expect(wrapper.text()).toContain("Vue");
    expect(wrapper.text()).toContain("Testing");
  });
});
