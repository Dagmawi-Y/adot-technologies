// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Publication dates belong to the content, rather than the build timestamp.
const articleDates = Object.fromEntries(readdirSync(new URL('./src/content/articles/', import.meta.url))
  .filter(file => file.endsWith('.json')).map(file => {
    const article = JSON.parse(readFileSync(new URL(`./src/content/articles/${file}`, import.meta.url), 'utf8'));
    return [`/blog/${article.slug}/`, article.updatedDate ?? article.date];
  }));

// https://astro.build/config
export default defineConfig({
  site: 'https://www.adotsystems.tech',
  trailingSlash: 'always',
  adapter: cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  integrations: [react(), sitemap({
    filter: page => !/^\/(?:404(?:\.html|\/)?|api\/)/.test(new URL(page).pathname),
    serialize: item => {
      const date = articleDates[new URL(item.url).pathname];
      return date ? { ...item, lastmod: date } : item;
    },
  })],
  vite: { plugins: [tailwindcss()] },
});
