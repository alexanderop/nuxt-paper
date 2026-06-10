const BACK_URL_KEY = "backUrl";

/**
 * The URL the post "Go back" button should navigate to.
 */
export function useBackUrl() {
  const backUrl = ref("/");

  onMounted(() => {
    backUrl.value = sessionStorage.getItem(BACK_URL_KEY) ?? "/";
  });

  return backUrl;
}

/**
 * Remembers the current page as the "Go back" target for post detail pages.
 * Tracks URL changes while the page is open (e.g. a search query param).
 */
export function useRememberBackUrl() {
  const route = useRoute();

  onMounted(() => {
    watchEffect(() => {
      const backUrl = FEATURES.showBackButton ? route.fullPath : "/";
      sessionStorage.setItem(BACK_URL_KEY, backUrl);
    });
  });
}
