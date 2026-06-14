<script setup lang="ts">
const container = ref<HTMLElement | null>(null);
useGiscus(container);
</script>

<template>
  <section ref="container" class="giscus mt-8 w-full" aria-label="Comments" />
</template>
