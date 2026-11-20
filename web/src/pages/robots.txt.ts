import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).href;
  const articlesSitemap = new URL('sitemap-articles.xml', site).href;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapUrl}`, `Sitemap: ${articlesSitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
