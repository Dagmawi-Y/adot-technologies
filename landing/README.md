# Adot Technologies

An Astro site based on the approved Fieldwork design reference, with Adot Technologies content and branding. Marketing pages are prerendered; the enquiry endpoint runs on Cloudflare Workers.

## Development

Use Node.js 22.23.4 or newer and pnpm.

```sh
pnpm install
pnpm astro dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

Open http://localhost:4321. The project pins TypeScript 6 because the installed Astro checker does not support TypeScript 7. The Cloudflare compatibility date is pinned to a date supported by the installed workerd runtime.

```sh
pnpm check
pnpm test
pnpm build
```

The tests mock Resend and never send an email. They cover validation, email/header safety, honeypot rejection, origin checks, body limits, duplicate retry keys, provider/network failures, missing credentials, and submissions without JavaScript.

## Content and branding

- Services, projects, and article cards live in `src/content/` with schemas in `src/content.config.ts`.
- Company details, founders, and FAQs live in `src/data/site.ts`.
- `src/components/site/` contains shared layouts and sections; `src/styles/reference.css` preserves the reference geometry, and `global.css` contains Adot adaptations and design tokens.
- `public/images/adot-logo.png` is the original updated logo supplied by the owner. The Brand component frames the transparent artwork through an SVG viewBox without altering the source. The dark header/footer use CSS inversion; the favicon embeds the same original artwork on white.
- Office imagery, founders, service illustrations, and project screenshots were sourced from the existing Adot website. Their use here does not add claims about project outcomes, technologies, metrics, or client ratings.

Verified sources: [Adot homepage](https://www.adotsystems.tech/), [company](https://www.adotsystems.tech/about), and the corresponding service pages linked in each content record. The reference is [Fieldwork](https://fieldwork-theme.pages.dev/).

The two published article bodies returned HTTP 500 during migration. Their cards link to their original URLs. Products, Adot Labs, and Terms also retain their original destinations. Those destinations must remain available separately if this site replaces the existing production domain.

## Configure real enquiry delivery

1. Create a Resend API key and verify a sending domain in Resend. Choose a sender mailbox on that verified domain.
2. For local development, copy `.dev.vars.example` to `.dev.vars` and set:

   ```dotenv
   RESEND_API_KEY=your_resend_api_key
   CONTACT_FROM_EMAIL=website@your-verified-domain.example
   ```

3. Restart the background development server after changing local secrets.
4. Submit the Contact form and confirm delivery to **contact@adotsystems.tech**. The visitor’s address is Reply-To; it is never used as the sender.

The endpoint is `POST /api/contact`. It accepts JSON or URL-encoded form data with `name`, `email`, optional `phone`, optional `company`, `service`, `message`, an empty `website` honeypot, and an optional stable `requestId`. JSON callers receive `{ ok, message, fields? }`; ordinary form submissions receive a result page.

Successful feedback appears only after Resend accepts the message and returns an email ID. Missing configuration returns HTTP 503. Provider failures return HTTP 502. Browser submissions preserve their fields on errors; retries use the same Resend idempotency key. Acceptance by Resend is not proof of arrival in the recipient’s inbox.

Do not commit `.dev.vars`, real API keys, or production secrets. The endpoint does not log enquiry contents. Cloudflare observability is enabled for request/runtime diagnostics.

## Cloudflare deployment

This Astro adapter targets **Cloudflare Workers**, rather than Cloudflare Pages. No deployment has been performed.

1. Set the desired Worker name in `wrangler.jsonc` and confirm the canonical domain in `astro.config.mjs` and `src/data/site.ts`.
2. Authenticate with Cloudflare using `pnpm exec wrangler login`.
3. Build the production site with `pnpm build`.
4. Set Worker secrets using the Cloudflare dashboard, or enter them interactively:

   ```sh
   pnpm exec wrangler secret put RESEND_API_KEY
   pnpm exec wrangler secret put CONTACT_FROM_EMAIL
   ```

5. Run `pnpm deploy` when ready to publish. Configure the production domain in Cloudflare.
6. Submit one real enquiry and confirm receipt before treating delivery as verified. The `contact@adotsystems.tech` inbox must exist and accept mail.

No CMS, analytics, newsletter subscription, or new legal terms are included. The Contact page explains how enquiry details are sent to Adot through Resend.
