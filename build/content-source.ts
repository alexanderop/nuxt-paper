import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "@nuxt/content";
import matter from "gray-matter";
import { isPublished, postPath, type PublicationContext } from "../shared/utils/publication";
import { POSTS } from "../shared/utils/site";

process.env.NUXT_PUBLICATION_NOW ??= String(Date.now());
export const publicationContext = {
  now: z.coerce.number().finite().parse(process.env.NUXT_PUBLICATION_NOW),
  development: process.argv.some(argument => argument === "dev"),
  scheduledMarginMs: POSTS.scheduledPostMargin,
};
export const contentRoot = resolve(process.env.NUXT_CONTENT_ROOT || "content");

export function excludedPostSources(root = contentRoot, context: PublicationContext = publicationContext): string[] {
  const excluded: string[] = [];
  const paths = new Map<string, string>();
  for (const entry of readdirSync(resolve(root, "posts"), { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const absolute = resolve(entry.parentPath, entry.name);
    const source = absolute.slice(root.length + 1);
    if (entry.name.startsWith("_")) { excluded.push(source); continue; }
    const parsed = z.object({
      title: z.string(),
      description: z.string(),
      pubDatetime: z.coerce.date(),
      modDatetime: z.coerce.date().nullable().optional(),
      draft: z.boolean().optional(),
      slug: z.string().regex(/^[^?#]+$/).refine(value => !value.split("/").some(part => !part || part === "." || part === ".."), "Invalid slug").optional(),
    }).safeParse(matter(readFileSync(absolute, "utf8")).data);
    if (!parsed.success) throw new Error(`Invalid frontmatter in ${source}: ${parsed.error.message}`);
    const data = parsed.data;
    const path = postPath(source, data.slug);
    if (/^\/posts\/\d+$/.test(path)) throw new Error(`Post path ${path} conflicts with pagination (${source})`);
    const previous = paths.get(path);
    if (previous) throw new Error(`Duplicate post path ${path}: ${previous} and ${source}`);
    paths.set(path, source);
    if (!isPublished(data, context)) excluded.push(source);
  }
  return excluded;
}
