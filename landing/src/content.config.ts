import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(), shortTitle: z.string(), order: z.number(), description: z.string(),
    intro: z.string(), image: z.string(), imageAlt: z.string(), icon: z.string(),
    seoTitle: z.string(), seoDescription: z.string(), useCases: z.array(z.string()),
    questions: z.array(z.object({ question: z.string(), answer: z.string() })), guideSlugs: z.array(z.string()),
    features: z.array(z.string()), process: z.array(z.object({ title: z.string(), description: z.string() })),
    source: z.url(),
  }),
});
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), order: z.number(), category: z.string(), client: z.string(),
    description: z.string(), image: z.string(), imageAlt: z.string(),
    overview: z.string(), scope: z.array(z.string()).min(1), service: z.string(), source: z.url(),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    order: z.number(), date: z.iso.date(), updatedDate: z.iso.date().optional(), category: z.string(),
    description: z.string(), seoTitle: z.string().optional(), image: z.string(), imageAlt: z.string(),
    sections: z.array(z.object({
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string(),
      paragraphs: z.array(z.string()).min(1), bullets: z.array(z.string()).optional(),
      steps: z.array(z.string()).optional(),
      table: z.object({
        caption: z.string(), columns: z.array(z.string()).min(2), rows: z.array(z.array(z.string())).min(1),
      }).refine(table => table.rows.every(row => row.length === table.columns.length), 'Every table row must match its columns').optional(),
      sources: z.array(z.object({ label: z.string(), url: z.url() })).optional(),
      links: z.array(z.object({ label: z.string(), href: z.string().regex(/^\/(?!\/)/) })).optional(),
    })).min(1).refine(sections => new Set(sections.map(section => section.id)).size === sections.length, 'Section IDs must be unique'),
  }),
});
export const collections = { services, projects, articles };
