<script setup lang="ts">
export interface AdjacentPost {
  path: string;
  title: string;
}

defineProps<{
  prevPost?: AdjacentPost | null;
  nextPost?: AdjacentPost | null;
}>();
</script>

<template>
  <div class="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
    <NuxtLink
      v-if="prevPost"
      :to="prevPost.path"
      class="flex w-full gap-1 hover:opacity-75"
    >
      <IconArrowLeft class="inline-block flex-none rtl:rotate-180" />
      <div>
        <span>{{ t.post.previousPost }}</span>
        <div class="text-accent/85 text-sm">{{ prevPost.title }}</div>
      </div>
    </NuxtLink>
    <NuxtLink
      v-if="nextPost"
      :to="nextPost.path"
      class="flex w-full justify-end gap-1 text-end hover:opacity-75 sm:col-start-2"
    >
      <div>
        <span>{{ t.post.nextPost }}</span>
        <div class="text-accent/85 text-sm">{{ nextPost.title }}</div>
      </div>
      <IconArrowRight class="inline-block flex-none rtl:rotate-180" />
    </NuxtLink>
  </div>
</template>
