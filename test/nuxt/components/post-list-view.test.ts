import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import { describe, expect, it } from "vitest";
import PostListView from "~/components/PostListView.vue";
import type { PostItem } from "~/utils/posts";

function makePost(n: number): PostItem {
  return {
    path: `/posts/post-${n}`,
    title: `Post ${n}`,
    description: `Description ${n}`,
    pubDatetime: `2024-01-0${n}T00:00:00.000Z`,
    tags: [],
  };
}

const posts = Array.from({ length: 6 }, (_, i) => makePost(i + 1));

mockNuxtImport("useAllPosts", () => () => ({ data: ref(posts) }));
mockNuxtImport("useRoute", () => () => ({ path: "/posts", fullPath: "/posts" }));

describe("PostListView", () => {
  it("renders the posts page heading", async () => {
    const wrapper = await mountSuspended(PostListView, { props: { page: 1 } });
    expect(wrapper.text()).toContain("Posts");
  });

  it("shows only the first page of posts", async () => {
    const wrapper = await mountSuspended(PostListView, { props: { page: 1 } });
    const titles = wrapper.findAll("li a").map(a => a.text());
    expect(titles).toContain("Post 1");
    expect(titles).toContain("Post 4");
    expect(wrapper.text()).not.toContain("Post 5");
  });

  it("shows the second page of posts", async () => {
    const wrapper = await mountSuspended(PostListView, { props: { page: 2 } });
    expect(wrapper.text()).toContain("Post 5");
    expect(wrapper.text()).toContain("Post 6");
    expect(wrapper.text()).not.toContain("Post 1");
  });

  it("renders pagination when there is more than one page", async () => {
    const wrapper = await mountSuspended(PostListView, { props: { page: 1 } });
    const nav = wrapper.find("nav[aria-label='Pagination Navigation']");
    expect(nav.exists()).toBe(true);
    expect(nav.text()).toContain("1 / 2");
  });

  it("throws a 404 for an out-of-range page", async () => {
    await expect(
      mountSuspended(PostListView, { props: { page: 99 } })
    ).rejects.toThrow("Page Not Found");
  });
});
