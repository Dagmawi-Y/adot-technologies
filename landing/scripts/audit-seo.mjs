import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Run against the actual prerendered output, not component source strings.
const root = path.resolve('dist/client');
const origin = 'https://www.adotsystems.tech';
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, entity => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&lt;': '<', '&gt;': '>' })[entity]);
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
const files = await walk(root);
const pages = new Map();
for (const file of files.filter(file => file.endsWith('.html') && !file.endsWith('/404.html'))) {
  const route = `/${path.relative(root, file).replace(/index\.html$/, '')}`;
  const html = await readFile(file, 'utf8');
  pages.set(route, { html, file });
}
const titles = new Set(), descriptions = new Set();
for (const [route, { html }] of pages) {
  const context = ` (${route})`;
  const titlesOnPage = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)];
  assert.equal(titlesOnPage.length, 1, 'One title' + context);
  const title = decode(titlesOnPage[0][1]);
  assert.ok(title.length > 15 && title.length < 110, 'Descriptive title' + context);
  assert.ok(!titles.has(title), 'Unique title' + context); titles.add(title);
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attrs(match[0]));
  const description = meta.filter(item => item.name === 'description');
  assert.equal(description.length, 1, 'One description' + context);
  assert.ok(description[0].content.length >= 70, 'Useful description' + context);
  assert.ok(!descriptions.has(description[0].content), 'Unique description' + context); descriptions.add(description[0].content);
  assert.ok(!meta.find(item => item.name === 'robots').content.includes('noindex'), 'Indexable' + context);
  const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map(match => attrs(match[0])).filter(item => item.rel === 'canonical');
  assert.deepEqual(canonical.map(item => item.href), [origin + route], 'Self canonical' + context);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'One main heading' + context);
  assert.ok(html.includes('<html lang="en"'), 'Language' + context);
  const socialImage = meta.find(item => item.property === 'og:image');
  assert.ok(socialImage?.content.startsWith(origin + '/_astro/'), 'Optimized social image' + context);
  const schema = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(([, value]) => { const data = JSON.parse(value); return data['@graph'] ?? [data]; });
  const business = schema.find(item => item['@type'] === 'LocalBusiness');
  assert.equal(business?.address.addressLocality, 'Addis Ababa', 'Real business location' + context);
  assert.equal(business.areaServed.name, 'Africa', 'Africa service area' + context);
  assert.equal(business.openingHoursSpecification[0].opens, '08:30');
  assert.equal(business.openingHoursSpecification[0].closes, '17:30');
  assert.equal(business.telephone, '+251948435765');
  if (route === '/') assert.ok(schema.find(item => item['@type'] === 'WebSite'), 'Homepage site identity');
  else {
    const crumbs = schema.find(item => item['@type'] === 'BreadcrumbList');
    assert.equal(crumbs?.itemListElement.at(-1).item, origin + route, 'Breadcrumb target' + context);
  }
  if (/^\/services\/[^/]+\/$/.test(route)) assert.ok(schema.find(item => item['@type'] === 'Service'), 'Service schema' + context);
  if (/^\/blog\/[^/]+\/$/.test(route)) {
    const article = schema.find(item => item['@type'] === 'BlogPosting');
    assert.equal(article?.mainEntityOfPage['@id'], origin + route, 'Article identity' + context);
    assert.ok(article.citation.length >= 3, 'Researched sources' + context);
    assert.ok(/T.*\+03:00$/.test(article.datePublished), 'Dated article' + context);
  }
  for (const [, tag] of html.matchAll(/(<img\b[^>]*>)/g)) {
    const image = attrs(tag);
    assert.ok(Object.hasOwn(image, 'alt'), 'Image alternative' + context);
    assert.ok(image.width && image.height, 'Image dimensions' + context);
    if (image.src?.startsWith('/_astro/')) assert.ok(image.srcset && image.sizes, 'Responsive image' + context);
  }
  for (const [, tag] of html.matchAll(/(<a\b[^>]*>)/g)) {
    const { href } = attrs(tag);
    if (!href || /^(?:mailto:|tel:|javascript:)/.test(href)) continue;
    const url = new URL(href, origin + route);
    if (url.origin !== origin) continue;
    const target = pages.get(url.pathname);
    if (target) {
      if (url.hash) assert.ok(target.html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), 'Anchor exists: ' + href + context);
    } else {
      assert.ok(files.includes(path.join(root, decodeURIComponent(url.pathname))), 'Internal destination exists: ' + href + context);
    }
  }
}
const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => value);
assert.deepEqual(sitemapUrls.sort(), [...pages.keys()].map(route => origin + route).sort(), 'Sitemap equals indexable pages');
assert.equal([...sitemap.matchAll(/<lastmod>/g)].length, 3, 'Real article update dates');
assert.ok((await readFile(path.join(root, 'robots.txt'), 'utf8')).includes('Sitemap: ' + origin + '/sitemap-index.xml'));
const notFound = await readFile(path.join(root, '404.html'), 'utf8');
assert.ok(notFound.includes('content="noindex,follow"') && !notFound.includes('rel="canonical"'), '404 excluded');
const redirects = await readFile(path.join(root, '_redirects'), 'utf8');
for (const slug of ['website-vs-mobile-app', 'erp-vs-custom-software']) {
  assert.ok(redirects.includes(`/blog/${slug}-ethiopia/ /blog/${slug}-africa/ 301`), 'Regional migration redirect');
}
for (const slug of ['top-5-trends-shaping-web-development-in-2024', 'how-to-create-a-winning-business-plan-for-startups', 'a-clearer-brief-a-better-first-conversation']) {
  assert.ok(!pages.has(`/blog/${slug}/`) && !redirects.includes(slug), 'Unrelated retired article remains absent');
}
// The original artwork must survive; only delivery is optimized.
assert.ok((await stat('src/assets/images/office.png')).size > 1_000_000);
console.log(`PASS: ${pages.size} pages — unique metadata, canonical URLs, structured data, sitemap, internal links and anchors, image attributes, and article migrations.`);
