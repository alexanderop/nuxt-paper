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

const { lastPage, pagePosts, prevUrl, nextUrl } = usePagination({
  items: tagPosts,
  page,
  baseUrl: () => `/tags/${tag.value}`,
});

if (
  tagPosts.value.length === 0 ||
  page.value < 1 ||
  page.value > lastPage.value
) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

usePageSeo({
  title: `${t.pages.tagTitle}: ${tagName.value} | ${SITE.title}`,
});
useRememberBackUrl();
</script>

<template>
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
</template>
