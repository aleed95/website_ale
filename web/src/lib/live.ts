/**
 * Pages rendered on demand for the public (articles): cached on Netlify's CDN so the
 * function runs at most about once every 5 minutes per page, while a newly published
 * article still shows up within minutes, without a deploy.
 */
export function cacheOnCdn(headers: Headers, seconds = 300): void {
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Netlify-CDN-Cache-Control', `public, durable, s-maxage=${seconds}, stale-while-revalidate=604800`);
}
