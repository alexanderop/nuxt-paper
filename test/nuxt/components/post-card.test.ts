import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import PostCard from "~/components/PostCard.vue";
import type { PostItem } from "~/utils/posts";

const post: PostItem = {
  path: "/posts/hello-world",
  title: "Hello World",
  description: "A friendly first post.",
  pubDatetime: "2024-01-01T00:00:00.000Z",
  tags: ["intro"],
};

describe("PostCard", () => {
  it("renders the title linking to the post path", async () => {
    const wrapper = await mountSuspended(PostCard, { props: { post } });
    const link = wrapper.find("a");
    expect(link.attributes("href")).toBe("/posts/hello-world");
    expect(link.text()).toContain("Hello World");
  });

  it("renders the description and date", async () => {
    const wrapper = await mountSuspended(PostCard, { props: { post } });
    expect(wrapper.text()).toContain("A friendly first post.");
    expect(wrapper.find("time").exists()).toBe(true);
  });

  it("uses an h2 title by default", async () => {
    const wrapper = await mountSuspended(PostCard, { props: { post } });
    expect(wrapper.find("h2").exists()).toBe(true);
    expect(wrapper.find("h3").exists()).toBe(false);
  });

  it("uses an h3 title for the h3 variant", async () => {
    const wrapper = await mountSuspended(PostCard, {
      props: { post, variant: "h3" },
    });
    expect(wrapper.find("h3").exists()).toBe(true);
    expect(wrapper.find("h2").exists()).toBe(false);
  });
});
