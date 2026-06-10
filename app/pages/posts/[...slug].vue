<script setup lang="ts">
const route = useRoute();

const segments = computed(() => {
  const slug = route.params.slug;
  return (Array.isArray(slug) ? slug : [slug]).filter(Boolean) as string[];
});

// /posts and /posts/2 are paginated list pages; everything else is a post.
const isList = computed(
  () =>
    segments.value.length === 0 ||
    (segments.value.length === 1 && /^\d+$/.test(segments.value[0]!))
);

const page = computed(() =>
  segments.value.length === 0 ? 1 : Number(segments.value[0])
);

const postPath = computed(() => `/posts/${segments.value.join("/")}`);
</script>

<template>
  <PostListView v-if="isList" :page="page" />
  <PostDetailView v-else :path="postPath" />
</template>
