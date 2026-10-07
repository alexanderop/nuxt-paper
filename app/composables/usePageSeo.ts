import { joinURL } from "ufo";

interface PageSeoOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalURL?: string;
  author?: string;
  ogType?: "website" | "article";
}

export function usePageSeo(options: PageSeoOptions = {}) {
  const route = useRoute();

  const title = options.title ?? SITE.title;
  const description = options.description ?? SITE.description;
  const canonicalURL = options.canonicalURL ?? joinURL(SITE.url, route.path);

  useHead({
    title,
    link: [{ rel: "canonical", href: canonicalURL }],
    meta: SITE.googleVerification
      ? [
          {
            name: "google-site-verification",
            content: SITE.googleVerification,
          },
        ]
      : [],
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
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
  });

  const image = options.ogImage || (!FEATURES.dynamicOgImage || options.ogType !== "article" ? useRuntimeConfig().public.defaultOgImage : "");
  if (image) {
    const socialImageURL = /^https?:\/\//.test(image) ? image : joinURL(SITE.url, image);
    useSeoMeta({
      ogImage: socialImageURL,
      twitterImage: socialImageURL,
    });
  } else if (FEATURES.dynamicOgImage) {
    // Page titles carry a " | NuxtPaper" suffix; the template shows the
    // site name separately, so strip it from the image headline.
    const suffix = ` | ${SITE.title}`;
    const imageTitle = title.endsWith(suffix)
      ? title.slice(0, -suffix.length)
      : title;

    defineOgImageComponent("BlogPostSatori", {
      title: imageTitle,
      description: description,
      author: options.author ?? SITE.author,
      article: options.ogType === "article",
      fontFamily: "Google Sans Code OG",
    });
  }
}
