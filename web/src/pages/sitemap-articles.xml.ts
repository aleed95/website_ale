/**
 * Sitemap of the articles, rendered on demand (CDN-cached) so articles published after
 * the last deploy are listed too. The static pages are in /sitemap-index.xml.
 */
import type { APIRoute } from 'astro';
import { getDetailPath, getRoutePath, locales } from '@/i18n/config';
import { cacheOnCdn } from '@/lib/live';
import { sanityClient } from '@/lib/sanity/client';
import { ARTICLE_URLS_QUERY } from '@/lib/sanity/queries';

export const prerender = false;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? url;
  const articles = await sanityClient.fetch(ARTICLE_URLS_QUERY);
  const entries = [
    ...locales.map((locale) => ({ loc: new URL(getRoutePath('articles', locale), base).href, lastmod: articles[0]?.updatedAt })),
    ...articles.flatMap((a) =>
      a.slug && (a.language === 'it' || a.language === 'en')
        ? [{ loc: new URL(getDetailPath('articles', a.language, a.slug), base).href, lastmod: a.updatedAt }]
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
