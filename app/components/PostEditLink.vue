<script setup lang="ts">
const props = defineProps<{
  hideEditPost?: boolean;
  /** Path of the source file relative to the content directory */
  filePath?: string;
}>();

const href = computed(() =>
  FEATURES.editPost.enabled && props.filePath
    ? `${FEATURES.editPost.url}${props.filePath}`
    : ""
);

const showEditPost = computed(
  () => FEATURES.editPost.enabled && !props.hideEditPost && href.value !== ""
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
