<script setup lang="ts">
if (!FEATURES.search) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

usePageSeo({ title: `${t.pages.searchTitle} | ${SITE.title}` });
useRememberBackUrl();

const route = useRoute();
const router = useRouter();

const { data: sections } = await useAsyncData("search-sections", () =>
  queryCollectionSearchSections("posts")
);

const { query, results } = useSearch(() => sections.value ?? []);
query.value = String(route.query.q ?? "");

// Keep the ?q= param in sync so searches are shareable.
watch(query, value => {
  router.replace({ query: value.trim() ? { q: value } : {} });
});

const resultsSummary = computed(() =>
  tplStr(
    results.value.length === 1
      ? t.search.oneResultFound
      : t.search.manyResultsFound,
    { count: String(results.value.length), query: query.value }
  )
);
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.searchTitle" :page-desc="t.pages.searchDesc">
    <div id="search-container">
      <label class="relative block">
        <span class="sr-only">{{ t.pages.searchTitle }}</span>
        <IconSearch
          class="text-muted-foreground absolute top-1/2 left-3 size-5 -translate-y-1/2"
        />
        <input
          v-model="query"
          type="search"
          :placeholder="t.a11y.searchPlaceholder"
          class="border-border bg-background placeholder:text-muted-foreground focus-visible:outline-accent block w-full rounded-md border py-2 ps-10 pe-3 focus-visible:outline-1"
          autocomplete="off"
          autofocus
        />
      </label>

      <p v-if="query.trim()" class="text-muted-foreground mt-4 text-sm">
        {{ resultsSummary }}
      </p>

      <ul class="mt-2">
        <SearchResultItem
          v-for="result in results"
          :key="result.id"
          :result="result"
          :query="query"
        />
      </ul>

      <p
        v-if="query.trim() && results.length === 0"
        class="text-muted-foreground mt-4"
      >
        {{ t.a11y.noResults }}
      </p>
    </div>
  </PageMain>
</template>
