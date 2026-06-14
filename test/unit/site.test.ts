import { describe, expect, it } from "vitest";
import {
  FEATURES,
  POSTS,
  SHARE_LINKS,
  SITE,
  SOCIALS,
  type SocialLink,
} from "#shared/utils/site";

describe("SITE", () => {
  it("has a non-empty https url", () => {
    expect(SITE.url).toMatch(/^https:\/\/.+/);
  });

  it("has a non-empty title and timezone", () => {
    expect(SITE.title.length).toBeGreaterThan(0);
    expect(SITE.timezone.length).toBeGreaterThan(0);
  });
});

describe("POSTS", () => {
  it("paginates a positive number of posts per page", () => {
    expect(POSTS.perPage).toBeGreaterThan(0);
    expect(POSTS.perIndex).toBeGreaterThan(0);
  });

  it("uses a non-negative scheduled post margin", () => {
    expect(POSTS.scheduledPostMargin).toBeGreaterThanOrEqual(0);
  });
});

describe("FEATURES", () => {
  it("exposes boolean toggles", () => {
    expect(typeof FEATURES.search).toBe("boolean");
    expect(typeof FEATURES.giscus).toBe("boolean");
    expect(typeof FEATURES.editPost.enabled).toBe("boolean");
  });
});

describe.each([
  ["SOCIALS", SOCIALS],
  ["SHARE_LINKS", SHARE_LINKS],
])("%s", (_label, links: SocialLink[]) => {
  it("is a non-empty list", () => {
    expect(links.length).toBeGreaterThan(0);
  });

  it("every entry has a non-empty name and url", () => {
    for (const link of links) {
      expect(link.name.length).toBeGreaterThan(0);
      expect(link.url.length).toBeGreaterThan(0);
    }
  });
});
