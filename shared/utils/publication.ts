import { slug as githubSlug } from "github-slugger";
import { slugifyStr } from "./routes";

export interface PublicationContext {
  now: number;
  development: boolean;
  scheduledMarginMs: number;
}

export interface PublicationFields {
  draft?: boolean;
  pubDatetime: string | Date;
  modDatetime?: string | Date | null;
}

export function isPublished(post: PublicationFields, context: PublicationContext): boolean {
  return !post.draft && (context.development || context.now > new Date(post.pubDatetime).getTime() - context.scheduledMarginMs);
}

export function publishedPosts<T extends PublicationFields>(posts: readonly T[], context: PublicationContext): T[] {
  return posts.filter(post => isPublished(post, context)).toSorted((a, b) =>
    Math.floor(new Date(b.modDatetime ?? b.pubDatetime).getTime() / 1000) -
    Math.floor(new Date(a.modDatetime ?? a.pubDatetime).getTime() / 1000));
}

export function postPath(sourcePath: string, slug?: string): string {
  const parts = sourcePath.replace(/^posts\//, "").replace(/\.mdx?$/, "").split("/");
  const id = slug || parts.map(part => githubSlug(part)).join("/").replace(/\/index$/, "");
  const name = id.split("/").at(-1)!;
  return `/posts/${[...parts.slice(0, -1).filter(part => !part.startsWith("_")).map(slugifyStr), name].join("/")}`;
}
