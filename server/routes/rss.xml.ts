import { queryCollection } from "@nuxt/content/server";
import { joinURL } from "ufo";

export default defineEventHandler(async event => {
  const posts = await queryCollection(event, "posts")
    .select("path", "title", "description", "pubDatetime", "modDatetime", "draft")
    .all();

  const visible = publishedPosts(posts.map(post => Object.assign({}, post, { modDatetime: post.modDatetime ? toDate(post.modDatetime) : null })), useRuntimeConfig(event).public.publication);

  const items = visible
    .map(post => {
      const url = escapeXml(joinURL(SITE.url, post.path));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(post.description ?? "")}</description>
      <pubDate>${toDate(post.modDatetime ?? post.pubDatetime).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(SITE.url)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.lang}</language>
${items}
  </channel>
</rss>`;

  setResponseHeader(event, "content-type", "application/rss+xml");
  return rss;
});
