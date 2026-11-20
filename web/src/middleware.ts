/**
 * Runs only for on-demand requests (the /anteprima/ preview); static pages are untouched.
 * With a valid preview cookie it switches the Sanity context to drafts + click-to-edit,
 * relaxes the page CSP just enough for the editing overlay, keeps links inside the
 * preview and marks responses as private and not indexable.
 */
import { defineMiddleware } from 'astro:middleware';
import { createPreviewClient, sanityClient } from '@/lib/sanity/client';
import { createSanityContext } from '@/lib/sanity/fetch';
import { isPreviewCookieValid, PREVIEW_COOKIE, PREVIEW_PREFIX, rewriteInternalLinks } from '@/lib/preview';
import { cacheOnCdn } from '@/lib/live';

/**
 * Who may frame the preview. frame-ancestors checks every ancestor: the hosted Studio can
 * itself run inside the Sanity Dashboard (www.sanity.io), so both must be allowed.
 */
const STUDIO_ORIGINS = 'https://alessandrodini.sanity.studio https://www.sanity.io https://sanity.io http://localhost:3333';

/** netlify.toml headers do not apply to function responses: same values, set here. */
const PUBLIC_SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  // Public on-demand pages (articles, server islands): fresh data for every render.
  if (!context.url.pathname.startsWith(`${PREVIEW_PREFIX}/`)) {
    context.locals.sanity = createSanityContext(sanityClient, false);
    const response = await next();
    for (const [name, value] of Object.entries(PUBLIC_SECURITY_HEADERS)) response.headers.set(name, value);
    // Server islands (home "latest articles"): headers set inside the island component
    // are not forwarded, so the CDN cache is applied here.
    if (context.url.pathname.startsWith('/_server-islands/') && response.ok) cacheOnCdn(response.headers);
    return response;
  }

  if (await isPreviewCookieValid(context.cookies.get(PREVIEW_COOKIE)?.value)) {
    context.locals.sanity = createSanityContext(createPreviewClient(), true);
    // The overlay injects its own styles and talks to the Sanity API.
    context.csp?.insertStyleResource("'unsafe-inline'");
    context.csp?.insertDirective("connect-src 'self' https://*.sanity.io wss://*.sanity.io");
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Content-Security-Policy', `frame-ancestors ${STUDIO_ORIGINS}`);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (!headers.get('content-type')?.includes('text/html')) {
    return new Response(response.body, { status: response.status, headers });
  }
  const html = rewriteInternalLinks(await response.text());
  headers.delete('content-length');
  return new Response(html, { status: response.status, headers });
});
