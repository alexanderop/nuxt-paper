import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollProgress } from "~/composables/useScrollProgress";

type ScrollResult = ReturnType<typeof useScrollProgress>;

async function setup(): Promise<{ result: ScrollResult; unmount: () => void }> {
  let result!: ScrollResult;
  const wrapper = await mountSuspended({
    setup() {
      result = useScrollProgress();
      return () => null;
    },
  });
  return { result, unmount: () => wrapper.unmount() };
}

function stubMetrics(scrollTop: number, scrollHeight: number, clientHeight: number) {
  const root = document.documentElement;
  vi.spyOn(root, "scrollHeight", "get").mockReturnValue(scrollHeight);
  vi.spyOn(root, "clientHeight", "get").mockReturnValue(clientHeight);
  vi.spyOn(root, "scrollTop", "get").mockReturnValue(scrollTop);
}

describe("useScrollProgress", () => {
  beforeEach(() => {
    // rAF runs the throttled update synchronously enough for assertions.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("starts at 0 and computes progress on mount", async () => {
    stubMetrics(0, 2000, 1000);
    const { result } = await setup();
    expect(result.progress.value).toBe(0);
  });

  it("reports 0 when the page is not scrollable", async () => {
    stubMetrics(0, 1000, 1000);
    const { result } = await setup();
    expect(result.progress.value).toBe(0);
  });

  it("updates progress on scroll", async () => {
    stubMetrics(0, 2000, 1000);
    const { result } = await setup();
    // Scrolled half of the 1000px scrollable range.
    stubMetrics(500, 2000, 1000);
    document.dispatchEvent(new Event("scroll"));
    expect(result.progress.value).toBe(50);
  });

  it("removes its scroll listener on unmount", async () => {
    stubMetrics(0, 2000, 1000);
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = await setup();
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
