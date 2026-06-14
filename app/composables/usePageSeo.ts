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
 *
 * When no explicit `ogImage` is given (e.g. post frontmatter), an OG image
 * is generated at build time from the page title via nuxt-og-image.
 */
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

  if (options.ogImage) {
    const socialImageURL = joinURL(SITE.url, options.ogImage);
    useSeoMeta({
      ogImage: socialImageURL,
      twitterImage: socialImageURL,
    });
  } else {
    // Page titles carry a " | NuxtPaper" suffix; the template shows the
    // site name separately, so strip it from the image headline.
    const suffix = ` | ${SITE.title}`;
    const imageTitle = title.endsWith(suffix)
      ? title.slice(0, -suffix.length)
      : title;

    defineOgImageComponent("BlogPost", {
      title: imageTitle,
      description: options.description ?? "",
    });
  }
}
