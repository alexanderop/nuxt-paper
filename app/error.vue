<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{ error: NuxtError }>();

usePageSeo({ title: `${t.notFound.title} | ${SITE.title}` });

useHead({
  bodyAttrs: {
    class:
      "bg-background font-app text-foreground selection:bg-accent/75 selection:text-accent-foreground flex min-h-svh flex-col",
  },
});
</script>

<template>
  <NuxtLayout>
    <main
      id="main-content"
      class="app-layout flex flex-1 items-center justify-center"
    >
      <div class="mb-14 flex flex-col items-center justify-center">
        <h1 class="text-accent text-9xl font-bold">
          {{ error.statusCode ?? 404 }}
        </h1>
        <span aria-hidden="true"> ¯\_(ツ)_/¯ </span>
        <p class="mt-4 text-2xl sm:text-3xl">{{ t.notFound.message }}</p>
        <LinkButton
          href="/"
          class="my-6 text-lg underline decoration-dashed underline-offset-8"
        >
          {{ t.notFound.goHome }}
        </LinkButton>
      </div>
    </main>
  </NuxtLayout>
</template>
