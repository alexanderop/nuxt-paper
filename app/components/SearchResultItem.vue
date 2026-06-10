<script setup lang="ts">
const props = defineProps<{
  result: {
    /** Section ids look like "/posts/my-post#heading-id" */
    id: string;
    title?: string;
    titles?: string[];
    content?: string;
  };
  query: string;
}>();

const displayTitle = computed(() => {
  const parts = props.result.titles?.filter(Boolean) ?? [];
  if (props.result.title) parts.push(props.result.title);
  return parts.join(" › ");
});

const snippet = computed(() =>
  searchExcerpt(props.result.content ?? "", props.query)
);
</script>

<template>
  <li class="border-border border-b py-4 last:border-b-0">
    <NuxtLink
      :to="result.id"
      class="text-accent font-medium decoration-dashed underline-offset-4 hover:underline"
    >
      {{ displayTitle }}
    </NuxtLink>
    <p class="text-foreground/80 mt-1 text-sm">{{ snippet }}</p>
  </li>
</template>
