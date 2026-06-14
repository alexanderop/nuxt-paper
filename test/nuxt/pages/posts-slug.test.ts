import { mockComponent, mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { h } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PostsSlugPage from "~/pages/posts/[...slug].vue";
import { makePost } from "./_helpers";

const { posts, routeParams, detailData } = vi.hoisted(() => {
  const { ref } = require("vue");
  return {
    posts: ref([]),
    routeParams: ref({ slug: [] as string[] }),
    detailData: ref({
      id: "posts/posts/one.md",
      path: "/posts/one",
      title: "Post One Detail",
      description: "Detail desc",
      pubDatetime: "2024-01-15T00:00:00.000Z",
      modDatetime: null,
      tags: ["vue"],
      draft: false,
      body: { type: "minimal", value: [] },
    }),
  };
});

mockNuxtImport("useAllPosts", () => () => ({ data: posts }));
mockNuxtImport("useRoute", () => () => ({
  params: routeParams.value,
  query: {},
  path: `/posts/${routeParams.value.slug.join("/")}`,
  fullPath: `/posts/${routeParams.value.slug.join("/")}`,
}));
// PostDetailView fetches a single post via useAsyncData; the list path uses
// useAllPosts (mocked above), so useAsyncData only matters for the detail view.
mockNuxtImport("useAsyncData", () => () => ({ data: detailData }));

mockComponent("ContentRenderer", () => ({
  props: ["value"],
  setup(props: { value: { title: string } }) {
    return () => h("article", { class: "content-stub" }, props.value.title);
  },
}));

posts.value = [
  makePost({ path: "/posts/one", title: "Post One" }),
  makePost({ path: "/posts/two", title: "Post Two" }),
];

describe("posts slug page", () => {
  beforeEach(() => {
    routeParams.value = { slug: [] };
  });

  it("renders the post list view at /posts", async () => {
    const wrapper = await mountSuspended(PostsSlugPage);
    expect(wrapper.find("h1").text()).toBe("Posts");
    const text = wrapper.text();
    expect(text).toContain("Post One");
    expect(text).toContain("Post Two");
  });

  it("treats a numeric segment as a paginated list page", async () => {
    routeParams.value = { slug: ["1"] };
    const wrapper = await mountSuspended(PostsSlugPage);
    expect(wrapper.find("h1").text()).toBe("Posts");
    expect(wrapper.text()).toContain("Post One");
  });

  it("renders the post detail view for a non-numeric slug", async () => {
    routeParams.value = { slug: ["one"] };
    const wrapper = await mountSuspended(PostsSlugPage);
    expect(wrapper.find(".content-stub").exists()).toBe(true);
    expect(wrapper.text()).toContain("Post One Detail");
  });
});
