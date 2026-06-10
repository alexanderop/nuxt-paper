<script setup lang="ts">
const { data: about } = await useAsyncData("page-about", () =>
  queryCollection("pages").path("/about").first()
);

if (!about.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Missing content entry: about.md in content/pages/",
  });
}

usePageSeo({
  title: `${about.value.title} | ${SITE.title}`,
  description: about.value.description,
  ogImage: about.value.ogImage,
  canonicalURL: about.value.canonicalURL,
});
useRememberBackUrl();
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="about!.title" class="app-prose">
    <ContentRenderer :value="about!" />
  </PageMain>
</template>
