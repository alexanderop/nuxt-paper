export const SITE = {
  url: "https://nuxt-paper.example.com",
  title: "NuxtPaper",
  description:
    "A minimal, responsive and SEO-friendly blog theme — AstroPaper ported to Nuxt 4 and Nuxt Content.",
  author: "Sat Naing",
  profile: "https://satna.ing",
  ogImage: "/default-og.jpg",
  lang: "en",
  timezone: "Asia/Bangkok",
  dir: "ltr" as const,
};

export const POSTS = {
  perPage: 4,
  perIndex: 4,
  /**
   * Scheduled posts within this window (ms) of their pubDatetime
   * are shown as published.
   */
  scheduledPostMargin: 15 * 60 * 1000,
};

export const FEATURES = {
  lightAndDarkMode: true,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  search: true,
};

export interface SocialLink {
  name: string;
  url: string;
  linkTitle?: string;
}

export const SOCIALS: SocialLink[] = [
  { name: "github", url: "https://github.com/satnaing/astro-paper" },
  { name: "x", url: "https://x.com/username" },
  { name: "linkedin", url: "https://www.linkedin.com/in/username/" },
  { name: "mail", url: "mailto:yourmail@gmail.com" },
];

export const SHARE_LINKS: SocialLink[] = [
  { name: "whatsapp", url: "https://wa.me/?text=" },
  { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
  { name: "x", url: "https://x.com/intent/post?url=" },
  { name: "telegram", url: "https://t.me/share/url?url=" },
  { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
  { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
];
