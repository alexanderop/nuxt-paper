import { queryCollection } from "@nuxt/content/server";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default defineEventHandler(async event => {
  const posts = await queryCollection(event, "posts")
    .select("path", "title", "description", "pubDatetime", "modDatetime", "draft")
    .all();

  const visible = posts
    .filter(post => !post.draft)
    .sort(
      (a, b) =>
        new Date(b.modDatetime ?? b.pubDatetime).getTime() -
        new Date(a.modDatetime ?? a.pubDatetime).getTime()
    );

  const items = visible
    .map(post => {
      const url = new URL(post.path, SITE.url).href;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(post.description ?? "")}</description>
      <pubDate>${new Date(post.pubDatetime).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.lang}</language>
${items}
  </channel>
</rss>`;

  setResponseHeader(event, "content-type", "application/rss+xml");
  return rss;
});
