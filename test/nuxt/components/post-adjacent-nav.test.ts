import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import PostAdjacentNav from "~/components/PostAdjacentNav.vue";

const prevPost = { path: "/posts/older", title: "Older Post" };
const nextPost = { path: "/posts/newer", title: "Newer Post" };

describe("PostAdjacentNav", () => {
  it("renders both prev and next links when provided", async () => {
    const wrapper = await mountSuspended(PostAdjacentNav, {
      props: { prevPost, nextPost },
    });
    const links = wrapper.findAll("a");
    expect(links).toHaveLength(2);
    expect(wrapper.text()).toContain("Older Post");
    expect(wrapper.text()).toContain("Newer Post");
    expect(links[0]!.attributes("href")).toBe("/posts/older");
    expect(links[1]!.attributes("href")).toBe("/posts/newer");
  });

  it("renders only the previous link when next is missing", async () => {
    const wrapper = await mountSuspended(PostAdjacentNav, {
      props: { prevPost, nextPost: null },
    });
    const links = wrapper.findAll("a");
    expect(links).toHaveLength(1);
    expect(wrapper.text()).toContain("Previous Post");
    expect(wrapper.text()).not.toContain("Next Post");
  });

  it("renders nothing clickable when both are missing", async () => {
    const wrapper = await mountSuspended(PostAdjacentNav, {
      props: { prevPost: null, nextPost: null },
    });
    expect(wrapper.findAll("a")).toHaveLength(0);
  });
});
