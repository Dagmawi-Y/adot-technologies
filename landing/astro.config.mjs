// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.adotsystems.tech',
  trailingSlash: 'ignore',
  adapter: cloudflare({ imageService: 'passthrough', prerenderEnvironment: 'node' }),
  integrations: [react(), sitemap({ filter: page => !page.endsWith('/404/') })],
  vite: { plugins: [tailwindcss()] },
});
