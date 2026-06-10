<script setup lang="ts">
import { joinURL } from "ufo";

usePageSeo();
useRememberBackUrl();

const rssHref = joinURL(useRuntimeConfig().app.baseURL, "rss.xml");

const { data: posts } = await useAllPosts();

const featuredPosts = computed(() => posts.value.filter(p => p.featured));
const recentPosts = computed(() => posts.value.filter(p => !p.featured));
</script>

<template>
  <main id="main-content" class="app-layout">
    <section id="hero" class="border-border border-b pt-8 pb-6">
      <h1 class="my-4 inline-block text-4xl font-bold sm:my-8 sm:text-5xl">
        Mingalaba
      </h1>
      <a
        target="_blank"
        :href="rssHref"
        class="inline-block"
        aria-label="RSS Feed"
        title="RSS Feed"
      >
        <IconRss
          width="20"
          height="20"
          class="stroke-accent scale-125 stroke-3 rtl:-rotate-90"
        />
        <span class="sr-only">RSS Feed</span>
      </a>

      <p>
        NuxtPaper is a minimal, responsive, accessible and SEO-friendly blog
        theme — a port of AstroPaper to Nuxt 4 and Nuxt Content. This theme
        follows best practices and provides accessibility out of the box.
        Light and dark mode are supported by default.
      </p>
      <p class="mt-2">
        Read the blog posts or check
        <LinkButton
          class="hover:text-accent underline decoration-dashed underline-offset-4"
          href="https://github.com/satnaing/astro-paper#readme"
        >
          README
        </LinkButton>
        of the original theme for more info.
      </p>
      <div v-if="SOCIALS.length > 0" class="mt-4 flex max-sm:flex-col sm:items-center">
        <div class="me-2 mb-1 whitespace-nowrap sm:mb-0">
          {{ t.home.socialLinks }}:
        </div>
        <SocialLinks />
      </div>
    </section>

    <section
      v-if="featuredPosts.length > 0"
      id="featured"
      :class="[
        'pt-12 pb-6',
        { 'border-border border-b': recentPosts.length > 0 },
      ]"
    >
      <h2 class="text-2xl font-semibold tracking-wide">
        {{ t.home.featured }}
      </h2>
      <ul>
        <PostCard
          v-for="post in featuredPosts"
          :key="post.path"
          :post="post"
          variant="h3"
        />
      </ul>
    </section>

    <section v-if="recentPosts.length > 0" id="recent-posts" class="pt-12 pb-6">
      <h2 class="text-2xl font-semibold tracking-wide">
        {{ t.home.recentPosts }}
      </h2>
      <ul>
        <PostCard
          v-for="post in recentPosts.slice(0, POSTS.perIndex)"
          :key="post.path"
          :post="post"
          variant="h3"
        />
      </ul>
    </section>

    <div class="my-8 text-center">
      <LinkButton href="/posts">
        {{ t.home.allPosts }}
        <IconArrowRight class="inline-block rtl:-rotate-180" />
      </LinkButton>
    </div>
  </main>
</template>
