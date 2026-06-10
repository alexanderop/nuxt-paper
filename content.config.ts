import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: "page",
      source: {
        include: "posts/**/*.md",
        exclude: ["posts/**/_*", "posts/**/_*/**"],
      },
      schema: z.object({
        author: z.string().optional(),
        pubDatetime: z.date(),
        modDatetime: z.date().optional().nullable(),
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
