import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ArchivesPage from "~/pages/archives.vue";
import { makePost } from "./_helpers";

const { posts } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { posts: ref([]) };
});

mockNuxtImport("useAllPosts", () => () => ({ data: posts }));

posts.value = [
  makePost({ path: "/posts/y2024-jan", title: "Twenty24 Jan", pubDatetime: "2024-01-10T00:00:00.000Z" }),
  makePost({ path: "/posts/y2024-mar", title: "Twenty24 Mar", pubDatetime: "2024-03-20T00:00:00.000Z" }),
  makePost({ path: "/posts/y2023-dec", title: "Twenty23 Dec", pubDatetime: "2023-12-05T00:00:00.000Z" }),
];

describe("archives page", () => {
  it("renders the page title and description", async () => {
    const wrapper = await mountSuspended(ArchivesPage);
    expect(wrapper.find("h1").text()).toBe("Archives");
    expect(wrapper.text()).toContain("All the articles I've archived.");
  });

  it("groups posts by year, newest first", async () => {
    const wrapper = await mountSuspended(ArchivesPage);
    const text = wrapper.text();
    expect(text).toContain("2024");
    expect(text).toContain("2023");
    expect(text.indexOf("2024")).toBeLessThan(text.indexOf("2023"));
  });

  it("groups posts by month name", async () => {
    const wrapper = await mountSuspended(ArchivesPage);
    const text = wrapper.text();
    expect(text).toContain("January");
    expect(text).toContain("March");
    expect(text).toContain("December");
  });

  it("renders a card for each post", async () => {
    const wrapper = await mountSuspended(ArchivesPage);
    const text = wrapper.text();
    expect(text).toContain("Twenty24 Jan");
    expect(text).toContain("Twenty24 Mar");
    expect(text).toContain("Twenty23 Dec");
  });
});
