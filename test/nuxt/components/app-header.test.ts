import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { reactive } from "vue";
import { beforeEach, describe, expect, it } from "vitest";
import AppHeader from "~/components/AppHeader.vue";

const route = reactive({ path: "/posts" });

mockNuxtImport("useRoute", () => () => route);

describe("AppHeader", () => {
  beforeEach(() => {
    route.path = "/posts";
  });

  it("renders the site title linking home and the primary nav items", async () => {
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.text()).toContain("NuxtPaper");
    const labels = wrapper.findAll("#menu-items a").map(a => a.text());
    expect(labels).toContain("Posts");
    expect(labels).toContain("Tags");
    expect(labels).toContain("About");
  });

  it("marks the active nav item based on the current route", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const active = wrapper.find("a.active-nav");
    expect(active.exists()).toBe(true);
    expect(active.text()).toBe("Posts");
  });

  it("toggles the mobile menu open and closed", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const button = wrapper.find("#menu-btn");
    expect(button.attributes("aria-expanded")).toBe("false");
    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("true");
    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("false");
  });

  it("renders a working theme toggle button", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const themeBtn = wrapper.find("#theme-btn");
    expect(themeBtn.exists()).toBe(true);
    await themeBtn.trigger("click");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("provides a skip-to-content link", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const skip = wrapper.find("#skip-to-content");
    expect(skip.attributes("href")).toBe("#main-content");
  });
});
