import { queryCollection } from "@nuxt/content/server";

export default defineEventHandler(async event => {
  const posts = await queryCollection(event, "posts")
    .select("path", "pubDatetime", "modDatetime", "draft", "tags")
    .all();

  const visible = posts.filter(post => !post.draft);

  const staticPaths = ["/", "/posts", "/tags", "/about", "/search"];
  if (FEATURES.showArchives) staticPaths.push("/archives");

  const tagPaths = [
    ...new Set(
      visible.flatMap(post =>
        post.tags.map(
          (tag: string) =>
            `/tags/${tag
              .trim()
              .toLowerCase()
              .replace(/[\s_]+/g, "-")
              .replace(/[^\p{L}\p{N}-]+/gu, "")}`
        )
      )
    ),
  ];

  const urls = [
    ...staticPaths.map(path => ({ path })),
    ...visible.map(post => ({
      path: post.path,
      lastmod: new Date(post.modDatetime ?? post.pubDatetime).toISOString(),
    })),
    ...tagPaths.map(path => ({ path })),
  ];

  const body = urls
    .map(
      url => `  <url>
    <loc>${new URL(url.path, SITE.url).href}</loc>${
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
