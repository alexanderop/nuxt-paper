import { defineCollection, defineContentConfig, z } from "@nuxt/content";

import { contentRoot, excludedPostSources } from "./build/content-source";
import { SITE } from "./shared/utils/site";

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: "page",
      source: {
        cwd: contentRoot,
        include: "posts/**/*.md",
        exclude: excludedPostSources(),
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        sourcePath: z.string(),
        slug: z.string().optional(),
        author: z.string().default(SITE.author),
        pubDatetime: z.string(),
        modDatetime: z.string().optional().nullable(),
        featured: z.boolean().optional(),
        draft: z.boolean().optional(),
        tags: z.array(z.string()).default(["others"]),
        ogImage: z.string().optional(),
        canonicalURL: z.string().optional(),
        hideEditPost: z.boolean().optional(),
        timezone: z.string().optional(),
      }),
    }),
    pages: defineCollection({
      type: "page",
      source: {
        cwd: contentRoot,
        include: "pages/**/*.md",
        prefix: "/",
      },
      schema: z.object({
        ogImage: z.string().optional(),
        canonicalURL: z.string().optional(),
      }),
    }),
  },
});
