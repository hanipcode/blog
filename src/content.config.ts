import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    locale: z.enum(['en', 'id']),
    originalLocale: z.enum(['en', 'id']).optional(),
    translationKey: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    devOnly: z.boolean().default(false),
    canonicalUrl: z.url().optional(),
    sourceHash: z.string().optional(),
  }),
});

export const collections = { posts };
