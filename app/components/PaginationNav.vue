<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  lastPage: number;
  prevUrl?: string | null;
  nextUrl?: string | null;
}>();

const hasPrev = computed(() => !!props.prevUrl);
const hasNext = computed(() => !!props.nextUrl);
</script>

<template>
  <nav
    v-if="lastPage > 1"
    class="mt-auto mb-8 flex justify-center gap-4"
    role="navigation"
    aria-label="Pagination Navigation"
  >
    <LinkButton
      :disabled="!hasPrev"
      :href="prevUrl ?? undefined"
      :class="['select-none', { 'opacity-50': !hasPrev }]"
      :aria-label="t.a11y.goToPreviousPage"
    >
      <IconArrowLeft class="inline-block rtl:rotate-180" />
      {{ t.pagination.prev }}
    </LinkButton>
    {{ currentPage }} / {{ lastPage }}
    <LinkButton
      :disabled="!hasNext"
      :href="nextUrl ?? undefined"
      :class="['select-none', { 'opacity-50': !hasNext }]"
      :aria-label="t.a11y.goToNextPage"
    >
      {{ t.pagination.next }}
      <IconArrowRight class="inline-block rtl:rotate-180" />
    </LinkButton>
  </nav>
</template>
