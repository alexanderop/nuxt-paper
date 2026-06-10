<script setup lang="ts">
const props = defineProps<{
  post: {
    /** id looks like "posts/posts/my-post.md" (collection/source path) */
    id: string;
    hideEditPost?: boolean;
  };
}>();

const filePath = computed(
  () => `content/${props.post.id.split("/").slice(1).join("/")}`
);

const href = computed(() =>
  FEATURES.editPost.enabled ? `${FEATURES.editPost.url}${filePath.value}` : ""
);

const showEditPost = computed(
  () => FEATURES.editPost.enabled && !props.post.hideEditPost && href.value !== ""
);
</script>

<template>
  <a
    v-if="showEditPost"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="hover:text-accent text-muted-foreground flex justify-baseline gap-1.5"
  >
    <IconEdit class="inline-block" />
    <span>{{ t.post.editPage }}</span>
  </a>
</template>
