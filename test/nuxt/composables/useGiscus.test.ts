import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { GISCUS } from "#shared/utils/site";
import { useGiscus } from "~/composables/useGiscus";

const { routeMock } = vi.hoisted(() => ({
  routeMock: { path: "/posts/hello" },
}));

mockNuxtImport("useRoute", () => () => routeMock);

// Snapshot the (default-empty) config so we can configure it per test and
// restore the source values afterwards without editing the source file.
const original = { ...GISCUS };

function configure() {
  Object.assign(GISCUS, {
    repo: "owner/repo",
    repoId: "R_1",
    category: "General",
    categoryId: "C_1",
  });
}

async function mountGiscus() {
  const container = ref<HTMLElement | null>(null);
  const el = document.createElement("div");
  document.body.appendChild(el);
  container.value = el;

  await mountSuspended({
    setup() {
      useGiscus(container);
      return () => null;
    },
  });
  return el;
}

describe("useGiscus", () => {
  beforeEach(() => {
    routeMock.path = "/posts/hello";
    Object.assign(GISCUS, original);
  });

  afterEach(() => {
    Object.assign(GISCUS, original);
    document.querySelectorAll("div").forEach(d => {
      if (d.querySelector('script[src*="giscus"]')) d.remove();
    });
  });

  it("stays inert (no script injected) while giscus is unconfigured", async () => {
    const el = await mountGiscus();
    expect(el.querySelector("script")).toBeNull();
  });

  it("injects the giscus client script when fully configured", async () => {
    configure();
    const el = await mountGiscus();
    const script = el.querySelector<HTMLScriptElement>("script");
    expect(script).not.toBeNull();
    expect(script?.src).toBe("https://giscus.app/client.js");
    expect(script?.async).toBe(true);
  });

  it("passes the configured repo data attributes to the script", async () => {
    configure();
    const el = await mountGiscus();
    const script = el.querySelector("script")!;
    expect(script.getAttribute("data-repo")).toBe("owner/repo");
    expect(script.getAttribute("data-repo-id")).toBe("R_1");
    expect(script.getAttribute("data-category")).toBe("General");
    expect(script.getAttribute("data-category-id")).toBe("C_1");
  });

  it("renders the light theme to match the default site theme", async () => {
    configure();
    const el = await mountGiscus();
    expect(el.querySelector("script")?.getAttribute("data-theme")).toBe(
      "light"
    );
  });
});
