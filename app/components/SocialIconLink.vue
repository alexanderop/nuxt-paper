<script setup lang="ts">
defineProps<{
  name: string;
  href: string;
  title: string;
}>();
</script>

<template>
  <LinkButton :href="href" class="p-2 hover:rotate-6 sm:p-1" :title="title">
    <SocialIcon
      :name="name"
      class="inline-block size-6 scale-125 fill-transparent stroke-current stroke-2 opacity-90 group-hover:fill-transparent sm:scale-110"
    />
    <span class="sr-only">{{ title }}</span>
  </LinkButton>
</template>
