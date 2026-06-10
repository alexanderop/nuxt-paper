<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    post: DatedEntry;
    size?: "sm" | "lg";
  }>(),
  { size: "sm" }
);

const resolved = computed(() => resolvePostDate(props.post));

const datetime = computed(() => resolved.value.datetime);
const isModified = computed(() => resolved.value.isModified);
const date = computed(() => datetime.value.format("D MMM, YYYY"));
</script>

<template>
  <div class="text-muted-foreground flex items-center gap-x-2">
    <IconCalendar
      :class="['inline-block size-6 min-w-5.5', { 'scale-90': size === 'sm' }]"
    />
    <span
      v-if="isModified"
      :class="['text-sm', { 'sm:text-base': size === 'lg' }]"
    >
      {{ t.post.updatedAt }}:
    </span>
    <time
      :class="['text-sm', { 'sm:text-base': size === 'lg' }]"
      :datetime="datetime.toISOString()"
    >
      {{ date }}
    </time>
  </div>
</template>
