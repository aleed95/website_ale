/** Turns preview mode off (Presentation tool, or manually). */
import type { APIRoute } from 'astro';
import { previewCookieHeader } from '@/lib/preview';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(null, {
    status: 307,
    headers: { Location: '/', 'Set-Cookie': previewCookieHeader(null), 'Cache-Control': 'no-store' },
  });
