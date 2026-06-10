<script setup lang="ts">
if (!FEATURES.showArchives) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

usePageSeo({ title: `${t.pages.archivesTitle} | ${SITE.title}` });

const { data: posts } = await useAllPosts();

const monthFormatter = new Intl.DateTimeFormat(SITE.lang, { month: "long" });

const groupedByYear = computed(() =>
  Object.entries(
    getPostsByGroupCondition(posts.value, post =>
      new Date(post.pubDatetime).getFullYear()
    )
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
);

function groupByMonth(yearGroup: typeof posts.value) {
  return Object.entries(
    getPostsByGroupCondition(
      yearGroup,
      post => new Date(post.pubDatetime).getMonth() + 1
    )
  ).sort(([monthA], [monthB]) => Number(monthB) - Number(monthA));
}

function sortByPubDate(group: typeof posts.value) {
  return [...group].sort(
    (a, b) =>
      Math.floor(new Date(b.pubDatetime).getTime() / 1000) -
      Math.floor(new Date(a.pubDatetime).getTime() / 1000)
  );
}
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />

    <BreadcrumbNav />

    <PageMain
      :page-title="t.pages.archivesTitle"
      :page-desc="t.pages.archivesDesc"
    >
      <div v-for="[year, yearGroup] in groupedByYear" :key="year">
        <span class="text-2xl font-bold">{{ year }}</span>
        <sup class="text-muted-foreground text-sm">{{ yearGroup.length }}</sup>
        <div
          v-for="[month, monthGroup] in groupByMonth(yearGroup)"
          :key="month"
          class="flex flex-col sm:flex-row"
        >
          <div class="mt-6 min-w-36 text-lg sm:my-6">
            <span class="font-bold">
              {{ monthFormatter.format(new Date(2000, Number(month) - 1, 1)) }}
            </span>
            <sup class="text-muted-foreground text-xs">
              {{ monthGroup.length }}
            </sup>
          </div>
          <ul>
            <PostCard
              v-for="post in sortByPubDate(monthGroup)"
              :key="post.path"
              :post="post"
            />
          </ul>
        </div>
      </div>
    </PageMain>

    <AppFooter />
  </div>
</template>
