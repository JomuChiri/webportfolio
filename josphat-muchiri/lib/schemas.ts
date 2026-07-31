import { z } from "zod";

export const contentMetaSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  date: z.coerce.date(),
  status: z.string().default("Published"),
  featured: z.boolean().default(false),
  category: z.string().default("General"),
  difficulty: z.string().default("Foundational"),
  stack: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  github: z.string().optional().nullable(),
  documentation: z.string().optional().nullable(),
  mitre: z.array(z.string()).default([]),
  order: z.number().default(100)
});

export type ContentMeta = z.infer<typeof contentMetaSchema> & {
  slug: string;
  section: string;
  href: string;
  readingMinutes: number;
};

