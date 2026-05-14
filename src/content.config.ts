import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const langField = z.enum(['pt', 'es']);

const paginas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/paginas' }),
  schema: z.object({
    title: z.string(),
    lang: langField,
    slug: z.string().optional(),
    description: z.string().optional(),
    order: z.number().default(99),
    hero: z.string().optional(),
    updated: z.coerce.date().optional(),
  }),
});

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    lang: langField,
    slug: z.string().optional(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('REDALINT'),
    featured: z.boolean().default(false),
  }),
});

const equipe = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/equipe' }),
  schema: z.object({
    name: z.string(),
    lang: langField.default('pt'),
    role: z.string().optional(),
    affiliation: z.string().optional(),
    photo: z.string().optional(),
    order: z.number().default(99),
    links: z
      .object({
        lattes: z.string().url().optional(),
        orcid: z.string().url().optional(),
        site: z.string().url().optional(),
        email: z.string().email().optional(),
      })
      .partial()
      .optional(),
  }),
});

export const collections = { paginas, noticias, equipe };
