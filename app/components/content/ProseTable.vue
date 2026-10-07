<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<template>
  <div
    role="region"
    aria-label="Scrollable table"
    tabindex="0"
    class="max-w-full overflow-x-auto focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed"
  >
    <table v-bind="$attrs">
      <slot />
    </table>
  </div>
</template>
