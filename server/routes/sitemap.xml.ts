import { queryCollection } from "@nuxt/content/server";
import { joinURL } from "ufo";

export default defineEventHandler(async event => {
  const posts = await queryCollection(event, "posts")
    .select("path", "pubDatetime", "modDatetime", "draft", "tags")
    .all();

  const visible = publishedPosts(posts.map(post => Object.assign({}, post, { modDatetime: post.modDatetime ? toDate(post.modDatetime) : null })), useRuntimeConfig(event).public.publication);
  const lastModified = new Map(visible.map(post => [post.path, toDate(post.modDatetime ?? post.pubDatetime).toISOString()]));
  const urls = publicationRoutes(visible, { perPage: POSTS.perPage, archives: FEATURES.showArchives, search: FEATURES.search })
    .map(path => ({ path, lastmod: lastModified.get(path) }));

  const body = urls
    .map(
      url => `  <url>
    <loc>${escapeXml(joinURL(SITE.url, url.path))}</loc>${
      "lastmod" in url && url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
    }
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  setResponseHeader(event, "content-type", "application/xml");
  return sitemap;
});
