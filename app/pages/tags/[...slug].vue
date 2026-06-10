<script setup lang="ts">
const route = useRoute();

const segments = computed(() => {
  const slug = route.params.slug;
  return (Array.isArray(slug) ? slug : [slug]).filter(Boolean) as string[];
});

const tag = computed(() => segments.value[0] ?? "");
const page = computed(() =>
  segments.value[1] ? Number(segments.value[1]) : 1
);

if (
  segments.value.length > 2 ||
  (segments.value[1] && !/^\d+$/.test(segments.value[1]))
) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const { data: posts } = await useAllPosts();

const tagPosts = computed(() =>
  posts.value.filter(post => slugifyAll(post.tags).includes(tag.value))
);

const tagName = computed(
  () =>
    tagPosts.value
      .flatMap(post => post.tags)
      .find(name => slugifyStr(name) === tag.value) ?? tag.value
);

const lastPage = computed(() =>
  Math.max(1, Math.ceil(tagPosts.value.length / POSTS.perPage))
);

if (
  tagPosts.value.length === 0 ||
  page.value < 1 ||
  page.value > lastPage.value
) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const pagePosts = computed(() =>
  tagPosts.value.slice(
    (page.value - 1) * POSTS.perPage,
    page.value * POSTS.perPage
  )
);

const prevUrl = computed(() =>
  page.value > 1
    ? page.value === 2
      ? `/tags/${tag.value}`
      : `/tags/${tag.value}/${page.value - 1}`
    : null
);
const nextUrl = computed(() =>
  page.value < lastPage.value ? `/tags/${tag.value}/${page.value + 1}` : null
);

usePageSeo({
  title: `${t.pages.tagTitle}: ${tagName.value} | ${SITE.title}`,
});
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />

    <BreadcrumbNav />

    <PageMain
      :page-title="`${t.pages.tagTitle}: ${tagName}`"
      :page-desc="`${t.pages.tagDesc} “${tagName}”.`"
    >
      <ul>
        <PostCard v-for="post in pagePosts" :key="post.path" :post="post" />
      </ul>
    </PageMain>

    <PaginationNav
      :current-page="page"
      :last-page="lastPage"
      :prev-url="prevUrl"
      :next-url="nextUrl"
    />

    <AppFooter :no-margin-top="lastPage > 1" />
  </div>
</template>
