<script setup lang="ts">
const props = defineProps<{
  href?: string;
  disabled?: boolean;
  external?: boolean;
}>();

const isExternal = computed(
  () => props.external || /^(https?:|mailto:)/.test(props.href ?? "")
);

const baseClass = "group inline-flex items-center gap-1";
const linkClass = `${baseClass} hover:text-accent`;
</script>

<template>
  <span v-if="disabled" aria-disabled="true" :class="baseClass">
    <slot />
  </span>
  <a v-else-if="isExternal" :href="href" :class="linkClass">
    <slot />
  </a>
  <NuxtLink v-else :to="href" :class="linkClass">
    <slot />
  </NuxtLink>
</template>
