<script setup lang="ts">
const items = SOCIALS.map(({ name, url, linkTitle }) => ({
  name,
  url,
  title:
    linkTitle ??
    (url.startsWith("mailto:") || name === "mail"
      ? tplStr(t.socials.emailTo, { site: SITE.title })
      : tplStr(t.socials.onPlatform, {
          site: SITE.title,
          platform: platformLabel(name),
        })),
}));
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <SocialIconLink
      v-for="{ name, url, title } in items"
      :key="name"
      :name="name"
      :href="url"
      :title="title"
    />
  </div>
</template>
