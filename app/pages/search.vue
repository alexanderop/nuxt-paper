<script setup lang="ts">
import MiniSearch from "minisearch";

if (!FEATURES.search) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

usePageSeo({ title: `${t.pages.searchTitle} | ${SITE.title}` });

const route = useRoute();
const router = useRouter();

const { data: sections } = await useAsyncData("search-sections", () =>
  queryCollectionSearchSections("posts")
);

const query = ref(String(route.query.q ?? ""));

const miniSearch = computed(() => {
  const search = new MiniSearch({
    fields: ["title", "content"],
    storeFields: ["title", "content", "titles", "id"],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 2 },
    },
  });
  search.addAll(sections.value ?? []);
  return search;
});

const results = computed(() => {
  if (!query.value.trim()) return [];
  return miniSearch.value.search(query.value).slice(0, 20);
});

function excerpt(content: string) {
  if (!content) return "";
  const lower = content.toLowerCase();
  const term = query.value.trim().toLowerCase().split(/\s+/)[0] ?? "";
  const index = lower.indexOf(term);
  const start = Math.max(0, index - 60);
  const end = Math.min(content.length, (index < 0 ? 0 : index) + 160);
  return (
    (start > 0 ? "…" : "") + content.slice(start, end).trim() + (end < content.length ? "…" : "")
  );
}

function resultPath(id: string) {
  // Section ids look like "/posts/my-post#heading-id"
  return id;
}

// Keep the ?q= param in sync so searches are shareable.
watch(query, value => {
  router.replace({ query: value.trim() ? { q: value } : {} });
  const backUrl = value.trim() ? `${route.path}?q=${encodeURIComponent(value)}` : route.path;
  sessionStorage.setItem("backUrl", backUrl);
});
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />

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
          {{ results.length }} result{{ results.length === 1 ? "" : "s" }} for
          “{{ query }}”
        </p>

        <ul class="mt-2">
          <li
            v-for="result in results"
            :key="result.id"
            class="border-border border-b py-4 last:border-b-0"
          >
            <NuxtLink
              :to="resultPath(result.id)"
              class="text-accent font-medium decoration-dashed underline-offset-4 hover:underline"
            >
              {{ result.titles?.filter(Boolean).join(" › ") || result.title }}
              <template v-if="result.titles?.filter(Boolean).length && result.title">
                › {{ result.title }}
              </template>
            </NuxtLink>
            <p class="text-foreground/80 mt-1 text-sm">
              {{ excerpt(result.content) }}
            </p>
          </li>
        </ul>

        <p
          v-if="query.trim() && results.length === 0"
          class="text-muted-foreground mt-4"
        >
          {{ t.a11y.noResults }}
        </p>
      </div>
    </PageMain>

    <AppFooter />
  </div>
</template>
