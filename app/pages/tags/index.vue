<script setup lang="ts">
usePageSeo({ title: `${t.pages.tagsTitle} | ${SITE.title}` });

const { data: posts } = await useAllPosts();
const tags = computed(() => getUniqueTags(posts.value));
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />

    <BreadcrumbNav />

    <PageMain :page-title="t.pages.tagsTitle" :page-desc="t.pages.tagsDesc">
      <ul class="flex flex-wrap gap-6">
        <TagPill
          v-for="{ tag, tagName } in tags"
          :key="tag"
          :tag="tag"
          :tag-name="tagName"
        />
      </ul>
    </PageMain>

    <AppFooter />
  </div>
</template>
