export default defineNuxtPlugin(nuxtApp => {
  const { theme, apply } = useTheme();

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
