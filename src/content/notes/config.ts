import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).max(3).default([]),
    related: z.array(z.string()).default([]),
    sources: z.array(z.object({
      label: z.string(),
      kind: z.enum(['notion', 'memory', 'site', 'external']),
    })).default([]),
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const collections = { notes };
