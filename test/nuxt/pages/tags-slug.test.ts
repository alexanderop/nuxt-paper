import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TagsSlugPage from "~/pages/tags/[...slug].vue";
import { makePost } from "./_helpers";

const { posts, routeParams } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { posts: ref([]), routeParams: ref({ slug: ["vue"] }) };
});

mockNuxtImport("useAllPosts", () => () => ({ data: posts }));
mockNuxtImport("useRoute", () => () => ({
  params: routeParams.value,
  query: {},
  path: `/tags/${routeParams.value.slug.join("/")}`,
  fullPath: `/tags/${routeParams.value.slug.join("/")}`,
}));

posts.value = [
  makePost({ path: "/posts/a", title: "Vue Post One", tags: ["Vue"] }),
  makePost({ path: "/posts/b", title: "Vue Post Two", tags: ["Vue"] }),
  makePost({ path: "/posts/c", title: "Nuxt Post", tags: ["Nuxt"] }),
];

describe("tags slug page", () => {
  beforeEach(() => {
    routeParams.value = { slug: ["vue"] };
  });

  it("renders a heading with the tag name", async () => {
    const wrapper = await mountSuspended(TagsSlugPage);
    expect(wrapper.find("h1").text()).toContain("Tag: Vue");
  });

  it("lists only posts that have the tag", async () => {
    const wrapper = await mountSuspended(TagsSlugPage);
    const text = wrapper.text();
    expect(text).toContain("Vue Post One");
    expect(text).toContain("Vue Post Two");
    expect(text).not.toContain("Nuxt Post");
  });

  it("throws a 404 when the tag has no posts", async () => {
    routeParams.value = { slug: ["does-not-exist"] };
    await expect(mountSuspended(TagsSlugPage)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
