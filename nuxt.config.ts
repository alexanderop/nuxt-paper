import tailwindcss from "@tailwindcss/vite";
import { joinURL } from "ufo";

// e.g. "/nuxt-paper/" when deploying to GitHub Pages project sites
const baseURL = process.env.NUXT_APP_BASE_URL || "/";

// Inline FOUC-prevention script: sets data-theme on <html> before the
// browser paints. Mirrors AstroPaper's inline theme script.
const themeInitScript = `
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored ?? (prefersDark ? "dark" : "light");
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
})();
`;

export default defineNuxtConfig({
  compatibilityDate: "2026-06-10",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxt/fonts", "nuxt-og-image"],

  // Used by nuxt-og-image to build absolute og:image URLs.
  // The GitHub Pages subpath comes from NUXT_APP_BASE_URL at build time.
  site: {
    url: "https://alexanderop.github.io",
    name: "NuxtPaper",
  },

  ogImage: {
    // Static site: generate all images at build time, ship no runtime endpoints.
    // Fonts are extracted automatically from @nuxt/fonts.
    zeroRuntime: true,
  },

  css: ["~/assets/css/global.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    { path: "~/components/content", pathPrefix: false, global: true },
    { path: "~/components", pathPrefix: false },
  ],

  experimental: {
    viewTransition: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
        dir: "ltr",
        class: "overflow-y-scroll scroll-smooth",
      },
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: joinURL(baseURL, "favicon.svg"),
        },
        { rel: "sitemap", href: joinURL(baseURL, "sitemap.xml") },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "NuxtPaper",
          href: joinURL(baseURL, "rss.xml"),
        },
      ],
      meta: [{ name: "theme-color", content: "" }],
      script: [{ innerHTML: themeInitScript }],
    },
  },

  fonts: {
    families: [
      {
        name: "Google Sans Code",
        provider: "google",
        weights: [300, 400, 500, 600, 700],
        styles: ["normal", "italic"],
        global: true,
      },
    ],
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          "remark-toc": {},
        },
        rehypePlugins: {
          "rehype-callouts": { options: { theme: "obsidian" } },
        },
        highlight: {
          theme: {
            default: "min-light",
            dark: "night-owl",
          },
        },
      },
    },
  },

  nitro: {
    prerender: {
      routes: ["/rss.xml", "/sitemap.xml"],
    },
  },
});
