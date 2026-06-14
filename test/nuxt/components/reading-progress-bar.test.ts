import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import ReadingProgressBar from "~/components/ReadingProgressBar.vue";

describe("ReadingProgressBar", () => {
  it("renders a progress bar starting at zero width", async () => {
    const wrapper = await mountSuspended(ReadingProgressBar);
    const bar = wrapper.find(".progress-bar");
    expect(bar.exists()).toBe(true);
    expect(bar.attributes("style")).toContain("width: 0%");
  });
});
