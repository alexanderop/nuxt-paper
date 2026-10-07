import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { joinURL } from "ufo";
import { publicationContext } from "./build/content-source";
import { postPath } from "./shared/utils/publication";
import { SITE, FEATURES } from "./shared/utils/site";

const rendererVersion = createHash("sha256")
  .update(readFileSync(new URL("./app/mdc.config.ts", import.meta.url)))
  .update(readFileSync(new URL("./build/rehype-svg.mjs", import.meta.url)))
  .digest("hex");
const baseURL = process.env.NUXT_APP_BASE_URL || "/";
const defaultOgImage = /^https?:\/\//.test(SITE.ogImage) || existsSync(resolve("public", SITE.ogImage.replace(/^\/+/, ""))) ? SITE.ogImage : "";
if (!FEATURES.dynamicOgImage && !defaultOgImage) {
  throw new Error("Set SITE.ogImage to an existing public image or enable FEATURES.dynamicOgImage.");
}

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
  runtimeConfig: { public: { publication: publicationContext, defaultOgImage } },
  hooks: {
    "content:file:afterParse"({ file, content, collection }) {
      if (collection.name !== "posts") return;
      const sourcePath = file.id.replace(/^posts\//, "");
      content.sourcePath = sourcePath;
      content.pubDatetime = new Date(content.pubDatetime as string | Date).toISOString();
      if (content.modDatetime) content.modDatetime = new Date(content.modDatetime as string | Date).toISOString();
      content.path = postPath(sourcePath, typeof content.slug === "string" ? content.slug : undefined);
    },
  },
  compatibilityDate: "2026-06-10",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxt/fonts", "nuxt-og-image"],

  // Used by nuxt-og-image to build absolute og:image URLs.
  // The GitHub Pages subpath comes from NUXT_APP_BASE_URL at build time.
  site: {
    url: new URL(SITE.url).origin,
    name: SITE.title,
  },

  ogImage: {
    // Static site: generate all images at build time, ship no runtime endpoints.
    // Fonts are extracted automatically from @nuxt/fonts.
    zeroRuntime: true,
    defaults: { width: 1200, height: 630 },
  },

  css: ["@pagefind/default-ui/css/ui.css", "~/assets/css/fonts.css", "~/assets/css/global.css", "katex/dist/katex.min.css"],

  postcss: { plugins: { cssnano: false } },

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
        lang: SITE.lang,
        dir: SITE.dir,
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
          title: SITE.title,
          href: joinURL(baseURL, "rss.xml"),
        },
      ],
      meta: [{ name: "theme-color", content: "" }],
      script: [{ innerHTML: themeInitScript }],
    },
  },

  fonts: {
    families: [{ name: "Google Sans Code", provider: "none" }, ...[400, 700].map(weight => ({
      name: "Google Sans Code OG",
      src: `/fonts/google-sans-code-${weight}-normal.ttf`,
      weight,
      style: "normal" as const,
      global: true,
      fallbacks: [],
    }))],
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          "remark-toc": {},
          "remark-smartypants": {},
          "remark-math": {},
          "remark-collapse": { options: { test: "Table of contents" } },
        },
        rehypePlugins: {
          "rehype-callouts": { options: { theme: "obsidian" } },
          "rehype-katex": {},
          // Content hashes plugin options, but not the custom transformer files.
          [fileURLToPath(new URL("./build/rehype-svg.mjs", import.meta.url))]: { options: { rendererVersion } },
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
      routes: ["/rss.xml", "/sitemap.xml", "/robots.txt"],
    },
  },
});
