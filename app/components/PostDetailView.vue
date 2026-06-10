<script setup lang="ts">
const props = defineProps<{ path: string }>();

const { data: post } = await useAsyncData(`post-${props.path}`, () =>
  queryCollection("posts").path(props.path).first()
);

if (!post.value || !postFilter(post.value)) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const { data: allPosts } = await useAllPosts();

const adjacent = computed(() => {
  const index = allPosts.value.findIndex(p => p.path === props.path);
  return {
    prevPost: index > 0 ? allPosts.value[index - 1] : null,
    nextPost:
      index >= 0 && index < allPosts.value.length - 1
        ? allPosts.value[index + 1]
        : null,
  };
});

const tags = computed(
  () => post.value?.tags.map(tag => ({ tag: slugifyStr(tag), tagName: tag })) ?? []
);

const filePath = computed(() => {
  const id = post.value?.id ?? "";
  // id looks like "posts/posts/my-post.md" (collection/source path)
  return `content/${id.split("/").slice(1).join("/")}`;
});

usePageSeo({
  title: `${post.value.title} | ${SITE.title}`,
  description: post.value.description,
  ogImage: post.value.ogImage,
  canonicalURL: post.value.canonicalURL,
  ogType: "article",
});

const pubISO = new Date(post.value.pubDatetime).toISOString();
const modISO = post.value.modDatetime
  ? new Date(post.value.modDatetime).toISOString()
  : undefined;

useSeoMeta({
  articlePublishedTime: pubISO,
  articleModifiedTime: modISO,
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.value.title,
        image: post.value.ogImage,
        datePublished: pubISO,
        ...(modISO && { dateModified: modISO }),
        author: [
          {
            "@type": "Person",
            name: post.value.author ?? SITE.author,
            ...(SITE.profile && { url: SITE.profile }),
          },
        ],
      }),
    },
  ],
});

// ===== Article enhancements (progress bar, copy buttons) =====
const progressBar = ref<HTMLElement | null>(null);

function updateScrollProgress() {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  if (progressBar.value) progressBar.value.style.width = scrolled + "%";
}

function attachCopyButtons() {
  const copyButtonLabel = "Copy";
  const codeBlocks = Array.from(
    document.querySelectorAll<HTMLPreElement>("#article pre")
  );

  for (const codeBlock of codeBlocks) {
    if (codeBlock.parentElement?.classList.contains("code-block-wrapper"))
      continue;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    wrapper.style.position = "relative";

    const copyButton = document.createElement("button");
    copyButton.className =
      "copy-code absolute end-3 -top-3 rounded bg-muted border border-muted px-2 py-1 text-xs leading-4 text-foreground font-medium";
    copyButton.innerHTML = copyButtonLabel;
    codeBlock.setAttribute("tabindex", "0");
    codeBlock.appendChild(copyButton);

    codeBlock.parentNode?.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);

    copyButton.addEventListener("click", async () => {
      const code = codeBlock.querySelector("code");
      await navigator.clipboard.writeText(code?.innerText ?? "");
      copyButton.innerText = "Copied";
      setTimeout(() => {
        copyButton.innerText = copyButtonLabel;
      }, 700);
    });
  }
}

onMounted(() => {
  document.addEventListener("scroll", updateScrollProgress);
  attachCopyButtons();
});

onUnmounted(() => {
  document.removeEventListener("scroll", updateScrollProgress);
});
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <div class="progress-container bg-background fixed top-0 z-10 h-1 w-full">
      <div ref="progressBar" class="progress-bar bg-accent h-1 w-0"></div>
    </div>

    <AppHeader />

    <PostBackButton />

    <main
      id="main-content"
      :class="['app-layout', { 'mt-8': !FEATURES.showBackButton }]"
    >
      <h1 class="text-accent inline-block text-2xl font-bold sm:text-3xl">
        {{ post!.title }}
      </h1>

      <div class="my-2 flex items-center gap-2">
        <DatetimeDisplay
          :pub-datetime="post!.pubDatetime"
          :mod-datetime="post!.modDatetime"
          :timezone="post!.timezone"
          size="lg"
        />
        <span
          aria-hidden="true"
          :class="[
            'text-muted-foreground max-sm:hidden',
            { hidden: !FEATURES.editPost.enabled || post!.hideEditPost },
          ]"
        >
          |
        </span>
        <PostEditLink
          :hide-edit-post="post!.hideEditPost"
          :file-path="filePath"
          class="max-sm:hidden"
        />
      </div>

      <article id="article" class="app-prose max-w-app mt-8 w-full">
        <ContentRenderer :value="post!" />
      </article>

      <hr class="my-8 border-dashed" />

      <PostEditLink
        class="sm:hidden"
        :hide-edit-post="post!.hideEditPost"
        :file-path="filePath"
      />

      <PostBackToTop />

      <ul class="mt-4 mb-8 flex flex-wrap gap-4 sm:my-8">
        <TagPill
          v-for="{ tag, tagName } in tags"
          :key="tag"
          :tag="tag"
          :tag-name="tagName"
          size="sm"
        />
      </ul>

      <PostShareLinks />

      <hr class="my-8 border-dashed" />

      <PostAdjacentNav
        :prev-post="adjacent.prevPost"
        :next-post="adjacent.nextPost"
      />
    </main>
    <AppFooter />
  </div>
</template>
