<script setup lang="ts">
const backUrl = useBackUrl();
</script>

<template>
  <div v-if="FEATURES.showBackButton" class="app-layout flex items-center justify-start">
    <LinkButton
      id="back-button"
      :href="backUrl"
      class="focus-outline hover:text-foreground/75 -ms-2 mt-8 mb-2"
    >
      <IconChevronLeft class="inline-block size-6 rtl:rotate-180" />
      <span>{{ t.post.goBack }}</span>
    </LinkButton>
  </div>
</template>
