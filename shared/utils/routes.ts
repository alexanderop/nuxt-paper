import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

export function slugifyStr(value: string): string {
  return Array.from(value).some(character => character.charCodeAt(0) > 127) ? kebabcase(value) : slugify(value, { lower: true });
}

export function publicationRoutes(posts: readonly { path: string; tags?: string[] }[], options: { perPage: number; archives: boolean; search: boolean }): string[] {
  const paths = ["/", "/posts", "/tags", "/about"];
  if (options.archives) paths.push("/archives");
  if (options.search) paths.push("/search");
  for (let page = 2; page <= Math.ceil(posts.length / options.perPage); page++) paths.push(`/posts/${page}`);
  const tags = new Map<string, number>();
  for (const post of posts) {
    paths.push(post.path);
    for (const tag of new Set((post.tags ?? []).map(slugifyStr))) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }
  for (const [tag, count] of tags) {
    paths.push(`/tags/${tag}`);
    for (let page = 2; page <= Math.ceil(count / options.perPage); page++) paths.push(`/tags/${tag}/${page}`);
  }
  return paths;
}

export function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
