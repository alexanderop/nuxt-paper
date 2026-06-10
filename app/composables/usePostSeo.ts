interface PostSeoInput {
  title: string;
  description?: string;
  ogImage?: string;
  canonicalURL?: string;
  pubDatetime: ContentDatetime;
  modDatetime?: ContentDatetime | null;
  author?: string;
}

/**
 * Sets the full head for a post detail page: page meta, article
 * published/modified times and BlogPosting JSON-LD.
 */
export function usePostSeo(post: PostSeoInput) {
  usePageSeo({
    title: `${post.title} | ${SITE.title}`,
    description: post.description,
    ogImage: post.ogImage,
    canonicalURL: post.canonicalURL,
    ogType: "article",
  });

  const pubISO = toDate(post.pubDatetime).toISOString();
  const modISO = post.modDatetime
    ? toDate(post.modDatetime).toISOString()
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
          headline: post.title,
          image: post.ogImage,
          datePublished: pubISO,
          ...(modISO && { dateModified: modISO }),
          author: [
            {
              "@type": "Person",
              name: post.author ?? SITE.author,
              ...(SITE.profile && { url: SITE.profile }),
            },
          ],
        }),
      },
    ],
  });
}
