import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "~/composables/useTheme";

type ThemeResult = ReturnType<typeof useTheme>;

async function setup(): Promise<ThemeResult> {
  let result!: ThemeResult;
  await mountSuspended({
    setup() {
      result = useTheme();
      return () => null;
    },
  });
  return result;
}

describe("useTheme", () => {
  beforeEach(async () => {
    // useState("theme") is shared module-level state; reset before each test.
    localStorage.clear();
    const { apply } = await setup();
    apply("light", false);
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.theme;
  });

  it("defaults to the light theme", async () => {
    const { theme } = await setup();
    expect(theme.value).toBe("light");
  });

  it("apply() sets the theme and reflects it onto <html>", async () => {
    const { theme, apply } = await setup();
    apply("dark");
    expect(theme.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists to localStorage by default", async () => {
    const { apply } = await setup();
    apply("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("does not persist when persist is false", async () => {
    const { apply } = await setup();
    apply("dark", false);
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("toggle() flips between light and dark", async () => {
    const { theme, toggle } = await setup();
    expect(theme.value).toBe("light");
    toggle();
    expect(theme.value).toBe("dark");
    toggle();
    expect(theme.value).toBe("light");
  });

  it("shares state across instances", async () => {
    const first = await setup();
    const second = await setup();
    first.apply("dark");
    expect(second.theme.value).toBe("dark");
  });
});
