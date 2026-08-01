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
      /* Added 2026-08-01. The sources array rendered as plain text with no
         address field, so a row of kind 'site' named a page on this site that
         the reader could not click. Three such rows pointed at a page that
         had been deleted, and a fourth pointed at a live essay and was
         equally unreachable. "The portfolio becomes reachable from the
         essays" is not a thing an address-less array can do.
         OPTIONAL, so all 28 existing note files validate unchanged. */
      href: z.string().optional(),
    })).default([]),
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const collections = { notes };
