<script setup lang="ts">
defineProps<{
  pageTitle: string;
  pageDesc?: string;
}>();
</script>

<template>
  <main id="main-content" class="app-layout pb-4">
    <h1 class="text-2xl font-semibold sm:text-3xl">{{ pageTitle }}</h1>
    <p class="mt-2 mb-6 italic">{{ pageDesc }}</p>
    <slot />
  </main>
</template>
