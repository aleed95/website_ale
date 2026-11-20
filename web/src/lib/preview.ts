/**
 * Preview mode ("anteprima"): drafts rendered on demand for the Studio's Presentation tool.
 *
 * The Studio opens /api/anteprima/attiva?…secret…; after validating the secret with
 * Sanity, a cookie signed with PREVIEW_SECRET is set and the browser is sent to the
 * /anteprima/… page. The cookie is cross-site (the Studio frames the site), hence
 * SameSite=None + Partitioned.
 */
import { PREVIEW_SECRET } from 'astro:env/server';

export const PREVIEW_COOKIE = 'anteprima-bozze';
export const PREVIEW_PREFIX = '/anteprima';
const MAX_AGE = 60 * 60 * 8; // 8 hours

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Cookie value: derived from the secret, never the secret itself. */
export async function previewToken(): Promise<string | null> {
  return PREVIEW_SECRET && PREVIEW_SECRET.length >= 16 ? sha256(`${PREVIEW_SECRET}:sanity-preview`) : null;
}

export async function isPreviewCookieValid(value: string | undefined): Promise<boolean> {
  const token = await previewToken();
  return Boolean(token && value && value === token);
}

export function previewCookieHeader(value: string | null): string {
  const base = 'Path=/; HttpOnly; Secure; SameSite=None; Partitioned';
  return value ? `${PREVIEW_COOKIE}=${value}; Max-Age=${MAX_AGE}; ${base}` : `${PREVIEW_COOKIE}=; Max-Age=0; ${base}`;
}

/** Keep navigation inside the preview: /chi-sono/ → /anteprima/chi-sono/. */
export function rewriteInternalLinks(html: string): string {
  return html.replace(
    /href="\/(?!_astro\/|api\/|anteprima\/|favicon|apple-touch|sitemap|robots|in-costruzione)([^"]*)"/g,
    (_match, path: string) => `href="${PREVIEW_PREFIX}/${path}"`,
  );
}
