<script setup lang="ts">
import type { PostItem } from "~/utils/posts";

const props = withDefaults(
  defineProps<{
    post: PostItem;
    variant?: "h2" | "h3";
  }>(),
  { variant: "h2" }
);
const transitionName = computed(() => toTransitionName(props.post.path));
</script>

<template>
  <li class="my-6">
    <component :is="'style'">{{ cardTransitionStyles(transitionName) }}</component>
    <NuxtLink
      :to="post.path"
      class="text-accent inline-block text-lg font-medium decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      <component :is="variant" :style="{ viewTransitionName: transitionName }">{{ post.title }}</component>
    </NuxtLink>
    <DatetimeDisplay :post="post" />
    <p>{{ post.description }}</p>
  </li>
</template>
