<script setup lang="ts">
defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  class?: string | null;
  style?: unknown;
}>();
</script>

<template>
  <figure v-if="filename" class="my-6">
    <figcaption
      class="text-muted-foreground bg-muted border-border rounded-t border border-b-0 px-4 py-2 font-mono text-xs"
    >
      {{ filename }}
    </figcaption>
    <pre :class="[$props.class, 'mt-0! rounded-t-none']" :style="style"><slot /></pre>
  </figure>
  <pre v-else :class="$props.class" :style="style"><slot /></pre>
</template>
