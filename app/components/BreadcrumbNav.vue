<script setup lang="ts">
const route = useRoute();

const navLabels: Record<string, string> = {
  posts: t.nav.posts,
  tags: t.nav.tags,
  about: t.nav.about,
  archives: t.nav.archives,
  search: t.nav.search,
};

function decodeSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const breadcrumbList = computed(() => {
  const currentUrlPath = route.path.replace(/\/+$/, "");
  const list = currentUrlPath.split("/").slice(1).filter(Boolean);

  // if breadcrumb is Home > Posts > [page] replace with "Posts (page n)"
  if (list[0] === "posts") {
    list.splice(
      0,
      2,
      `${t.nav.posts} (${t.pagination.page.toLowerCase()} ${list[1] || 1})`
    );
  }

  // if breadcrumb is Home > Tags > [tag] > [page] replace [tag] > [page]
  // with "[tag] (page n)"
  if (list[0] === "tags" && list[2] && !isNaN(Number(list[2]))) {
    list.splice(
      1,
      3,
      `${decodeSegment(list[1]!)} ${
        Number(list[2]) === 1
          ? ""
          : `(${t.pagination.page.toLowerCase()} ${list[2]})`
      }`
    );
  }

  return list;
});
</script>

<template>
  <nav class="app-layout mt-8 mb-1" aria-label="breadcrumb">
    <ul
      class="font-light [&>li]:inline [&>li:not(:last-child)>a]:hover:opacity-100"
    >
      <li>
        <NuxtLink to="/" class="opacity-80">{{ t.nav.home }}</NuxtLink>
        <span aria-hidden="true" class="opacity-80">&raquo;</span>
      </li>
      <template v-for="(breadcrumb, index) in breadcrumbList" :key="index">
        <li v-if="index + 1 === breadcrumbList.length">
          <span
            :class="['capitalize opacity-75', { lowercase: index > 0 }]"
            aria-current="page"
          >
            {{ navLabels[breadcrumb] ?? decodeSegment(breadcrumb) }}
          </span>
        </li>
        <li v-else>
          <NuxtLink :to="`/${breadcrumb}`" class="capitalize opacity-70">
            {{ navLabels[breadcrumb] ?? decodeSegment(breadcrumb) }}
          </NuxtLink>
          <span aria-hidden="true" class="opacity-70">&raquo;</span>
        </li>
      </template>
    </ul>
  </nav>
</template>
