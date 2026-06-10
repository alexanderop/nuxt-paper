<script setup lang="ts">
const props = defineProps<{
  href?: string;
  disabled?: boolean;
  external?: boolean;
}>();

const isExternal = computed(
  () => props.external || /^(https?:|mailto:)/.test(props.href ?? "")
);
</script>

<template>
  <span
    v-if="disabled"
    aria-disabled="true"
    class="group inline-flex items-center gap-1"
  >
    <slot />
  </span>
  <a
    v-else-if="isExternal"
    :href="href"
    class="group inline-flex items-center gap-1 hover:text-accent"
  >
    <slot />
  </a>
  <NuxtLink
    v-else
    :to="href"
    class="group inline-flex items-center gap-1 hover:text-accent"
  >
    <slot />
  </NuxtLink>
</template>
