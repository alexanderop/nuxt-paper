import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBackUrl, useRememberBackUrl } from "~/composables/useBackUrl";

const { routeMock } = vi.hoisted(() => ({
  routeMock: { fullPath: "/" },
}));

mockNuxtImport("useRoute", () => () => routeMock);

describe("useBackUrl", () => {
  beforeEach(() => {
    sessionStorage.clear();
    routeMock.fullPath = "/";
  });

  it("defaults to / when sessionStorage is empty", async () => {
    let backUrl!: ReturnType<typeof useBackUrl>;
    await mountSuspended({
      setup() {
        backUrl = useBackUrl();
        return () => null;
      },
    });
    expect(backUrl.value).toBe("/");
  });

  it("reads the stored back URL on mount", async () => {
    sessionStorage.setItem("backUrl", "/search?q=vue");
    let backUrl!: ReturnType<typeof useBackUrl>;
    await mountSuspended({
      setup() {
        backUrl = useBackUrl();
        return () => null;
      },
    });
    expect(backUrl.value).toBe("/search?q=vue");
  });
});

describe("useRememberBackUrl", () => {
  beforeEach(() => {
    sessionStorage.clear();
    routeMock.fullPath = "/";
  });

  it("stores the current route's fullPath on mount", async () => {
    routeMock.fullPath = "/posts/page/2";
    await mountSuspended({
      setup() {
        useRememberBackUrl();
        return () => null;
      },
    });
    expect(sessionStorage.getItem("backUrl")).toBe("/posts/page/2");
  });
});
