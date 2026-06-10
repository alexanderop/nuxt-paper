<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const props = withDefaults(
  defineProps<{
    pubDatetime: string | Date;
    modDatetime?: string | Date | null;
    timezone?: string;
    size?: "sm" | "lg";
  }>(),
  { size: "sm" }
);

const isModified = computed(
  () =>
    !!props.modDatetime &&
    new Date(props.modDatetime) > new Date(props.pubDatetime)
);

const datetime = computed(() =>
  dayjs(isModified.value ? props.modDatetime : props.pubDatetime).tz(
    props.timezone ?? SITE.timezone
  )
);

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
