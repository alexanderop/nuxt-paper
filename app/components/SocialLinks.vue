<script setup lang="ts">
const items = SOCIALS.map(({ name, url, linkTitle }) => {
  const title =
    linkTitle ??
    (url.startsWith("mailto:") || name === "mail"
      ? `Send an email to ${SITE.title}`
      : `${SITE.title} on ${name.charAt(0).toUpperCase() + name.slice(1)}`);
  return { name, url, title };
});
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <LinkButton
      v-for="{ name, url, title } in items"
      :key="name"
      :href="url"
      class="p-2 hover:rotate-6 sm:p-1"
      :title="title"
    >
      <SocialIcon
        :name="name"
        class="inline-block size-6 scale-125 fill-transparent stroke-current stroke-2 opacity-90 group-hover:fill-transparent sm:scale-110"
      />
      <span class="sr-only">{{ title }}</span>
    </LinkButton>
  </div>
</template>
