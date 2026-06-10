<script setup lang="ts">
import type { PostItem } from "~/utils/posts";

withDefaults(
  defineProps<{
    post: PostItem;
    variant?: "h2" | "h3";
  }>(),
  { variant: "h2" }
);
</script>

<template>
  <li class="my-6">
    <NuxtLink
      :to="post.path"
      class="text-accent inline-block text-lg font-medium decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      <component :is="variant">{{ post.title }}</component>
    </NuxtLink>
    <DatetimeDisplay
      :pub-datetime="post.pubDatetime"
      :mod-datetime="post.modDatetime"
      :timezone="post.timezone"
    />
    <p>{{ post.description }}</p>
  </li>
</template>
