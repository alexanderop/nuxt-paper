<script setup lang="ts">
defineProps<{ id?: string }>();
const articleHeadingLinks = inject("articleHeadingLinks", false);
</script>

<template>
  <h6 :id="id" class="group"><slot /><a v-if="id && articleHeadingLinks" data-pagefind-ignore :href="`#${id}`" class="heading-link ms-2 text-foreground! no-underline! opacity-75 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100" :aria-label="`Link to this section`">#</a></h6>
</template>
