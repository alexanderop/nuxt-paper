import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import TagPill from "~/components/TagPill.vue";

describe("TagPill", () => {
  it("renders the tag name and links to the tag page", async () => {
    const wrapper = await mountSuspended(TagPill, {
      props: { tag: "e2e-testing", tagName: "E2E Testing" },
    });
    expect(wrapper.text()).toContain("E2E Testing");
    expect(wrapper.find("a").attributes("href")).toBe("/tags/e2e-testing");
  });

  it("applies the small size variant", async () => {
    const wrapper = await mountSuspended(TagPill, {
      props: { tag: "vue", tagName: "Vue", size: "sm" },
    });
    expect(wrapper.find("a").classes()).toContain("text-sm");
  });
});
