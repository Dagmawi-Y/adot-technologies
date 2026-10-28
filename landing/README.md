# Adot Technologies

Company website built with Astro, TypeScript, and Tailwind CSS, deployed on Cloudflare Workers.

## Getting started

Requires Node.js 22.23.4 or newer and pnpm.

```sh
cd landing
pnpm install
pnpm astro dev --background
```

Open http://localhost:4321.

```sh
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

## Commands

```sh
pnpm check       # Type checking
pnpm test        # Run tests
pnpm build       # Production build
pnpm audit:seo   # Audit the production build
```

## Project structure

- `src/pages/` — Pages and API routes
- `src/components/` — Shared components
- `src/content/` — Services, projects, and articles
- `src/data/` — Company and product information
- `src/assets/` — Optimized image sources
- `src/styles/` — Stylesheets
- `public/` — Static files

## Configuration

Copy `.dev.vars.example` to `.dev.vars` and set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` for contact form delivery. Use a verified sending domain in Resend. Keep secrets out of version control.

## Deployment

Configure the Worker and domain in `wrangler.jsonc`, `astro.config.mjs`, and `src/data/site.ts`. Set the contact form secrets in Cloudflare, then run:

```sh
pnpm build
pnpm deploy
```
