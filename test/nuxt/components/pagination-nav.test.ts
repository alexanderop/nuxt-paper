import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import PaginationNav from "~/components/PaginationNav.vue";

describe("PaginationNav", () => {
  it("renders nothing when there is only one page", async () => {
    const wrapper = await mountSuspended(PaginationNav, {
      props: { currentPage: 1, lastPage: 1 },
    });
    expect(wrapper.find("nav").exists()).toBe(false);
  });

  it("shows the current and last page indicator", async () => {
    const wrapper = await mountSuspended(PaginationNav, {
      props: { currentPage: 2, lastPage: 3, prevUrl: "/posts", nextUrl: "/posts/3" },
    });
    expect(wrapper.find("nav").text()).toContain("2 / 3");
  });

  it("enables prev and next links when urls are provided", async () => {
    const wrapper = await mountSuspended(PaginationNav, {
      props: { currentPage: 2, lastPage: 3, prevUrl: "/posts", nextUrl: "/posts/3" },
    });
    const links = wrapper.findAll("a");
    expect(links[0]!.attributes("href")).toBe("/posts");
    expect(links[1]!.attributes("href")).toBe("/posts/3");
  });

  it("disables the prev control on the first page", async () => {
    const wrapper = await mountSuspended(PaginationNav, {
      props: { currentPage: 1, lastPage: 3, prevUrl: null, nextUrl: "/posts/2" },
    });
    const disabled = wrapper.find("[aria-disabled='true']");
    expect(disabled.exists()).toBe(true);
    expect(disabled.text()).toContain("Prev");
  });

  it("disables the next control on the last page", async () => {
    const wrapper = await mountSuspended(PaginationNav, {
      props: { currentPage: 3, lastPage: 3, prevUrl: "/posts/2", nextUrl: null },
    });
    const disabled = wrapper.find("[aria-disabled='true']");
    expect(disabled.exists()).toBe(true);
    expect(disabled.text()).toContain("Next");
  });
});
