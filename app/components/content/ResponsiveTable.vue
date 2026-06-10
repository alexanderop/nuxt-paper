<script setup lang="ts">
const props = defineProps<{
  variant?: "minimal" | "striped" | "striped-minimal";
}>();

const variantClasses = {
  minimal: "[&_td]:border-0 [&_th]:border-0",
  striped: "[&_tbody_tr]:odd:bg-muted/25",
};

const classes = computed(() => [
  "overflow-hidden [&_table]:my-0 [&_table]:min-w-xl",
  props.variant === "minimal" && variantClasses.minimal,
  props.variant === "striped" && variantClasses.striped,
  props.variant === "striped-minimal" &&
    `${variantClasses.minimal} ${variantClasses.striped}`,
]);
</script>

<template>
  <div :data-table-variant="variant" :class="classes">
    <div class="relative w-full overflow-x-auto">
      <slot />
    </div>
  </div>
</template>
