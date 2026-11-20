/**
 * "Sito in costruzione" mode — like WordPress maintenance mode, for a static site.
 *
 * Netlify environment variables (Site configuration → Environment variables,
 * scope must include "Edge Functions"):
 *   COMING_SOON     "true" to show the under-construction page to visitors.
 *                   Any other value (or unset) → the site is public.
 *   PREVIEW_SECRET  Long random string. Open https://<site>/?anteprima=<secret> once:
 *                   a 30-day cookie lets that browser see the real site.
 *                   ?anteprima=esci removes the cookie (to see what visitors see).
 *
 * Changing these variables needs a new deploy (Deploys → Trigger deploy).
 */
import type { Config, Context } from '@netlify/edge-functions';

const COOKIE = 'anteprima';
const PARAM = 'anteprima';
const COMING_SOON_PATH = '/in-costruzione/';
const THIRTY_DAYS = 60 * 60 * 24 * 30;

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function redirectWithoutParam(url: URL, cookie: string): Response {
  url.searchParams.delete(PARAM);
  return new Response(null, {
    status: 302,
    headers: { Location: `${url.pathname}${url.search}`, 'Set-Cookie': cookie, 'Cache-Control': 'no-store' },
  });
}

export default async function comingSoon(request: Request, context: Context): Promise<Response | void> {
  if (Netlify.env.get('COMING_SOON') !== 'true') return; // public: serve the site normally

  const url = new URL(request.url);
  const secret = Netlify.env.get('PREVIEW_SECRET') ?? '';
  const token = secret.length >= 16 ? await sha256(secret) : null;
  const param = url.searchParams.get(PARAM);

  // Unlock / lock this browser.
  if (token && param === secret) {
    return redirectWithoutParam(url, `${COOKIE}=${token}; Path=/; Max-Age=${THIRTY_DAYS}; HttpOnly; Secure; SameSite=Lax`);
  }
  if (param === 'esci') {
    return redirectWithoutParam(url, `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  }

  // Robots must not crawl anything while the site is under construction.
  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // Unlocked browser: the real site, still hidden from search engines.
  if (token && context.cookies.get(COOKIE) === token) {
    const response = await context.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Everyone else: the under-construction page, with "temporarily unavailable" status.
  // Start from the static page's headers so the security headers of netlify.toml are kept.
  const page = await fetch(new URL(COMING_SOON_PATH, url));
  const headers = new Headers(page.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Retry-After', '86400');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Cache-Control', 'no-store');
  return new Response(page.body, { status: 503, headers });
}

export const config: Config = {
  path: '/*',
  // Assets the under-construction page needs, and the page itself.
  excludedPath: ['/_astro/*', '/favicon.svg', '/apple-touch-icon.png', COMING_SOON_PATH],
};
