import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(), shortTitle: z.string(), order: z.number(), description: z.string(),
    intro: z.string(), image: z.string(), imageAlt: z.string(), icon: z.string(),
    features: z.array(z.string()), process: z.array(z.object({ title: z.string(), description: z.string() })),
    source: z.url(),
  }),
});
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), order: z.number(), category: z.string(), client: z.string(),
    description: z.string(), image: z.string(), imageAlt: z.string(),
    overview: z.string(), service: z.string(), source: z.url(),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(), order: z.number(), date: z.string(), category: z.string(),
    image: z.string(), imageAlt: z.string(), source: z.url(),
  }),
});
export const collections = { services, projects, articles };
