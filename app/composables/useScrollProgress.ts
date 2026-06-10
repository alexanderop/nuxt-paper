/**
 * Tracks how far the page is scrolled, as a 0–100 percentage.
 * rAF-throttled so the scroll handler stays cheap.
 */
export function useScrollProgress() {
  const progress = ref(0);

  let ticking = false;

  function update() {
    const root = document.documentElement;
    const total = root.scrollHeight - root.clientHeight;
    progress.value = total > 0 ? (root.scrollTop / total) * 100 : 0;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  onMounted(() => {
    update();
    document.addEventListener("scroll", onScroll, { passive: true });
  });

  onUnmounted(() => document.removeEventListener("scroll", onScroll));

  return { progress };
}
