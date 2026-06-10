import { joinURL } from "ufo";

interface PageSeoOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalURL?: string;
  ogType?: "website" | "article";
}

/**
 * Sets per-page meta tags mirroring AstroPaper's Layout.astro head.
 */
export function usePageSeo(options: PageSeoOptions = {}) {
  const route = useRoute();

  const title = options.title ?? SITE.title;
  const description = options.description ?? SITE.description;
  const canonicalURL = options.canonicalURL ?? joinURL(SITE.url, route.path);
  const socialImageURL = joinURL(SITE.url, options.ogImage ?? SITE.ogImage);

  useHead({
    title,
    link: [{ rel: "canonical", href: canonicalURL }],
  });

  useSeoMeta({
    title,
    description,
    author: SITE.author,
    ogType: options.ogType ?? "website",
    ogSiteName: SITE.title,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalURL,
    ogImage: socialImageURL,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: socialImageURL,
  });
}
