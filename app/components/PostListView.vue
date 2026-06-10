<script setup lang="ts">
const props = defineProps<{ page: number }>();

usePageSeo({ title: `${t.pages.postsTitle} | ${SITE.title}` });
useRememberBackUrl();

const { data: posts } = await useAllPosts();

const { lastPage, pagePosts, prevUrl, nextUrl } = usePagination({
  items: posts,
  page: () => props.page,
  baseUrl: "/posts",
});

if (props.page < 1 || props.page > lastPage.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.postsTitle" :page-desc="t.pages.postsDesc">
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
