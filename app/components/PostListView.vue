<script setup lang="ts">
const props = defineProps<{ page: number }>();

usePageSeo({ title: `${t.pages.postsTitle} | ${SITE.title}` });

const { data: posts } = await useAllPosts();

const lastPage = computed(() =>
  Math.max(1, Math.ceil(posts.value.length / POSTS.perPage))
);

if (props.page < 1 || props.page > lastPage.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const pagePosts = computed(() =>
  posts.value.slice((props.page - 1) * POSTS.perPage, props.page * POSTS.perPage)
);

const prevUrl = computed(() =>
  props.page > 1 ? (props.page === 2 ? "/posts" : `/posts/${props.page - 1}`) : null
);
const nextUrl = computed(() =>
  props.page < lastPage.value ? `/posts/${props.page + 1}` : null
);
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />

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

    <AppFooter :no-margin-top="lastPage > 1" />
  </div>
</template>
