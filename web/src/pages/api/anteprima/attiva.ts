/** Called by the Studio's Presentation tool with a one-time secret: turns preview mode on. */
import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { SANITY_API_READ_TOKEN } from 'astro:env/server';
import { sanityClient } from '@/lib/sanity/client';
import { PREVIEW_PREFIX, previewCookieHeader, previewToken } from '@/lib/preview';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const token = await previewToken();
  if (!token || !SANITY_API_READ_TOKEN) {
    return new Response('Preview is not configured (PREVIEW_SECRET, SANITY_API_READ_TOKEN).', { status: 500 });
  }
  const { isValid, redirectTo = `${PREVIEW_PREFIX}/` } = await validatePreviewUrl(
    sanityClient.withConfig({ token: SANITY_API_READ_TOKEN }),
    request.url,
  );
  if (!isValid) return new Response('Invalid preview link.', { status: 401 });

  // Only allow redirects inside the preview area of this site.
  const target = redirectTo.startsWith(`${PREVIEW_PREFIX}/`) ? redirectTo : `${PREVIEW_PREFIX}/`;
  return new Response(null, {
    status: 307,
    headers: { Location: target, 'Set-Cookie': previewCookieHeader(token), 'Cache-Control': 'no-store' },
  });
};
