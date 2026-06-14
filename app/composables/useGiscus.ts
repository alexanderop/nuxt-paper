import type { Ref } from "vue";

const isConfigured = () =>
  Boolean(GISCUS.repo && GISCUS.repoId && GISCUS.category && GISCUS.categoryId);

/**
 * Loads the giscus (GitHub Discussions) comments embed into `container` and
 * keeps its theme in sync with the site theme. DOM-based because giscus injects
 * an <iframe>. No-op until GISCUS is fully configured, so it stays inert while
 * the feature is only scaffolded.
 */
export function useGiscus(container: Ref<HTMLElement | null>) {
  const { theme } = useTheme();
  const route = useRoute();

  const giscusTheme = () => (theme.value === "dark" ? "dark" : "light");

  function render() {
    const el = container.value;
    if (!el) return;
    el.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    const attrs: Record<string, string> = {
      "data-repo": GISCUS.repo,
      "data-repo-id": GISCUS.repoId,
      "data-category": GISCUS.category,
      "data-category-id": GISCUS.categoryId,
      "data-mapping": GISCUS.mapping,
      "data-strict": "0",
      "data-reactions-enabled": GISCUS.reactionsEnabled ? "1" : "0",
      "data-emit-metadata": "0",
      "data-input-position": GISCUS.inputPosition,
      "data-theme": giscusTheme(),
      "data-lang": SITE.lang,
    };
    for (const [key, value] of Object.entries(attrs)) {
      script.setAttribute(key, value);
    }

    el.appendChild(script);
  }

  // giscus exposes a postMessage API to live-update the theme without a reload.
  function syncTheme() {
    const iframe = container.value?.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme() } } },
      "https://giscus.app"
    );
  }

  onMounted(() => {
    if (!isConfigured()) return;
    render();
    watch(theme, syncTheme);
    // SPA navigation between posts reuses this component, so re-render per path.
    watch(() => route.path, render);
  });
}
