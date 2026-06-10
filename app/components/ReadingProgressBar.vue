<script setup lang="ts">
const { progress } = useScrollProgress();
</script>

<template>
  <div class="progress-container bg-background fixed top-0 z-10 h-1 w-full">
    <div class="progress-bar bg-accent h-1" :style="{ width: `${progress}%` }" />
  </div>
</template>
