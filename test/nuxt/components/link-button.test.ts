import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import LinkButton from "~/components/LinkButton.vue";

describe("LinkButton", () => {
  it("renders an internal NuxtLink for relative hrefs", async () => {
    const wrapper = await mountSuspended(LinkButton, {
      props: { href: "/posts" },
      slots: { default: () => "Posts" },
    });
    const link = wrapper.find("a");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/posts");
    expect(link.text()).toBe("Posts");
  });

  it("renders a plain anchor for external http hrefs", async () => {
    const wrapper = await mountSuspended(LinkButton, {
      props: { href: "https://example.com" },
      slots: { default: () => "External" },
    });
    expect(wrapper.find("a").attributes("href")).toBe("https://example.com");
  });

  it("treats mailto links as external", async () => {
    const wrapper = await mountSuspended(LinkButton, {
      props: { href: "mailto:hi@example.com" },
      slots: { default: () => "Mail" },
    });
    expect(wrapper.find("a").attributes("href")).toBe("mailto:hi@example.com");
  });

  it("renders a disabled span without a link", async () => {
    const wrapper = await mountSuspended(LinkButton, {
      props: { href: "/posts", disabled: true },
      slots: { default: () => "Disabled" },
    });
    expect(wrapper.find("a").exists()).toBe(false);
    const span = wrapper.find("span");
    expect(span.attributes("aria-disabled")).toBe("true");
    expect(span.text()).toBe("Disabled");
  });

  it("treats explicitly external relative hrefs as anchors", async () => {
    const wrapper = await mountSuspended(LinkButton, {
      props: { href: "/feed.xml", external: true },
      slots: { default: () => "Feed" },
    });
    expect(wrapper.find("a").attributes("href")).toBe("/feed.xml");
  });
});
