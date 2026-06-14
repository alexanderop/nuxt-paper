import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BreadcrumbNav from "~/components/BreadcrumbNav.vue";

const route = { path: "/" };

mockNuxtImport("useRoute", () => () => route);

describe("BreadcrumbNav", () => {
  beforeEach(() => {
    route.path = "/";
    vi.clearAllMocks();
  });

  it("always renders a Home crumb", async () => {
    const wrapper = await mountSuspended(BreadcrumbNav);
    const home = wrapper.find("a");
    expect(home.text()).toBe("Home");
    expect(home.attributes("href")).toBe("/");
  });

  it("renders a known nav label and marks the last crumb as current", async () => {
    route.path = "/tags";
    const wrapper = await mountSuspended(BreadcrumbNav);
    const current = wrapper.find("[aria-current='page']");
    expect(current.exists()).toBe(true);
    expect(current.text()).toBe("Tags");
  });

  it("collapses the posts pagination into a single labelled crumb", async () => {
    route.path = "/posts/2";
    const wrapper = await mountSuspended(BreadcrumbNav);
    const current = wrapper.find("[aria-current='page']");
    expect(current.text()).toContain("Posts");
    expect(current.text()).toContain("page 2");
  });

  it("renders a tag name crumb for a tag page", async () => {
    route.path = "/tags/vue";
    const wrapper = await mountSuspended(BreadcrumbNav);
    const current = wrapper.find("[aria-current='page']");
    expect(current.text()).toContain("vue");
  });
});
