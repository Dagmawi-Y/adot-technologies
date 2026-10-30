import { site } from '@/data/site';

export const organizationId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;

export function canonicalUrl(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0];
  const normalized = pathname === '/' || /\.[a-z0-9]+$/i.test(pathname) ? pathname : `${pathname.replace(/\/+$/, '')}/`;
  return new URL(normalized, site.url).href;
}

export function pageSchema(path: string, title: string, description: string, image: string) {
  const url = canonicalUrl(path);
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  const labels: Record<string, string> = { services: 'Services', projects: 'Our work', products: 'Products', 'adot-labs': 'Adot Labs', blog: 'Journal', about: 'Our company', contact: 'Contact', privacy: 'Privacy notice', terms: 'Terms of Service' };
  const breadcrumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') }, ...parts.map((part, index) => ({
    '@type': 'ListItem', position: index + 2, name: index === parts.length - 1 ? title : labels[part] ?? part,
    item: canonicalUrl(`/${parts.slice(0, index + 1).join('/')}/`),
  }))];
  const type = path.startsWith('/about') ? 'AboutPage' : path.startsWith('/contact') ? 'ContactPage' : ['services', 'projects', 'blog'].includes(parts[0]) && parts.length === 1 ? 'CollectionPage' : 'WebPage';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness', '@id': organizationId, name: site.name, alternateName: site.shortName, url: canonicalUrl('/'),
        description: site.description, logo: new URL('/images/adot-logo.png?v=2', site.url).href,
        image, email: site.email, telephone: site.phoneHref, address: site.postalAddress,
        areaServed: { '@type': 'Continent', name: 'Africa' },
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: site.hours.opens, closes: site.hours.closes }],
        contactPoint: [{ '@type': 'ContactPoint', telephone: site.phoneHref, email: site.email, contactType: 'sales', availableLanguage: ['English'], areaServed: { '@type': 'Continent', name: 'Africa' } }],
      },
      ...(parts.length === 0 ? [{ '@type': 'WebSite', '@id': websiteId, name: site.name, alternateName: site.shortName, url, publisher: { '@id': organizationId }, inLanguage: 'en' }] : []),
      {
        '@type': type, '@id': url, url, name: title, description, inLanguage: 'en',
        isPartOf: { '@id': websiteId }, about: { '@id': organizationId },
        primaryImageOfPage: { '@type': 'ImageObject', url: image },
        ...(parts.length ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      },
      ...(parts.length ? [{ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: breadcrumbs }] : []),
    ],
  };
}
