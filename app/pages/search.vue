<script setup lang="ts">
import { joinURL, withoutBase } from "ufo";


if (!FEATURES.search) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}
usePageSeo({ title: `${t.pages.searchTitle} | ${SITE.title}` });
const isDevelopment = import.meta.dev;
const baseURL = useRuntimeConfig().app.baseURL;
const searchError = ref("");
let dispose: (() => void) | undefined;
let unmounted = false;
onNuxtReady(async () => {
  const initialQuery = new URLSearchParams(window.location.search).get("q");
  let PagefindUI;
  try { ({ PagefindUI } = await import("@pagefind/default-ui")); }
  catch { searchError.value = "Search could not load. Please reload the page."; return; }
  if (unmounted) return;
  const updateQuery = (term: string) => {
    const url = new URL(window.location.href);
    if (term.trim()) url.searchParams.set("q", term);
    else url.searchParams.delete("q");
    history.replaceState(history.state, "", url.pathname + url.search);
    sessionStorage.setItem("backUrl", FEATURES.showBackButton ? withoutBase(url.pathname, baseURL) + url.search : "/");
    return term;
  };
  sessionStorage.setItem("backUrl", FEATURES.showBackButton ? withoutBase(window.location.pathname, baseURL) + window.location.search : "/");
  const search = new PagefindUI({
    element: "#pagefind-search",
    bundlePath: joinURL(baseURL, "pagefind/"),
    showImages: false,
    showSubResults: true,
    processResult: result => {
      result.url = result.url.replace(/\/(?=([?#]|$))/, "");
      for (const section of result.sub_results ?? []) section.url = section.url.replace(/\/(?=([?#]|$))/, "");
      return result;
    },
    processTerm: updateQuery,
  });
  if (initialQuery) search.triggerSearch(initialQuery);
  const input = document.querySelector<HTMLInputElement>(".pagefind-ui__search-input");
  const clear = document.querySelector<HTMLButtonElement>(".pagefind-ui__search-clear");
  const reset = () => { if (!input?.value.trim()) updateQuery(""); };
  const clearQuery = () => updateQuery("");
  input?.addEventListener("input", reset);
  clear?.addEventListener("click", clearQuery);
  const restore = () => {
    const term = new URLSearchParams(window.location.search).get("q");
    if (term) search.triggerSearch(term);
    else clear?.click();
  };
  window.addEventListener("popstate", restore);
  dispose = () => {
    window.removeEventListener("popstate", restore);
    input?.removeEventListener("input", reset);
    clear?.removeEventListener("click", clearQuery);
    search.destroy();
  };
});
onBeforeUnmount(() => { unmounted = true; dispose?.(); });
</script>

<template>
  <BreadcrumbNav />
  <PageMain :page-title="t.pages.searchTitle" :page-desc="t.pages.searchDesc">
    <p v-if="isDevelopment" class="bg-muted/75 mb-4 rounded p-4">
      Run <code>pnpm generate</code> once to create the search index for development.
    </p>
    <p v-if="searchError" role="alert">{{ searchError }}</p>
    <div id="pagefind-search" />
  </PageMain>
</template>

<style>
  #pagefind-search {
    --pagefind-ui-font: var(--font-app);
    --pagefind-ui-text: var(--foreground);
    --pagefind-ui-background: var(--background);
    --pagefind-ui-border: var(--border);
    --pagefind-ui-primary: var(--accent);
    --pagefind-ui-tag: var(--background);
    --pagefind-ui-border-radius: 0.375rem;
    --pagefind-ui-border-width: 1px;
    --pagefind-ui-image-border-radius: 8px;
    --pagefind-ui-image-box-ratio: 3 / 2;

    form::before {
      background-color: var(--foreground);
    }

    input {
      font-weight: 400;
      border: 1px solid var(--border);
    }

    input:focus-visible {
      outline: 1px solid var(--accent);
    }

    .pagefind-ui__result-title a {
      color: var(--accent);
      outline-offset: 1px;
      outline-color: var(--accent);
      text-decoration-style: dashed;
      text-underline-offset: 4px;
    }

    .pagefind-ui__result-title a:focus-visible,
    .pagefind-ui__search-clear:focus-visible {
      text-decoration-line: none;
      outline-width: 2px;
      outline-style: dashed;
    }

    .pagefind-ui__result:last-of-type {
      border-bottom: 0;
    }

    .pagefind-ui__result-nested .pagefind-ui__result-link:before {
      font-family: system-ui;
    }
  }
</style>
