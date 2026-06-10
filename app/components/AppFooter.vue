<script setup lang="ts">
withDefaults(defineProps<{ noMarginTop?: boolean }>(), {
  noMarginTop: false,
});

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer :class="['app-layout', { 'mt-auto': !noMarginTop }]">
    <div
      class="border-border flex flex-col items-center justify-between border-t py-6 sm:flex-row-reverse sm:py-4"
    >
      <SocialLinks />
      <div
        class="my-2 flex flex-col items-center whitespace-nowrap sm:flex-row"
      >
        <span>{{ t.footer.copyright }} &#169; {{ currentYear }}</span>
        <span class="hidden sm:inline">&nbsp;|&nbsp;</span>
        <span>{{ t.footer.allRightsReserved }}</span>
      </div>
    </div>
  </footer>
</template>
