<script setup lang="ts">
const { progress } = useScrollProgress();

const visible = computed(() => progress.value > 30);

const progressStyle = computed(() => {
  const percent = Math.floor(progress.value);
  return {
    backgroundImage: `conic-gradient(var(--accent), var(--accent) ${percent}%, transparent ${percent}%)`,
  };
});

function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
</script>

<template>
  <div
    :class="[
      'fixed inset-e-4 bottom-8 z-50',
      'md:sticky md:inset-e-auto md:float-end md:me-1',
      'transition duration-500',
      visible ? 'translate-y-0 opacity-100' : 'translate-y-14 opacity-0',
    ]"
  >
    <button
      :class="[
        'group bg-background relative px-2 py-1',
        'size-14 rounded-full shadow-xl',
        'md:h-8 md:w-fit md:rounded-md md:shadow-none md:focus-visible:rounded-none',
        'md:bg-background/35 md:bg-clip-padding md:backdrop-blur-lg',
      ]"
      @click="scrollToTop"
    >
      <span
        :style="progressStyle"
        class="absolute inset-0 -z-10 block size-14 scale-110 rounded-full bg-transparent md:hidden md:h-8 md:rounded-md"
      ></span>
      <IconArrowLeft class="inline-block rotate-90 md:hidden" />
      <span class="group-hover:text-accent sr-only text-sm md:not-sr-only">
        <IconArrowNarrowUp class="inline-block size-4" />
        {{ t.post.backToTop }}
      </span>
    </button>
  </div>
</template>
