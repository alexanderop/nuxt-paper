<script setup lang="ts">
const props = defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  class?: string | null;
  style?: unknown;
}>();
const label = computed(() => props.filename ?? props.meta?.match(/file=["']([^"']+)["']/)?.[1]);
</script>

<template>
  <pre :class="[$props.class, { 'mt-8': label }]" :style="[style, { '--file-name-offset': '-0.75rem' }]"><slot /><span v-if="label" style="color: var(--foreground); background: var(--background)" class="absolute py-1 text-foreground text-xs font-medium leading-4 pl-4 pr-2 before:inline-block before:size-1 before:bg-green-500 before:rounded-full before:absolute before:top-[45%] before:left-2 left-2 top-(--file-name-offset) border rounded-md bg-background">{{ label }}</span></pre>
</template>
