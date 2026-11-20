/**
 * Sitemap of articles and projects, rendered on demand (CDN-cached) so content published
 * after the last deploy is listed too. The static pages are in /sitemap-index.xml.
 */
import type { APIRoute } from 'astro';
import { getDetailPath, getRoutePath, isLocale, locales } from '@/i18n/config';
import { cacheOnCdn } from '@/lib/live';
import { sanityClient } from '@/lib/sanity/client';
import { CONTENT_URLS_QUERY } from '@/lib/sanity/queries';

export const prerender = false;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? url;
  const items = await sanityClient.fetch(CONTENT_URLS_QUERY);
  const latest = items[0]?.updatedAt;
  const entries = [
    ...locales.flatMap((locale) =>
      (['projects', 'articles'] as const).map((key) => ({ loc: new URL(getRoutePath(key, locale), base).href, lastmod: latest })),
    ),
    ...items.flatMap((item) =>
      item.slug && isLocale(item.language)
        ? [{
            loc: new URL(getDetailPath(item._type === 'project' ? 'projects' : 'articles', item.language, item.slug), base).href,
            lastmod: item.updatedAt,
          }]
        : [],
    ),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${escape(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  const headers = new Headers({ 'Content-Type': 'application/xml; charset=utf-8' });
  cacheOnCdn(headers, 3600);
  return new Response(body, { headers });
};
