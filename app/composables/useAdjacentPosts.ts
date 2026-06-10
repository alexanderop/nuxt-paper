/**
 * The previous/next post around `path` in the sorted post list.
 */
export async function useAdjacentPosts(path: MaybeRefOrGetter<string>) {
  const { data: posts } = await useAllPosts();

  const index = computed(() =>
    posts.value.findIndex(post => post.path === toValue(path))
  );

  const prevPost = computed(() =>
    index.value > 0 ? posts.value[index.value - 1] : null
  );

  const nextPost = computed(() =>
    index.value >= 0 && index.value < posts.value.length - 1
      ? posts.value[index.value + 1]
      : null
  );

  return { prevPost, nextPost };
}
