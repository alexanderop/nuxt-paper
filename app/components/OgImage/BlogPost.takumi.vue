<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: SITE.title,
    description: "",
  }
);
</script>

<template>
  <div
    class="flex h-full w-full bg-[#006cac] p-5"
    style="font-family: 'Google Sans Code'"
  >
    <div
      class="flex h-full w-full flex-col justify-between rounded-2xl bg-[#fdfdfd] p-16"
    >
      <div class="flex flex-col">
        <h1 class="m-0 text-[64px] leading-tight font-bold text-[#282728]">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="mt-6 mb-0 text-[30px] leading-snug text-[#6b7280]"
        >
          {{ description }}
        </p>
      </div>

      <div class="flex items-end justify-between">
        <p class="m-0 flex gap-2 text-[28px] text-[#282728]">
          <span>by</span>
          <span class="font-bold">{{ SITE.author }}</span>
        </p>
        <p class="m-0 text-[28px] font-bold text-[#006cac]">
          {{ SITE.title }}
        </p>
      </div>
    </div>
  </div>
</template>
