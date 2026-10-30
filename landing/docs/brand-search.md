# Adot brand search

## Identity and destinations

Use **Adot Technologies** as the company name and **Adot** as its short name. The owner confirmed that “Adot Systems” and “Adot Tech” are search targets, not alternate company names. Do not put them in `alternateName`, rename business profiles to match them, or make near-duplicate pages for these queries.

The canonical website is https://www.adotsystems.tech/. The company is based at City Point Hub, 22 Mazoria, Addis Ababa, Ethiopia. Company facts live in `src/data/site.ts`.

| Query group | Examples | Primary destination |
| --- | --- | --- |
| Brand | adot, adot technologies, adot technology | `/` |
| Brand and location | adot ethiopia, adot technologies ethiopia, adot addis ababa | `/` and `/about/` |
| Search variants | adot systems, adot tech, adot systems ethiopia, adot tech ethiopia | `/` |
| Misspellings | adot ethoipia, adot technolgies, adot technologes | `/`; monitor without publishing deliberate misspellings |
| Brand and service | adot software, adot web development, adot app development | `/services/` and the relevant service page |
| Projects | adot erp, adot faith import trade, adot wtb | The corresponding product or project page |

The aim is strong visibility for searches about this company, first in Ethiopia and then in other markets. A worldwide first position for every occurrence of “adot” is not an acceptance criterion that the site can guarantee.

## Implemented foundation

- Homepage title leads with the brand and identifies Ethiopia. Visible copy connects the company, services, and Addis Ababa location.
- The About page identifies the software company and its team. A homepage question makes the office location explicit.
- The existing LocalBusiness and WebSite graphs share the genuine company identity and canonical URL.
- Each project page attributes the work to Adot Technologies, links to the company and service, and provides matching CreativeWork structured data.
- The sitemap, canonical URLs, indexability, metadata uniqueness, internal links, company identity, and project attribution are checked against the production build by `pnpm audit:seo`.

Run `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm audit:seo` before publishing. The current Astro adapter and observed production deployment are Vercel; the older Cloudflare deployment notes in the README do not describe the live publishing path. Check the GitHub deployment status for the exact commit, then verify the public HTML and sitemap.

## Search engine setup

Google's domain property `adotsystems.tech` was already verified on 30 October 2026. The sitemap at https://www.adotsystems.tech/sitemap-index.xml was submitted and its detail page reported “Sitemap index processed successfully.” The initial “Couldn't fetch” status cleared during processing. Processing a sitemap does not guarantee indexing or ranking; inspect its discovered pages and indexing report after Google crawls the updated site.

Use URL Inspection for the homepage, About page, and priority service/project pages. Check the selected canonical, live fetch, and indexability. Request indexing after meaningful published changes. Do not repeatedly submit unchanged pages.

In Bing Webmaster Tools, use the same canonical website and sitemap. Finish ownership verification in the owner's account. Any verification file or token must come from Bing; do not invent one. Do not claim submission or verification until its dashboard confirms success.

## Measurement

Use the Google Search Console domain property, Search type **Web**, and compare the latest complete 28 days with the previous 28 days. Keep the 3-month view for context. Enable clicks, impressions, CTR, and average position.

1. Under **Query → Custom (regex) → Matches regex**, use `(?i)\badot\b`. This includes the listed company-name suffixes and misspellings while retaining the genuine brand token.
2. Review individual rows for every query group above. A missing low-volume query is **unreported**, not proof of zero searches or a particular rank.
3. Record the global view, then apply **Country → Ethiopia** and record that view separately. Review other countries with actual impressions rather than claiming coverage everywhere.
4. Review Pages to see whether the homepage or another page appears for branded searches. An unrelated page appearing consistently is a reason to improve relevance and internal linking.
5. Export Queries, Countries, Pages, and Dates for each reporting period. Keep exports and account-level metrics in a private location, outside this public repository.

Average position is an aggregate across observed impressions, devices, locations, and results. It is not a universal live rank. Search Console can omit anonymized queries, and filtered totals can differ from site totals. Track inquiries separately from visibility; ranking movement alone is not a business outcome.

Review indexing after publication, then compare completed 28-day periods. Keep factual notes about deployment dates and content updates alongside the reports. This document does not create a recurring automation.

## Profiles and earned mentions

Use this factual profile description on confirmed official accounts:

> Adot Technologies is a software company based in Addis Ababa, Ethiopia. We design and build websites, mobile apps, and custom software for businesses across Africa.

Use the same website, business name, address, and contact details as the site. Add only confirmed official profile URLs to the site and `sameAs`; an account belonging to another Adot must never be linked as this company. A Google Business Profile should use the real business name and meet Google's eligibility requirements.

Start earned links with the existing clients Faith Import & Trade and WTB Import and Export, and genuine partners. Where appropriate and approved by the client, a portfolio mention or website credit can link to the matching project page. Do not buy ranking links, invent endorsements, or manufacture directory listings. Contacting clients and publishers requires a specific outreach instruction and recipient list; nothing in this implementation sends messages to them.

## Case studies awaiting evidence

The portfolio currently verifies that Adot built company landing websites for Faith Import & Trade and WTB Import and Export, and that Adot ERP is the company's own business software. Keep these existing pages as the destinations rather than publishing competing case-study URLs.

For each client page, collect the live site URL, original brief, actual delivered scope, decisions and constraints, launch date, and permission to publish client material. Add before/after screenshots and measurable outcomes only when supplied and approved. A client quote must be attributable and authorized. Where metrics are unavailable, describe the delivered work without numeric success claims.

Official social-profile URLs and deeper client project evidence have not yet been provided. These are dependencies for profile updates and substantial case studies, not blockers for the implemented metadata, identity, and indexing improvements.

## References

- [Google: choosing an SEO and ranking guarantees](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: using Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start)
- [Google: sitemap reports and fetch errors](https://support.google.com/webmasters/answer/7451001)
- [Bing Webmaster Tools](https://www.bing.com/webmasters/)
