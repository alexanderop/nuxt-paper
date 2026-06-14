import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import AppFooter from "~/components/AppFooter.vue";

describe("AppFooter", () => {
  it("renders copyright text with the current year", async () => {
    const wrapper = await mountSuspended(AppFooter);
    const year = new Date().getFullYear().toString();
    expect(wrapper.text()).toContain("Copyright");
    expect(wrapper.text()).toContain(year);
    expect(wrapper.text()).toContain("All rights reserved.");
  });

  it("renders the social links", async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.findAll("a").length).toBeGreaterThan(0);
  });
});
