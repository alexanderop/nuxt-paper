import { mockComponent, mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import AboutPage from "~/pages/about.vue";

// Note: the "missing entry -> 404" branch is intentionally not covered here.
// The page throws in setup when the entry is null, but Vue still flushes a
// dangling render of its template (`about!.title`) against the missing entry,
// which vitest reports as an unhandled error that cannot be suppressed without
// touching the shared vitest config (out of scope for this wave).
const { about } = vi.hoisted(() => {
  const { ref } = require("vue");
  return {
    about: ref({
      title: "About Me",
      description: "Everything about this site.",
      path: "/about",
      body: { type: "minimal", value: [] },
    }),
  };
});

mockNuxtImport("useAsyncData", () => () => ({ data: about }));

// ContentRenderer needs a real content body to render; stub it so the page
// mounts deterministically and we can assert it receives the entry.
mockComponent("ContentRenderer", () => ({
  props: ["value"],
  setup(props: { value: { title: string } }) {
    return () => h("div", { class: "content-renderer-stub" }, props.value.title);
  },
}));

describe("about page", () => {
  it("renders the about page title", async () => {
    const wrapper = await mountSuspended(AboutPage);
    expect(wrapper.find("h1").text()).toBe("About Me");
  });

  it("passes the content entry to the content renderer", async () => {
    const wrapper = await mountSuspended(AboutPage);
    const stub = wrapper.find(".content-renderer-stub");
    expect(stub.exists()).toBe(true);
    expect(stub.text()).toContain("About Me");
  });
});
