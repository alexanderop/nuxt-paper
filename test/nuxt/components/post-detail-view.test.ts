import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import PostDetailView from "~/components/PostDetailView.vue";

const post = {
  id: "posts/posts/my-post.md",
  path: "/posts/my-post",
  title: "My Great Post",
  description: "desc",
  pubDatetime: "2024-01-01T00:00:00.000Z",
  draft: false,
  tags: ["Vue", "Nuxt"],
  body: { type: "minimal", value: [] },
};

const { useAsyncDataMock } = vi.hoisted(() => ({
  useAsyncDataMock: vi.fn<() => { data: { value: unknown } }>(),
}));

mockNuxtImport("useAsyncData", () => useAsyncDataMock);
mockNuxtImport("useRoute", () => () => ({ path: "/posts/my-post", fullPath: "/posts/my-post" }));
mockNuxtImport("useAdjacentPosts", () => async () => ({
  prevPost: ref({ path: "/posts/older", title: "Older Post" }),
  nextPost: ref({ path: "/posts/newer", title: "Newer Post" }),
}));

describe("PostDetailView", () => {
  it("renders the post title, tags, and adjacent navigation", async () => {
    useAsyncDataMock.mockReturnValue({ data: ref(post) });

    const wrapper = await mountSuspended(PostDetailView, {
      props: { path: "/posts/my-post" },
      global: { stubs: { ContentRenderer: true } },
    });

    expect(wrapper.find("h1").text()).toBe("My Great Post");
    const tagLinks = wrapper
      .findAll("a")
      .filter(a => a.attributes("href")?.startsWith("/tags/"));
    expect(tagLinks.map(a => a.text())).toEqual(["Vue", "Nuxt"]);
    expect(wrapper.text()).toContain("Older Post");
    expect(wrapper.text()).toContain("Newer Post");
  });

  it("renders the post date and share links", async () => {
    useAsyncDataMock.mockReturnValue({ data: ref(post) });

    const wrapper = await mountSuspended(PostDetailView, {
      props: { path: "/posts/my-post" },
      global: { stubs: { ContentRenderer: true } },
    });

    expect(wrapper.find("time").exists()).toBe(true);
    expect(wrapper.text()).toContain("Share this post:");
  });
});
