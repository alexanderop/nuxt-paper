<script setup lang="ts">
import type { PostItem } from "~/utils/posts";

if (!FEATURES.showArchives) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

usePageSeo({ title: `${t.pages.archivesTitle} | ${SITE.title}` });
useRememberBackUrl();

const { data: posts } = await useAllPosts();

const monthFormatter = new Intl.DateTimeFormat(SITE.lang, { month: "long" });

function monthName(month: string) {
  return monthFormatter.format(new Date(2000, Number(month) - 1, 1));
}

function groupByMonthDesc(yearGroup: PostItem[]) {
  return Object.entries(
    getPostsByGroupCondition(
      yearGroup,
      post => new Date(post.pubDatetime).getMonth() + 1
    )
  ).toSorted(([monthA], [monthB]) => Number(monthB) - Number(monthA));
}

function sortByPubDateDesc(group: PostItem[]) {
  return group.toSorted(
    (a, b) =>
      Math.floor(new Date(b.pubDatetime).getTime() / 1000) -
      Math.floor(new Date(a.pubDatetime).getTime() / 1000)
  );
}

const archive = computed(() =>
  Object.entries(
    getPostsByGroupCondition(posts.value, post =>
      new Date(post.pubDatetime).getFullYear()
    )
  )
    .toSorted(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, yearGroup]) => ({
      year,
      count: yearGroup.length,
      months: groupByMonthDesc(yearGroup).map(([month, monthGroup]) => ({
        month,
        monthName: monthName(month),
        count: monthGroup.length,
        posts: sortByPubDateDesc(monthGroup),
      })),
    }))
);
</script>

<template>
  <BreadcrumbNav />

  <PageMain
    :page-title="t.pages.archivesTitle"
    :page-desc="t.pages.archivesDesc"
  >
    <div v-for="{ year, count, months } in archive" :key="year">
      <span class="text-2xl font-bold">{{ year }}</span>
      <sup class="text-muted-foreground text-sm">{{ count }}</sup>
      <div
        v-for="month in months"
        :key="month.month"
        class="flex flex-col sm:flex-row"
      >
        <div class="mt-6 min-w-36 text-lg sm:my-6">
          <span class="font-bold">{{ month.monthName }}</span>
          <sup class="text-muted-foreground text-xs">{{ month.count }}</sup>
        </div>
        <ul>
          <PostCard
            v-for="post in month.posts"
            :key="post.path"
            :post="post"
          />
        </ul>
      </div>
    </div>
  </PageMain>
</template>
