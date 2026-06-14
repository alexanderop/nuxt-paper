import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DatetimeDisplay from "~/components/DatetimeDisplay.vue";

describe("DatetimeDisplay", () => {
  it("renders the formatted publish date inside a time element", async () => {
    const wrapper = await mountSuspended(DatetimeDisplay, {
      props: { post: { pubDatetime: "2024-03-05T00:00:00.000Z" } },
    });
    const time = wrapper.find("time");
    expect(time.exists()).toBe(true);
    expect(time.text()).toContain("Mar");
    expect(time.text()).toContain("2024");
    expect(time.attributes("datetime")).toBeTruthy();
  });

  it("shows the updated label when modified date is later", async () => {
    const wrapper = await mountSuspended(DatetimeDisplay, {
      props: {
        post: {
          pubDatetime: "2024-01-01T00:00:00.000Z",
          modDatetime: "2024-06-01T00:00:00.000Z",
        },
      },
    });
    expect(wrapper.text()).toContain("Updated");
  });

  it("omits the updated label when there is no later modified date", async () => {
    const wrapper = await mountSuspended(DatetimeDisplay, {
      props: { post: { pubDatetime: "2024-01-01T00:00:00.000Z" } },
    });
    expect(wrapper.text()).not.toContain("Updated");
  });
});
