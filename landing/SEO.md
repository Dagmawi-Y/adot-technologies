# Search plan and verification

Implemented and checked locally on 28 October 2026. The intended market is businesses across Africa. Adot remains based in Addis Ababa, Ethiopia; the site does not imply offices in other countries. The owner confirmed that Google Search Console and Google Business Profile are both verified. Their private data and settings were not accessed during this work.

## Pages and search intent

| Page | Main intent | Useful next step |
| --- | --- | --- |
| `/` | Web, app, and software development in Africa | Explore services and contact the team |
| `/services/web-development/` | Website development for African businesses | Assess scope, editing, integrations, and costs |
| `/services/web-design/` | Website design for African businesses | Discuss content, navigation, redesign, and handover |
| `/services/app-development/` | Mobile app development for African businesses | Decide whether an app is justified and plan a pilot |
| `/services/custom-software/` | Custom business software for African businesses | Compare ERP, configuration, integration, and custom development |
| `/blog/website-development-cost-ethiopia/` | Compare website development quotations in Ethiopia | Read dated provider examples and a scope checklist |
| `/blog/website-vs-mobile-app-africa/` | Choose a website, PWA, or mobile app | Evaluate adoption, offline behavior, and payment confirmation |
| `/blog/erp-vs-custom-software-africa/` | Choose ERP or custom software for an African SME | Map a workflow and run a realistic vendor demonstration |
| `/projects/` and project pages | Evaluate Adot's published work | Review actual scope and discuss a related project |
| `/products/` and product pages | Find Adot ERP or Youthopia | Ask about product fit and current availability |
| `/about/`, `/contact/`, `/adot-labs/` | Company identity, enquiries, and Labs participation | Find the real team, location, hours, and contact options |

These are intent assignments, not measured search-volume or ranking estimates. Country-specific articles should retain their actual country scope. Add further country or industry pages when there is distinct expertise, local information, or a real project to support them.

## Technical implementation

- Prerendered, crawlable pages with one main heading, unique titles and descriptions, absolute self canonicals, English language declarations, and social previews.
- Shared business identity with the real address, phone, email, owner-confirmed Monday–Saturday hours (08:30–17:30 EAT), and Africa service area. Homepage `WebSite`, page/breadcrumb data, service data, and article authorship, dates, and source citations. No fabricated ratings, offices, prices, or coordinates.
- A canonical sitemap covering all 22 indexable pages; article dates derive from publication/update fields. Robots permits public pages and references the sitemap. Error pages have `noindex` and no canonical.
- Permanent redirects from the two recent Ethiopia app/ERP decision-guide slugs to their equivalent Africa guides. The three unrelated original articles remain 404s. Standard slash normalization is handled by Astro/Cloudflare.
- Responsive WebP image variants with sizes, intrinsic dimensions, descriptive alternatives, lazy loading below the fold, and priority loading for the main page image. Social previews use generated 1200×630 JPEGs. Original hero artwork and actual portraits/logos are preserved.
- A self-hosted Latin variable font, preloaded with a swap display strategy. No third-party tracking or speculative resource connections were added.
- Product and Labs URLs are preserved locally using the published product and programme scope; their links will continue working when this site replaces the old production site.

## Verification

`pnpm check`, `pnpm test`, `pnpm build`, and `pnpm audit:seo` pass. The checker reports zero errors, warnings, or hints; all 10 existing tests pass. The generated-output audit checks 22 pages for metadata uniqueness, canonicals, structured data, real contact facts, sitemap coverage, internal links and anchors, image attributes, and article migration rules.

Isolated Chrome checks covered all three guides and changed page types at desktop and 390px mobile widths. They checked loaded images, horizontal overflow, founder portrait placement, service FAQ interaction, guide table keyboard scrolling, and fresh metadata after client navigation. No browser runtime exceptions occurred. Local production HTTP checks confirmed public sitemap/robots access, migration 301s, and retired/unknown page 404s.

Lighthouse used its default mobile performance configuration against the local production preview, with a fresh isolated headless Chrome profile. These are lab measurements, not production field Core Web Vitals or rankings. Details are retained in `docs/seo-measurements.json`.

| Homepage metric | Baseline | Final |
| --- | --- | --- |
| Performance score | 75/100 | 98/100 |
| Basic SEO score | 100/100 | 100/100 |
| Largest Contentful Paint | 35.16s | 2.26s |
| Cumulative Layout Shift | 0.002 | 0 |
| Transferred resources | 8,235,149 bytes | 272,775 bytes |

The baseline already passed Lighthouse's basic SEO checks. The additional content, schema, link, and migration work addresses concerns that its score alone does not measure. The large measured speed improvement comes primarily from image delivery.

## After publication

This work has not been deployed. The private Google accounts have not been changed.

1. Publish to the intended production hostname, `https://www.adotsystems.tech`. Configure permanent redirects from HTTP and the alternate hostname to it in the hosting/domain settings. Verify this on production; local tests do not prove DNS, TLS, host redirects, or CDN behavior.
2. Confirm that the current Search Console property and Google Business Profile are retained. Existing DNS verification should remain intact when changing hosting. Use the same verified business identity, public contact details, and website URL; the Africa service market does not imply physical premises across the continent.
3. Submit `https://www.adotsystems.tech/sitemap-index.xml` in the existing Search Console property. Inspect the homepage, four service pages, and three guides with the live URL tool after deployment. Check rendered content, crawl access, chosen canonicals, and any reported structured-data issues.
4. Verify the two guide migrations on production. Review old indexed URLs and external links in Search Console before adding any further redirects; match genuinely equivalent content rather than sending unrelated URLs to the homepage.
5. Review queries, impressions, clicks, landing pages, and countries regularly. Compare four-week periods and separate branded searches from service searches. Prioritize the African markets actually producing relevant enquiries rather than guessing from continent-wide wording.
6. Use genuine project evidence to improve service and portfolio pages over time: the client's problem, delivered scope, constraints, screenshots, and outcomes the client permits Adot to publish. Seek appropriate credit links from real client or partner sites through normal relationships; no outreach was performed here.
7. Recheck cited prices before changing article update dates. Update dates when the content is materially reviewed or changed. Add further guides when they answer an observed buyer question with specific evidence.
8. Check production mobile performance and Search Console field Core Web Vitals once sufficient real-user data exists. If conversion measurement is added, use actual enquiry completion events and update the privacy notice to reflect the selected tool and practices.

The implementation follows [Google's SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [local business structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business), and [article structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/article). The article sources are also linked beside the relevant claims on each guide.
