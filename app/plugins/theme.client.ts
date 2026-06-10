export default defineNuxtPlugin(nuxtApp => {
  const { theme, apply } = useTheme();

  // The inline head script applied the stored theme before hydration; adopt
  // it as the initial state so toggling starts from the right value.
  theme.value =
    (document.documentElement.dataset.theme as Theme | undefined) ?? "light";

  nuxtApp.hook("app:mounted", () => {
    // Reflect once on mount so <meta name="theme-color"> gets filled.
    apply(theme.value, false);

    // Sync with OS-level dark/light preference changes.
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", ({ matches }) => {
        apply(matches ? "dark" : "light");
      });
  });
});
