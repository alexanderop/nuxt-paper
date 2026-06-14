import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import PostShareLinks from "~/components/PostShareLinks.vue";

mockNuxtImport("useRoute", () => () => ({ path: "/posts/my-post" }));

describe("PostShareLinks", () => {
  it("renders a share intro and one link per share platform", async () => {
    const wrapper = await mountSuspended(PostShareLinks);
    expect(wrapper.text()).toContain("Share this post:");
    expect(wrapper.findAll("a").length).toBe(6);
  });

  it("appends the encoded page url to each share href", async () => {
    const wrapper = await mountSuspended(PostShareLinks);
    const hrefs = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(
      hrefs.some(href => href?.includes("/nuxt-paper/posts/my-post"))
    ).toBe(true);
    expect(
      hrefs.some(href => href?.startsWith("https://wa.me/?text="))
    ).toBe(true);
  });
});
