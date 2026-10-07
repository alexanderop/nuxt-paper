import { joinURL } from "ufo";
export default defineEventHandler(event => {
  setResponseHeader(event, "content-type", "text/plain");
  return `User-agent: *\nAllow: /\n\nSitemap: ${joinURL(SITE.url, "sitemap.xml")}\n`;
});
