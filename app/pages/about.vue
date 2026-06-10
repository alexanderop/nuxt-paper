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
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />

    <BreadcrumbNav />

    <PageMain :page-title="about!.title" class="app-prose">
      <ContentRenderer :value="about!" />
    </PageMain>

    <AppFooter />
  </div>
</template>
