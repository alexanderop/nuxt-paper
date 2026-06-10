<script setup lang="ts">
import { joinURL } from "ufo";

const pageUrl = computed(() => joinURL(SITE.url, useRoute().path));

const items = SHARE_LINKS.map(({ name, url, linkTitle }) => ({
  name,
  url,
  title:
    linkTitle ??
    (name === "mail"
      ? t.post.sharePostViaEmail
      : tplStr(t.post.sharePostOn, { platform: platformLabel(name) })),
}));
</script>

<template>
  <div
    v-if="items.length"
    class="flex flex-none flex-col items-center justify-center gap-1 md:items-start"
  >
    <span class="italic">{{ t.post.sharePostIntro }}</span>
    <div class="text-center">
      <SocialIconLink
        v-for="{ name, url, title } in items"
        :key="name"
        :name="name"
        :href="`${url}${pageUrl}`"
        :title="title"
        class="scale-90"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  </div>
</template>
