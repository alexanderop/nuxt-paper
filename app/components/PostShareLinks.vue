<script setup lang="ts">
const pageUrl = computed(() => new URL(useRoute().path, SITE.url).href);

const platformLabel = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);

const items = SHARE_LINKS.map(({ name, url, linkTitle }) => {
  const title =
    linkTitle ??
    (name === "mail"
      ? t.post.sharePostViaEmail
      : tplStr(t.post.sharePostOn, { platform: platformLabel(name) }));
  return { name, url, title };
});
</script>

<template>
  <div
    v-if="items.length"
    class="flex flex-none flex-col items-center justify-center gap-1 md:items-start"
  >
    <span class="italic">{{ t.post.sharePostIntro }}</span>
    <div class="text-center">
      <LinkButton
        v-for="{ name, url, title } in items"
        :key="name"
        :href="`${url}${pageUrl}`"
        class="scale-90 p-2 hover:rotate-6 sm:p-1"
        :title="title"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIcon
          :name="name"
          class="inline-block size-6 scale-125 fill-transparent stroke-current stroke-2 opacity-90 group-hover:fill-transparent sm:scale-110"
        />
        <span class="sr-only">{{ title }}</span>
      </LinkButton>
    </div>
  </div>
</template>
