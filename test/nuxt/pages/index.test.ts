import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IndexPage from "~/pages/index.vue";
import { makePost } from "./_helpers";

const { posts } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { posts: ref([]) };
});

mockNuxtImport("useAllPosts", () => () => ({ data: posts }));

describe("index page", () => {
  beforeEach(() => {
    posts.value = [
      makePost({ path: "/posts/featured-1", title: "Featured One", featured: true }),
      makePost({ path: "/posts/recent-1", title: "Recent One", featured: false }),
      makePost({ path: "/posts/recent-2", title: "Recent Two", featured: false }),
    ];
  });

  it("renders the hero intro and an RSS link", async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.text()).toContain("Mingalaba");
    expect(wrapper.find("a[aria-label='RSS Feed']").exists()).toBe(true);
  });

  it("renders featured posts under the Featured section", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const featured = wrapper.find("#featured");
    expect(featured.exists()).toBe(true);
    expect(featured.text()).toContain("Featured One");
  });

  it("renders recent posts under the Recent Posts section", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const recent = wrapper.find("#recent-posts");
    expect(recent.exists()).toBe(true);
    expect(recent.text()).toContain("Recent One");
    expect(recent.text()).toContain("Recent Two");
  });

  it("hides the Featured section when there are no featured posts", async () => {
    posts.value = [makePost({ path: "/posts/r", title: "Only Recent" })];
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find("#featured").exists()).toBe(false);
    expect(wrapper.find("#recent-posts").exists()).toBe(true);
  });

  it("links to the all posts page", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const links = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(links).toContain("/posts");
  });
});
