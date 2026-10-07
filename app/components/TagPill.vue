<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tag: string;
    tagName: string;
    size?: "sm" | "lg";
  }>(),
  { size: "lg" }
);
const transitionName = computed(() => `tag-${toTransitionName(props.tag)}`);
</script>

<template>
  <li>
    <component :is="'style'">{{ cardTransitionStyles(transitionName) }}</component>
    <NuxtLink
      :to="`/tags/${tag}`"
      :style="{ viewTransitionName: transitionName }"
      :class="[
        'flex items-center gap-0.5',
        'border-foreground border-b-2 border-dashed',
        'hover:border-accent hover:text-accent hover:-mt-0.5',
        'focus-visible:text-accent focus-visible:border-none',
        size === 'sm' ? 'text-sm' : 'text-lg',
      ]"
    >
      <IconHash
        :class="['opacity-80', size === 'lg' ? 'size-5' : 'size-4']"
      />
      {{ tagName }}
    </NuxtLink>
  </li>
</template>
