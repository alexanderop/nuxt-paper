<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  description?: string;
  author?: string;
  article?: boolean;
  fontFamily?: string;
}>(), { title: SITE.title, description: SITE.description, author: SITE.author, article: false, fontFamily: "Google Sans Code OG" });
const hostname = new URL(SITE.url).hostname;
</script>

<template>
  <div :style="{ fontFamily }" style="display: flex; width: 100%; height: 100%; background: #fefbfb; align-items: center; justify-content: center; color: #000">
    <div style="position: absolute; top: -1px; right: -1px; display: flex; border: 4px solid #000; background: #ecebeb; opacity: 0.9; border-radius: 4px; margin: 40px; width: 88%; height: 80%" />
    <div style="display: flex; justify-content: center; border: 4px solid #000; background: #fefbfb; border-radius: 4px; margin: 32px; width: 88%; height: 80%">
      <div style="display: flex; flex-direction: column; justify-content: space-between; margin: 20px; width: 90%; height: 90%">
        <p v-if="article" style="font-size: 72px; font-weight: 700; max-height: 84%; overflow: hidden">{{ title }}</p>
        <div v-else style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 90%; max-height: 90%; overflow: hidden; text-align: center">
          <p style="font-size: 72px; font-weight: 700">{{ SITE.title }}</p>
          <p style="font-size: 28px">{{ description }}</p>
        </div>
        <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px; font-size: 28px">
          <span v-if="article" style="display: flex; gap: 0">by <span style="color: transparent">&quot;</span><span style="overflow: hidden; font-weight: 700">{{ author }}</span></span>
          <span v-else />
          <span style="overflow: hidden; font-weight: 700">{{ article ? SITE.title : hostname }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
