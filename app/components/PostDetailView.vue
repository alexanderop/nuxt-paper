<script setup lang="ts">
import type { Ref } from "vue";

const props = defineProps<{ path: string }>();

const { data } = await useAsyncData(`post-${props.path}`, () =>
  queryCollection("posts").path(props.path).first()
);

if (!data.value || !postFilter(data.value)) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const post = data as Ref<NonNullable<typeof data.value>>;

const { prevPost, nextPost } = await useAdjacentPosts(() => props.path);

const tags = computed(
  () =>
    post.value.tags?.map(tag => ({ tag: slugifyStr(tag), tagName: tag })) ?? []
);

usePostSeo(post.value);
useCodeCopyButtons();
</script>

<template>
  <ReadingProgressBar />

  <PostBackButton />

  <main
    id="main-content"
    :class="['app-layout', { 'mt-8': !FEATURES.showBackButton }]"
  >
    <h1 class="text-accent inline-block text-2xl font-bold sm:text-3xl">
      {{ post.title }}
    </h1>

    <div class="my-2 flex items-center gap-2">
      <DatetimeDisplay :post="post" size="lg" />
      <span
        aria-hidden="true"
        :class="[
          'text-muted-foreground max-sm:hidden',
          { hidden: !FEATURES.editPost.enabled || post.hideEditPost },
        ]"
      >
        |
      </span>
      <PostEditLink :post="post" class="max-sm:hidden" />
    </div>

    <article id="article" class="app-prose max-w-app mt-8 w-full">
      <ContentRenderer :value="post" />
    </article>

    <hr class="my-8 border-dashed" />

    <PostEditLink class="sm:hidden" :post="post" />

    <PostBackToTop />

    <ul class="mt-4 mb-8 flex flex-wrap gap-4 sm:my-8">
      <TagPill
        v-for="{ tag, tagName } in tags"
        :key="tag"
        :tag="tag"
        :tag-name="tagName"
        size="sm"
      />
    </ul>

    <PostShareLinks />

    <hr class="my-8 border-dashed" />

    <PostAdjacentNav :prev-post="prevPost" :next-post="nextPost" />
  </main>
</template>
